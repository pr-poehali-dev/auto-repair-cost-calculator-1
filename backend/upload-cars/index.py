"""
Загрузка и парсинг базы автомобилей из Excel-файла (base64).
Поддерживает файлы до 200мб+. Сохраняет данные в PostgreSQL через batch insert.
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

BATCH_SIZE = 500


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

    brands_seen = {}
    models_seen = {}
    gens_seen = {}
    mods_seen = set()

    brands_batch = []
    models_batch = []
    gens_batch = []
    mods_batch = []

    total = 0
    skipped = 0

    def g(row, i):
        v = row[i] if i < len(row) else None
        return str(v).strip() if v is not None and str(v).strip() not in ("None", "") else ""

    def flush_brands():
        if brands_batch:
            cur.executemany(
                "INSERT INTO car_brands (id, name) VALUES (%s, %s) ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name",
                brands_batch
            )
            brands_batch.clear()

    def flush_models():
        if models_batch:
            cur.executemany(
                "INSERT INTO car_models (id, brand_id, name) VALUES (%s, %s, %s) ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name",
                models_batch
            )
            models_batch.clear()

    def flush_gens():
        if gens_batch:
            cur.executemany(
                "INSERT INTO car_generations (id, model_id, name, years) VALUES (%s, %s, %s, %s) ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, years=EXCLUDED.years",
                gens_batch
            )
            gens_batch.clear()

    def flush_mods():
        if mods_batch:
            cur.executemany("""
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
            """, mods_batch)
            mods_batch.clear()

    for row in data_rows:
        brand_name = g(row, 0)
        model_name = g(row, 1)
        gen_name = g(row, 2)
        year_from = g(row, 3)
        year_to = g(row, 4)
        series = g(row, 5)
        mod_name = g(row, 6)

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
            brands_seen[brand_id] = True

        if model_id not in models_seen:
            models_batch.append((model_id, brand_id, model_name))
            models_seen[model_id] = True

        if gen_id not in gens_seen:
            gens_batch.append((gen_id, model_id, gen_label or mod_name, years))
            gens_seen[gen_id] = True

        body_type = g(row, 7); seats = g(row, 8)
        length_mm = g(row, 9); width_mm = g(row, 10); height_mm = g(row, 11); wheelbase_mm = g(row, 12)
        track_front_mm = g(row, 13); track_rear_mm = g(row, 14); curb_weight_kg = g(row, 15)
        wheel_size = g(row, 16); ground_clearance_mm = g(row, 17)
        trunk_max_l = g(row, 18); trunk_min_l = g(row, 19); gross_weight_kg = g(row, 20)
        disk_size = g(row, 21); clearance_mm = g(row, 22)
        track_front_width_mm = g(row, 23); track_rear_width_mm = g(row, 24)
        payload_kg = g(row, 25); train_weight_kg = g(row, 26); axle_load_kg = g(row, 27)
        loading_height_mm = g(row, 28); cargo_compartment_dims = g(row, 29); cargo_volume_m3 = g(row, 30)
        bolt_pattern = g(row, 31)
        engine_type = g(row, 32); engine_volume_cc = g(row, 33)
        power_val = g(row, 34); power_rpm = g(row, 35); torque_nm = g(row, 36)
        intake_type = g(row, 37); cylinder_layout = g(row, 38); cylinder_count = g(row, 39)
        compression_ratio = g(row, 40); valves_per_cylinder = g(row, 41); turbo_type = g(row, 42)
        bore_mm = g(row, 43); stroke_mm = g(row, 44); engine_model = g(row, 45)
        engine_location = g(row, 46); power_kw = g(row, 47); torque_rpm = g(row, 48)
        intercooler = g(row, 49); engine_code = g(row, 50); timing_system = g(row, 51)
        fuel_consumption_method = g(row, 52)
        transmission = g(row, 53) or "—"; gear_count = g(row, 54)
        drive_type = g(row, 55); turning_diameter_m = g(row, 56)
        fuel_type = g(row, 57); max_speed_kmh = g(row, 58); acceleration_100 = g(row, 59)
        fuel_tank_l = g(row, 60); eco_standard = g(row, 61)
        fuel_city_l = g(row, 62); fuel_highway_l = g(row, 63); fuel_mixed_l = g(row, 64)
        range_km = g(row, 65); co2_g_km = g(row, 66)
        front_brakes = g(row, 67); rear_brakes = g(row, 68)
        front_suspension = g(row, 69); rear_suspension = g(row, 70)
        doors_count = g(row, 71); country_of_origin = g(row, 72)
        vehicle_class = g(row, 73); steering_position = g(row, 74)
        safety_rating = g(row, 75); safety_rating_name = g(row, 76)
        battery_capacity_kwh = g(row, 77); electric_range_km = g(row, 78)
        charge_time_h = g(row, 79); battery_type = g(row, 80)
        battery_temp_range_c = g(row, 81); fast_charge_time_h = g(row, 82)
        fast_charge_desc = g(row, 83); charge_connector_type = g(row, 84)
        consumption_kwh_per_100km = g(row, 85); max_charge_power_kw = g(row, 86)
        battery_available_kwh = g(row, 87); charge_cycles = g(row, 88)

        parts = [p for p in [engine_type, f"{engine_volume_cc} см³" if engine_volume_cc else "", f"{power_val} л.с." if power_val else ""] if p]
        engine = " ".join(parts) if parts else mod_name
        power = power_val or "—"

        mods_batch.append((
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

        if len(mods_batch) >= BATCH_SIZE:
            flush_brands()
            flush_models()
            flush_gens()
            flush_mods()
            conn.commit()

    flush_brands()
    flush_models()
    flush_gens()
    flush_mods()
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
