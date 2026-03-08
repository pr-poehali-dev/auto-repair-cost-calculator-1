"""
Импорт базы авто из Excel-файла по URL (CDN) в PostgreSQL.
Двухэтапный процесс:
  POST {url, action:"init"} → скачать файл, распарсить, сохранить чанки в S3
  POST {action:"chunk", chunk:0} → загрузить чанк в БД
"""
import json
import os
import re
import io
import boto3
import psycopg2
import openpyxl
import urllib.request

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
}

CHUNK_SIZE = 2000


def slug(s: str) -> str:
    return re.sub(r"[\s()/\\]+", "-", s.lower()).strip("-")


def make_id(*parts: str) -> str:
    return "__".join(slug(p) for p in parts if p)


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def get_s3():
    return boto3.client(
        "s3",
        endpoint_url="https://bucket.poehali.dev",
        aws_access_key_id=os.environ["AWS_ACCESS_KEY_ID"],
        aws_secret_access_key=os.environ["AWS_SECRET_ACCESS_KEY"],
    )


def g(row, i):
    v = row[i] if i < len(row) else None
    s = str(v).strip() if v is not None else ""
    return "" if s in ("None", "none", "") else s


def num(val):
    if val is None or val == "":
        return None
    s = str(val).strip().replace(",", ".").replace(" ", "").replace("\xa0", "")
    if s in ("None", "none", ""):
        return None
    try:
        return float(s)
    except ValueError:
        return None


def make_col_index(header: list) -> dict:
    return {str(h).strip().lower(): i for i, h in enumerate(header)}


INSERT_MOD = """
    INSERT INTO car_modifications (
        id, generation_id, name, engine, transmission, power,
        body_type, seats, length_mm, width_mm, height_mm, wheelbase_mm,
        track_front_mm, track_rear_mm, curb_weight_kg, wheel_size, ground_clearance_mm,
        trunk_max_l, trunk_min_l, gross_weight_kg, disk_size, clearance_mm,
        track_front_width_mm, track_rear_width_mm, payload_kg, train_weight_kg, axle_load_kg,
        loading_height_mm, cargo_compartment_dims, cargo_volume_m3, bolt_pattern,
        engine_type, engine_volume_cc, power_rpm, torque_nm, intake_type,
        cylinder_layout, cylinder_count, compression_ratio, valves_per_cylinder, turbo_type,
        bore_mm, stroke_mm, engine_model, engine_location, power_kw, torque_rpm,
        intercooler, engine_code, timing_system, fuel_consumption_method,
        gear_count, drive_type, turning_diameter_m,
        fuel_type, max_speed_kmh, acceleration_100, fuel_tank_l, eco_standard,
        fuel_city_l, fuel_highway_l, fuel_mixed_l, range_km, co2_g_km,
        front_brakes, rear_brakes, front_suspension, rear_suspension,
        doors_count, country_of_origin, vehicle_class, steering_position,
        safety_rating, safety_rating_name,
        battery_capacity_kwh, electric_range_km, charge_time_h, battery_type,
        battery_temp_range_c, fast_charge_time_h, fast_charge_desc, charge_connector_type,
        consumption_kwh_per_100km, max_charge_power_kw, battery_available_kwh, charge_cycles
    ) VALUES (
        %s,%s,%s,%s,%s,%s,
        %s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,
        %s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,
        %s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,
        %s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,
        %s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s
    ) ON CONFLICT (id) DO UPDATE SET
        name=EXCLUDED.name, engine=EXCLUDED.engine,
        transmission=EXCLUDED.transmission, power=EXCLUDED.power
"""


