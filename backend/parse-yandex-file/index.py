"""
Читает xlsx из S3 (загруженный fetch-yandex-file), парсит и сохраняет в БД напрямую.
POST { mode: "replace"|"merge" } → { inserted, skipped, total_rows }
"""
import json
import os
import io
import re
import boto3
import openpyxl
import psycopg2

CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
}

S3_KEY = "tmp/yandex-disk-cars.xlsx"
CHUNK_SIZE = 500

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


def slug(s):
    return re.sub(r"[\s()/\\]+", "-", s.lower()).strip("-")


def make_id(*parts):
    return "__".join(slug(p) for p in parts if p)


def g(row, i):
    v = row[i] if i < len(row) else None
    s = str(v).strip() if v is not None else ""
    return "" if s in ("None", "none", "") else s


def gc(row, col_idx, col_name, fallback_i):
    i = col_idx.get(col_name.lower())
    return g(row, i) if i is not None else g(row, fallback_i)


def process_chunk(cur, rows, col_idx, is_first, mode):
    brands_batch, models_batch, gens_batch, mods_batch = [], [], [], []
    brands_seen, models_seen, gens_seen, mods_seen = set(), set(), set(), set()
    total = skipped = 0

    if is_first and mode == "replace":
        cur.execute("TRUNCATE car_modifications, car_generations, car_models, car_brands RESTART IDENTITY CASCADE")

    for row in rows:
        brand_name = gc(row, col_idx, "марка", 0)
        model_name = gc(row, col_idx, "модель", 1)
        gen_name   = gc(row, col_idx, "поколение", 2)
        year_from  = gc(row, col_idx, "год от (поколение)", 3)
        year_to    = gc(row, col_idx, "год до (поколение)", 4)
        series     = gc(row, col_idx, "серия", 5)
        mod_name   = gc(row, col_idx, "модификация", 6)

        if not brand_name or not model_name or not mod_name:
            skipped += 1
            continue

        years     = f"{year_from} — {year_to}" if year_to else year_from
        gen_label = f"{gen_name} {series}".strip() if series else gen_name
        brand_id  = slug(brand_name)
        model_id  = make_id(brand_id, model_name)
        gen_id    = make_id(model_id, gen_label or mod_name)
        mod_id    = make_id(gen_id, mod_name)

        if mod_id in mods_seen:
            skipped += 1
            continue

        if brand_id not in brands_seen:
            brands_batch.append((brand_id, brand_name)); brands_seen.add(brand_id)
        if model_id not in models_seen:
            models_batch.append((model_id, brand_id, model_name)); models_seen.add(model_id)
        if gen_id not in gens_seen:
            gens_batch.append((gen_id, model_id, gen_label or mod_name, years)); gens_seen.add(gen_id)

        def f(name, i): return gc(row, col_idx, name, i)

        engine_type      = f("тип двигателя", 32)
        engine_volume_cc = f("объем двигателя [см3]", 33)
        power_val        = f("мощность двигателя [л.с.]", 34)
        parts = [p for p in [engine_type, f"{engine_volume_cc} см³" if engine_volume_cc else "", f"{power_val} л.с." if power_val else ""] if p]
        engine      = " ".join(parts) if parts else mod_name
        power       = power_val or "—"
        transmission = f("тип кпп", 53) or "—"

        mods_batch.append((
            mod_id, gen_id, mod_name, engine, transmission, power,
            f("тип кузова",7), f("количество мест",8), f("длина [мм]",9), f("ширина [мм]",10),
            f("высота [мм]",11), f("колёсная база [мм]",12), f("колея передняя [мм]",13),
            f("колея задняя [мм]",14), f("снаряженная масса [кг]",15), f("размер колёс",16),
            f("дорожный просвет [мм]",17), f("объем багажника максимальный [л]",18),
            f("объем багажника минимальный [л]",19), f("полная масса [кг]",20),
            f("размер дисков",21), f("клиренс [мм]",22), f("ширина передней колеи [мм]",23),
            f("ширина задней колеи [мм]",24), f("грузоподъёмность [кг]",25),
            f("разрешённая масса автопоезда [кг]",26), f("нагрузка на переднюю/заднюю ось [кг]",27),
            f("погрузочная высота [мм]",28), f("грузовой отсек (длина x ширина x высота) [мм]",29),
            f("объём грузового отсека [м3]",30), f("сверловка [мм]",31),
            engine_type, engine_volume_cc, f("обороты максимальной мощности [об/мин]",35),
            f("максимальный крутящий момент [н*м]",36), f("тип впуска",37),
            f("расположение цилиндров",38), f("количество цилиндров",39), f("степень сжатия",40),
            f("количество клапанов на цилиндр",41), f("тип наддува",42),
            f("диаметр цилиндра [мм]",43), f("ход поршня [мм]",44), f("модель двигателя",45),
            f("расположение двигателя",46), f("максимальная мощность (квт) [квт]",47),
            f("обороты максимального крутящего момента [об/мин]",48), f("наличие интеркулера",49),
            f("код двигателя",50), f("грм",51), f("методика расчета расхода",52),
            f("количество передач",54), f("привод",55), f("диаметр разворота [м]",56),
            f("марка топлива",57), f("максимальная скорость [км/ч]",58),
            f("разгон до 100 км/ч [сек]",59), f("объём топливного бака [л]",60),
            f("экологический стандарт",61), f("расход топлива в городе на 100 км [л]",62),
            f("расход топлива на шоссе на 100 км [л]",63),
            f("расход топлива в смешанном цикле на 100 км [л]",64),
            f("запас хода [км]",65), f("выбросы co2 [г/км]",66),
            f("передние тормоза",67), f("задние тормоза",68),
            f("передняя подвеска",69), f("задняя подвеска",70),
            f("количество дверей",71), f("страна марки",72), f("класс автомобиля",73),
            f("расположение руля",74), f("оценка безопасности",75), f("название рейтинга",76),
            f("емкость батареи [квт⋅ч]",77), f("запас хода на электричестве [км]",78),
            f("время зарядки [ч]",79), f("тип батареи",80), f("температурный режим батареи [c]",81),
            f("время быстрой зарядки [ч]",82), f("описание быстрой зарядки",83),
            f("тип разъема для зарядки",84), f("расход [квт⋅ч/100 км]",85),
            f("максимальная мощность зарядки [квт]",86), f("ёмкость батареи (доступная) [квт⋅ч]",87),
            f("количество циклов зарядки",88),
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

    return total, skipped


def handler(event: dict, context) -> dict:
    """Читает xlsx из S3 и сохраняет в БД напрямую (без HTTP-вызовов к другим функциям)."""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS_HEADERS, "body": ""}

    try:
        body = json.loads(event.get("body") or "{}")
        mode = body.get("mode", "replace")
    except Exception:
        mode = "replace"

    # 1. Читаем файл из S3
    s3 = boto3.client(
        "s3",
        endpoint_url="https://bucket.poehali.dev",
        aws_access_key_id=os.environ["AWS_ACCESS_KEY_ID"],
        aws_secret_access_key=os.environ["AWS_SECRET_ACCESS_KEY"],
    )
    obj = s3.get_object(Bucket="files", Key=S3_KEY)
    file_bytes = obj["Body"].read()

    # 2. Парсим xlsx
    wb = openpyxl.load_workbook(io.BytesIO(file_bytes), read_only=True, data_only=True)
    ws = wb.active
    all_rows = []
    for row in ws.iter_rows(values_only=True):
        all_rows.append([str(c) if c is not None else "" for c in row])
    wb.close()

    if len(all_rows) < 2:
        return {"statusCode": 400, "headers": CORS_HEADERS, "body": json.dumps({"error": "Файл пустой"})}

    header_idx = 0
    for i in range(min(5, len(all_rows))):
        if str(all_rows[i][0]).strip().lower() in ("марка", "brand"):
            header_idx = i
            break

    header_row = all_rows[header_idx]
    col_idx = {str(h).strip().lower(): i for i, h in enumerate(header_row)}
    data_rows = [r for r in all_rows[header_idx + 1:] if any(c != "" for c in r)]

    if not data_rows:
        return {"statusCode": 400, "headers": CORS_HEADERS, "body": json.dumps({"error": "Нет строк с данными"})}

    # 3. Пишем в БД чанками напрямую
    conn = psycopg2.connect(os.environ["DATABASE_URL"])
    cur = conn.cursor()
    total_inserted = total_skipped = 0

    chunks = [data_rows[i:i + CHUNK_SIZE] for i in range(0, len(data_rows), CHUNK_SIZE)]
    for ci, chunk in enumerate(chunks):
        ins, skp = process_chunk(cur, chunk, col_idx, ci == 0, mode)
        conn.commit()
        total_inserted += ins
        total_skipped  += skp

    cur.close()
    conn.close()

    return {
        "statusCode": 200,
        "headers": {**CORS_HEADERS, "Content-Type": "application/json"},
        "body": json.dumps({"inserted": total_inserted, "skipped": total_skipped, "total_rows": len(data_rows)}),
    }
