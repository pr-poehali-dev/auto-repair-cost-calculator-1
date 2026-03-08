"""Экспорт таблиц БД по одной с автоматической нарезкой на порции до ~4.5МБ."""
import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
}

MAX_BODY_BYTES = 4_500_000

TABLES = {
    "admin_data": "SELECT key, value, updated_at::text as updated_at FROM admin_data ORDER BY key",
    "car_brands": "SELECT id, name FROM car_brands ORDER BY name",
    "car_models": "SELECT id, brand_id, name FROM car_models ORDER BY name",
    "car_generations": "SELECT id, model_id, name, years FROM car_generations ORDER BY name",
    "car_modifications": """SELECT id, generation_id, name, engine, transmission, power,
        body_type, seats, length_mm, width_mm, height_mm, wheelbase_mm,
        track_front_mm, track_rear_mm, curb_weight_kg, wheel_size, ground_clearance_mm,
        trunk_max_l, trunk_min_l, gross_weight_kg, disk_size, clearance_mm,
        track_front_width_mm, track_rear_width_mm, payload_kg, train_weight_kg,
        axle_load_kg, loading_height_mm, cargo_compartment_dims, cargo_volume_m3, bolt_pattern,
        engine_type, engine_volume_cc, power_rpm, torque_nm, intake_type,
        cylinder_layout, cylinder_count, compression_ratio, valves_per_cylinder, turbo_type,
        bore_mm, stroke_mm, engine_model, engine_location, power_kw,
        torque_rpm, intercooler, engine_code, timing_system, fuel_consumption_method,
        gear_count, drive_type, turning_diameter_m,
        fuel_type, max_speed_kmh, acceleration_100, fuel_tank_l, eco_standard,
        fuel_city_l, fuel_highway_l, fuel_mixed_l, range_km, co2_g_km,
        front_brakes, rear_brakes, front_suspension, rear_suspension,
        doors_count, country_of_origin, vehicle_class, steering_position,
        safety_rating, safety_rating_name,
        battery_capacity_kwh, electric_range_km, charge_time_h, battery_type,
        battery_temp_range_c, fast_charge_time_h, fast_charge_desc,
        charge_connector_type, consumption_kwh_per_100km, max_charge_power_kw,
        battery_available_kwh, charge_cycles
        FROM car_modifications ORDER BY id""",
}


def handler(event: dict, context) -> dict:
    """Выгружает таблицу БД порциями до 4.5МБ. Фронт запрашивает offset/limit, сервер вернёт сколько влезет."""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    params = event.get("queryStringParameters") or {}
    table = params.get("table", "")
    offset = int(params.get("offset", "0"))
    limit = int(params.get("limit", "5000"))

    if not table:
        return {
            "statusCode": 200,
            "headers": {**CORS, "Content-Type": "application/json"},
            "body": json.dumps({"tables": list(TABLES.keys())}),
        }

    if table not in TABLES:
        return {
            "statusCode": 400,
            "headers": CORS,
            "body": json.dumps({"error": f"Unknown table: {table}"}),
        }

    conn = psycopg2.connect(os.environ["DATABASE_URL"])
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute(f"SELECT COUNT(*) as cnt FROM {table}")
    total = cur.fetchone()["cnt"]

    query = TABLES[table] + f" LIMIT {limit} OFFSET {offset}"
    cur.execute(query)
    all_rows = [dict(r) for r in cur.fetchall()]

    cur.close()
    conn.close()

    envelope_overhead = 200
    rows_to_send = []
    current_size = envelope_overhead

    for row in all_rows:
        row_json = json.dumps(row, default=str, ensure_ascii=False)
        row_size = len(row_json.encode("utf-8")) + 2
        if current_size + row_size > MAX_BODY_BYTES and rows_to_send:
            break
        rows_to_send.append(row)
        current_size += row_size

    returned = len(rows_to_send)

    return {
        "statusCode": 200,
        "headers": {**CORS, "Content-Type": "application/json"},
        "body": json.dumps({
            "table": table,
            "total": total,
            "offset": offset,
            "limit": limit,
            "returned": returned,
            "rows": rows_to_send,
        }, default=str, ensure_ascii=False),
    }