def process_rows(cur, rows, col_idx):
    brands_batch = []
    models_batch = []
    gens_batch = []
    mods_batch = []
    brands_seen = set()
    models_seen = set()
    gens_seen = set()
    mods_seen = set()
    total = 0
    skipped = 0

    def gc(row, col_name, fallback_i):
        i = col_idx.get(col_name.lower())
        if i is not None:
            return g(row, i)
        return g(row, fallback_i)

    for row in rows:
        brand_name = gc(row, "марка", 0)
        model_name = gc(row, "модель", 1)
        gen_name = gc(row, "поколение", 2)
        year_from = gc(row, "год от (поколение)", 3)
        year_to = gc(row, "год до (поколение)", 4)
        series = gc(row, "серия", 5)
        mod_name = gc(row, "модификация", 6)

        if not brand_name or not model_name or not mod_name:
            skipped += 1
            continue

        years = f"{year_from} — {year_to}" if year_to else year_from
        gen_label = f"{gen_name} {series}".strip() if series else gen_name
        brand_id = slug(brand_name)
        model_id = make_id(brand_id, model_name)
        gen_id = make_id(model_id, gen_label or mod_name)
        mod_id = make_id(gen_id, mod_name)

        if mod_id in mods_seen:
            skipped += 1
            continue

        if brand_id not in brands_seen:
            brands_batch.append((brand_id, brand_name))
            brands_seen.add(brand_id)
        if model_id not in models_seen:
            models_batch.append((model_id, brand_id, model_name))
            models_seen.add(model_id)
        if gen_id not in gens_seen:
            gens_batch.append((gen_id, model_id, gen_label or mod_name, years))
            gens_seen.add(gen_id)

        engine_type = gc(row, "тип двигателя", 32)
        engine_volume_cc = gc(row, "объем двигателя [см3]", 33)
        power_val = gc(row, "мощность двигателя [л.с.]", 34)
        power_rpm_val = gc(row, "обороты максимальной мощности [об/мин]", 35)
        torque_nm = gc(row, "максимальный крутящий момент [н*м]", 36)
        intake_type = gc(row, "тип впуска", 37)
        cylinder_layout = gc(row, "расположение цилиндров", 38)
        cylinder_count = gc(row, "количество цилиндров", 39)
        compression_ratio = gc(row, "степень сжатия", 40)
        valves_per_cylinder = gc(row, "количество клапанов на цилиндр", 41)
        turbo_type = gc(row, "тип наддува", 42)
        bore_mm = gc(row, "диаметр цилиндра [мм]", 43)
        stroke_mm = gc(row, "ход поршня [мм]", 44)
        engine_model = gc(row, "модель двигателя", 45)
        engine_location = gc(row, "расположение двигателя", 46)
        power_kw = gc(row, "максимальная мощность (квт) [квт]", 47)
        torque_rpm_val2 = gc(row, "обороты максимального крутящего момента [об/мин]", 48)
        intercooler = gc(row, "наличие интеркулера", 49)
        engine_code = gc(row, "код двигателя", 50)
        timing_system = gc(row, "грм", 51)
        fuel_consumption_method = gc(row, "методика расчета расхода", 52)
        transmission = gc(row, "тип кпп", 53) or "—"
        gear_count = gc(row, "количество передач", 54)
        drive_type = gc(row, "привод", 55)
        turning_diameter_m = gc(row, "диаметр разворота [м]", 56)
        battery_capacity_kwh = gc(row, "емкость батареи [квт⋅ч]", 77)
        electric_range_km = gc(row, "запас хода на электричестве [км]", 78)
        charge_time_h = gc(row, "время зарядки [ч]", 79)
        battery_type = gc(row, "тип батареи", 80)
        battery_temp_range_c = gc(row, "температурный режим батареи [c]", 81)
        fast_charge_time_h = gc(row, "время быстрой зарядки [ч]", 82)
        fast_charge_desc = gc(row, "описание быстрой зарядки", 83)
        charge_connector_type = gc(row, "тип разъема для зарядки", 84)
        consumption_kwh_per_100km = gc(row, "расход [квт⋅ч/100 км]", 85)
        max_charge_power_kw = gc(row, "максимальная мощность зарядки [квт]", 86)
        battery_available_kwh = gc(row, "ёмкость батареи (доступная) [квт⋅ч]", 87)
        charge_cycles = gc(row, "количество циклов зарядки", 88)

        parts = [p for p in [engine_type, f"{engine_volume_cc} см³" if engine_volume_cc else "", f"{power_val} л.с." if power_val else ""] if p]
        engine = " ".join(parts) if parts else mod_name
        power = power_val or "—"

        body_type = gc(row, "тип кузова", 7)
        seats = gc(row, "количество мест", 8)
        length_mm = gc(row, "длина [мм]", 9)
        width_mm = gc(row, "ширина [мм]", 10)
        height_mm = gc(row, "высота [мм]", 11)
        wheelbase_mm = gc(row, "колёсная база [мм]", 12)
        track_front_mm = gc(row, "колея передняя [мм]", 13)
        track_rear_mm = gc(row, "колея задняя [мм]", 14)
        curb_weight_kg = gc(row, "снаряженная масса [кг]", 15)
        wheel_size = gc(row, "размер колёс", 16)
        ground_clearance_mm = gc(row, "дорожный просвет [мм]", 17)
        trunk_max_l = gc(row, "объем багажника максимальный [л]", 18)
        trunk_min_l = gc(row, "объем багажника минимальный [л]", 19)
        gross_weight_kg = gc(row, "полная масса [кг]", 20)
        disk_size = gc(row, "размер дисков", 21)
        clearance_mm = gc(row, "клиренс [мм]", 22)
        track_front_width_mm = gc(row, "ширина передней колеи [мм]", 23)
        track_rear_width_mm = gc(row, "ширина задней колеи [мм]", 24)
        payload_kg = gc(row, "грузоподъёмность [кг]", 25)
        train_weight_kg = gc(row, "разрешённая масса автопоезда [кг]", 26)
        axle_load_kg = gc(row, "нагрузка на переднюю/заднюю ось [кг]", 27)
        loading_height_mm = gc(row, "погрузочная высота [мм]", 28)
        cargo_compartment_dims = gc(row, "грузовой отсек (длина x ширина x высота) [мм]", 29)
        cargo_volume_m3 = gc(row, "объём грузового отсека [м3]", 30)
        bolt_pattern = gc(row, "сверловка [мм]", 31)
        fuel_type = gc(row, "марка топлива", 57)
        max_speed_kmh = gc(row, "максимальная скорость [км/ч]", 58)
        acceleration_100 = gc(row, "разгон до 100 км/ч [сек]", 59)
        fuel_tank_l = gc(row, "объём топливного бака [л]", 60)
        eco_standard = gc(row, "экологический стандарт", 61)
        fuel_city_l = gc(row, "расход топлива в городе на 100 км [л]", 62)
        fuel_highway_l = gc(row, "расход топлива на шоссе на 100 км [л]", 63)
        fuel_mixed_l = gc(row, "расход топлива в смешанном цикле на 100 км [л]", 64)
        range_km = gc(row, "запас хода [км]", 65)
        co2_g_km = gc(row, "выбросы co2 [г/км]", 66)
        front_brakes = gc(row, "передние тормоза", 67)
        rear_brakes = gc(row, "задние тормоза", 68)
        front_suspension = gc(row, "передняя подвеска", 69)
        rear_suspension = gc(row, "задняя подвеска", 70)
        doors_count = gc(row, "количество дверей", 71)
        country_of_origin = gc(row, "страна марки", 72)
        vehicle_class = gc(row, "класс автомобиля", 73)
        steering_position = gc(row, "расположение руля", 74)
        safety_rating = gc(row, "оценка безопасности", 75)
        safety_rating_name = gc(row, "название рейтинга", 76)

        mods_batch.append((
            mod_id, gen_id, mod_name, engine, transmission, power,
            body_type, num(seats), num(length_mm), num(width_mm), num(height_mm), num(wheelbase_mm),
            num(track_front_mm), num(track_rear_mm), num(curb_weight_kg), wheel_size, num(ground_clearance_mm),
            num(trunk_max_l), num(trunk_min_l), num(gross_weight_kg), disk_size, num(clearance_mm),
            num(track_front_width_mm), num(track_rear_width_mm), num(payload_kg), num(train_weight_kg), num(axle_load_kg),
            num(loading_height_mm), cargo_compartment_dims, num(cargo_volume_m3), bolt_pattern,
            engine_type, num(engine_volume_cc), num(power_rpm_val), num(torque_nm), intake_type,
            cylinder_layout, num(cylinder_count), num(compression_ratio), num(valves_per_cylinder), turbo_type,
            num(bore_mm), num(stroke_mm), engine_model, engine_location, num(power_kw), num(torque_rpm_val2),
            intercooler, engine_code, timing_system, fuel_consumption_method,
            num(gear_count), drive_type, num(turning_diameter_m),
            fuel_type, num(max_speed_kmh), num(acceleration_100), num(fuel_tank_l), eco_standard,
            num(fuel_city_l), num(fuel_highway_l), num(fuel_mixed_l), num(range_km), num(co2_g_km),
            front_brakes, rear_brakes, front_suspension, rear_suspension,
            num(doors_count), country_of_origin, vehicle_class, steering_position,
            num(safety_rating), safety_rating_name,
            num(battery_capacity_kwh), num(electric_range_km), num(charge_time_h), battery_type,
            battery_temp_range_c, num(fast_charge_time_h), fast_charge_desc, charge_connector_type,
            num(consumption_kwh_per_100km), num(max_charge_power_kw), num(battery_available_kwh), num(charge_cycles),
        ))
        mods_seen.add(mod_id)
        total += 1

    if brands_batch:
        cur.executemany("INSERT INTO car_brands (id, name) VALUES (%s, %s) ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name", brands_batch)
    if models_batch:
        cur.executemany("INSERT INTO car_models (id, brand_id, name) VALUES (%s, %s, %s) ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name", models_batch)
    if gens_batch:
        cur.executemany("INSERT INTO car_generations (id, model_id, name, years) VALUES (%s, %s, %s, %s) ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, years=EXCLUDED.years", gens_batch)
    if mods_batch:
        cur.executemany(INSERT_MOD, mods_batch)

    return total, skipped, len(brands_seen)


