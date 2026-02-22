"""
Загрузка и парсинг базы автомобилей из Excel-файла (base64).
Поддерживает файлы до 200мб+. Сохраняет данные в PostgreSQL.
Метод: POST — загрузить/заменить, DELETE — очистить базу.
"""
import json
import base64
import os
import io
import re
import psycopg2
import openpyxl

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
}


def slug(s: str) -> str:
    return re.sub(r"[\s()/\\]+", "-", s.lower()).strip("-")


def make_id(*parts: str) -> str:
    return "__".join(slug(p) for p in parts if p)


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def clear_db(cur):
    cur.execute("TRUNCATE car_modifications, car_generations, car_models, car_brands RESTART IDENTITY CASCADE")


def parse_and_save(wb, mode: str) -> dict:
    ws = wb.active
    rows = list(ws.iter_rows(values_only=True))
    if not rows:
        return {"error": "Файл пустой"}

    # Пропускаем заголовок
    header_row = 0
    for i, row in enumerate(rows[:5]):
        if row[0] and str(row[0]).strip().lower() in ("марка", "brand"):
            header_row = i
            break
    data_rows = rows[header_row + 1:]

    conn = get_conn()
    cur = conn.cursor()

    if mode == "replace":
        clear_db(cur)

    brands_seen = set()
    models_seen = set()
    gens_seen = set()
    mods_seen = set()

    total = 0
    skipped = 0

    for row in data_rows:
        def g(i):
            v = row[i] if i < len(row) else None
            return str(v).strip() if v is not None and str(v).strip() not in ("None", "") else ""

        brand_name = g(0)
        model_name = g(1)
        gen_name = g(2)
        year_from = g(3)
        year_to = g(4)
        series = g(5)
        mod_name = g(6)

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
            cur.execute(
                "INSERT INTO car_brands (id, name) VALUES (%s, %s) ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name",
                (brand_id, brand_name)
            )
            brands_seen.add(brand_id)

        if model_id not in models_seen:
            cur.execute(
                "INSERT INTO car_models (id, brand_id, name) VALUES (%s, %s, %s) ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name",
                (model_id, brand_id, model_name)
            )
            models_seen.add(model_id)

        if gen_id not in gens_seen:
            cur.execute(
                "INSERT INTO car_generations (id, model_id, name, years) VALUES (%s, %s, %s, %s) ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, years=EXCLUDED.years",
                (gen_id, model_id, gen_label or mod_name, years)
            )
            gens_seen.add(gen_id)

        # cols 7-31: кузов
        body_type = g(7); seats = g(8)
        length_mm = g(9); width_mm = g(10); height_mm = g(11); wheelbase_mm = g(12)
        track_front_mm = g(13); track_rear_mm = g(14); curb_weight_kg = g(15)
        wheel_size = g(16); ground_clearance_mm = g(17)
        trunk_max_l = g(18); trunk_min_l = g(19); gross_weight_kg = g(20)
        disk_size = g(21); clearance_mm = g(22)
        track_front_width_mm = g(23); track_rear_width_mm = g(24)
        payload_kg = g(25); train_weight_kg = g(26); axle_load_kg = g(27)
        loading_height_mm = g(28); cargo_compartment_dims = g(29); cargo_volume_m3 = g(30)
        bolt_pattern = g(31)
        # cols 32-52: двигатель
        engine_type = g(32); engine_volume_cc = g(33)
        power_val = g(34); power_rpm = g(35); torque_nm = g(36)
        intake_type = g(37); cylinder_layout = g(38); cylinder_count = g(39)
        compression_ratio = g(40); valves_per_cylinder = g(41); turbo_type = g(42)
        bore_mm = g(43); stroke_mm = g(44); engine_model = g(45)
        engine_location = g(46); power_kw = g(47); torque_rpm = g(48)
        intercooler = g(49); engine_code = g(50); timing_system = g(51)
        fuel_consumption_method = g(52)
        # cols 53-56: трансмиссия
        transmission = g(53) or "—"; gear_count = g(54)
        drive_type = g(55); turning_diameter_m = g(56)
        # cols 57-66: эксплуатация
        fuel_type = g(57); max_speed_kmh = g(58); acceleration_100 = g(59)
        fuel_tank_l = g(60); eco_standard = g(61)
        fuel_city_l = g(62); fuel_highway_l = g(63); fuel_mixed_l = g(64)
        range_km = g(65); co2_g_km = g(66)
        # cols 67-70: тормоза/подвеска
        front_brakes = g(67); rear_brakes = g(68)
        front_suspension = g(69); rear_suspension = g(70)
        # cols 71-76: прочее
        doors_count = g(71); country_of_origin = g(72)
        vehicle_class = g(73); steering_position = g(74)
        safety_rating = g(75); safety_rating_name = g(76)
        # cols 77-88: электромобиль
        battery_capacity_kwh = g(77); electric_range_km = g(78)
        charge_time_h = g(79); battery_type = g(80)
        battery_temp_range_c = g(81); fast_charge_time_h = g(82)
        fast_charge_desc = g(83); charge_connector_type = g(84)
        consumption_kwh_per_100km = g(85); max_charge_power_kw = g(86)
        battery_available_kwh = g(87); charge_cycles = g(88)

        # Формируем engine-строку
        parts = [p for p in [engine_type, f"{engine_volume_cc} см³" if engine_volume_cc else "", f"{power_val} л.с." if power_val else ""] if p]
        engine = " ".join(parts) if parts else mod_name
        power = power_val or "—"

        cur.execute("""
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
        """, (
            mod_id, gen_id, mod_name, engine, transmission, power,
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
            consumption_kwh_per_100km, max_charge_power_kw, battery_available_kwh, charge_cycles,
        ))
        mods_seen.add(mod_id)
        total += 1

    conn.commit()
    cur.close()
    conn.close()

    return {
        "brands": len(brands_seen),
        "models": len(models_seen),
        "generations": len(gens_seen),
        "modifications": total,
        "skipped": skipped,
    }


def handler(event: dict, context) -> dict:
    """Загрузка базы авто из Excel. POST: {file_b64, mode='replace'|'merge'}. DELETE: очистить."""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod", "POST")

    if method == "DELETE":
        conn = get_conn()
        cur = conn.cursor()
        cur.execute("TRUNCATE car_modifications, car_generations, car_models, car_brands RESTART IDENTITY CASCADE")
        conn.commit()
        cur.close()
        conn.close()
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"ok": True})}

    if method != "POST":
        return {"statusCode": 405, "headers": CORS, "body": json.dumps({"error": "Method not allowed"})}

    body = json.loads(event.get("body") or "{}")
    file_b64 = body.get("file_b64", "")
    mode = body.get("mode", "replace")

    if not file_b64:
        return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Нет файла"})}

    file_bytes = base64.b64decode(file_b64)
    wb = openpyxl.load_workbook(io.BytesIO(file_bytes), read_only=True, data_only=True)

    result = parse_and_save(wb, mode)
    wb.close()

    if "error" in result:
        return {"statusCode": 400, "headers": CORS, "body": json.dumps(result)}

    return {"statusCode": 200, "headers": CORS, "body": json.dumps(result)}