def handle_download(body):
    """Шаг 1: Скачать файл по URL и сохранить в S3."""
    url = body.get("url", "")
    if not url:
        return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Missing 'url'"})}

    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    resp = urllib.request.urlopen(req, timeout=120)
    file_bytes = resp.read()

    s3 = get_s3()
    s3.put_object(Bucket="files", Key="tmp/import-raw.xlsx", Body=file_bytes, ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")

    return {
        "statusCode": 200,
        "headers": CORS,
        "body": json.dumps({"ok": True, "size": len(file_bytes), "next": "parse"}),
    }


def handle_parse(body):
    """Шаг 2: Прочитать xlsx из S3 и нарезать на JSON-чанки."""
    s3 = get_s3()
    obj = s3.get_object(Bucket="files", Key="tmp/import-raw.xlsx")
    file_bytes = obj["Body"].read()

    wb = openpyxl.load_workbook(io.BytesIO(file_bytes), read_only=True, data_only=True)
    ws = wb.active
    all_rows = [[str(c) if c is not None else "" for c in row] for row in ws.iter_rows(values_only=True)]
    wb.close()

    if len(all_rows) < 2:
        return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Файл пустой"})}

    header_idx = 0
    for i in range(min(5, len(all_rows))):
        if str(all_rows[i][0]).strip().lower() in ("марка", "brand"):
            header_idx = i
            break

    header = all_rows[header_idx]
    data_rows = [r for r in all_rows[header_idx + 1:] if any(c for c in r)]
    total_rows = len(data_rows)
    total_chunks = (total_rows + CHUNK_SIZE - 1) // CHUNK_SIZE

    for ci in range(total_chunks):
        chunk = data_rows[ci * CHUNK_SIZE:(ci + 1) * CHUNK_SIZE]
        s3.put_object(
            Bucket="files",
            Key=f"tmp/import-chunk-{ci}.json",
            Body=json.dumps(chunk, ensure_ascii=False).encode("utf-8"),
            ContentType="application/json",
        )
    s3.put_object(
        Bucket="files",
        Key="tmp/import-meta.json",
        Body=json.dumps({"header": header, "total_rows": total_rows, "total_chunks": total_chunks}, ensure_ascii=False).encode("utf-8"),
        ContentType="application/json",
    )

    return {
        "statusCode": 200,
        "headers": CORS,
        "body": json.dumps({"ok": True, "total_rows": total_rows, "total_chunks": total_chunks}),
    }


def handle_chunk(body):
    """Загрузить один чанк в БД."""
    chunk_idx = int(body.get("chunk", 0))
    s3 = get_s3()

    meta_obj = s3.get_object(Bucket="files", Key="tmp/import-meta.json")
    meta = json.loads(meta_obj["Body"].read())
    header = meta["header"]
    total_chunks = meta["total_chunks"]

    chunk_obj = s3.get_object(Bucket="files", Key=f"tmp/import-chunk-{chunk_idx}.json")
    rows = json.loads(chunk_obj["Body"].read())
    col_idx = make_col_index(header)

    conn = get_conn()
    cur = conn.cursor()

    if chunk_idx == 0:
        cur.execute("TRUNCATE car_modifications, car_generations, car_models, car_brands RESTART IDENTITY CASCADE")

    inserted, skipped, brands = process_rows(cur, rows, col_idx)
    conn.commit()
    cur.close()
    conn.close()

    done = chunk_idx >= total_chunks - 1

    return {
        "statusCode": 200,
        "headers": CORS,
        "body": json.dumps({
            "ok": True,
            "chunk": chunk_idx,
            "total_chunks": total_chunks,
            "inserted": inserted,
            "skipped": skipped,
            "brands": brands,
            "done": done,
        }),
    }


def handler(event: dict, context) -> dict:
    """Импорт авто из Excel на CDN: init (скачать) → chunk (загрузить в БД)."""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    body = json.loads(event.get("body") or "{}")
    action = body.get("action", "init")

    if action == "download":
        return handle_download(body)
    elif action == "parse":
        return handle_parse(body)
    elif action == "chunk":
        return handle_chunk(body)
    else:
        return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": f"Unknown action: {action}. Use: download, parse, chunk"})}