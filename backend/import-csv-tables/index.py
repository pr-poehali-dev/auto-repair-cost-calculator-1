"""Импорт CSV-таблиц (car_brands, car_models, car_generations, car_modifications) в БД.
POST: {table: "car_brands", rows: [[col0, col1, ...], ...], header: ["id","name",...], mode: "replace"|"merge", chunk: 0, total_chunks: 1}
"""
import json
import os
import psycopg2

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
}

ALLOWED_TABLES = {"car_brands", "car_models", "car_generations", "car_modifications"}

TABLE_COLUMNS = {
    "car_brands": ["id", "name"],
    "car_models": ["id", "brand_id", "name"],
    "car_generations": ["id", "model_id", "name", "years"],
    "car_modifications": [
        "id", "generation_id", "name", "engine", "transmission", "power",
        "body_type", "seats", "length_mm", "width_mm", "height_mm", "wheelbase_mm",
        "track_front_mm", "track_rear_mm", "curb_weight_kg", "wheel_size", "ground_clearance_mm",
        "trunk_max_l", "trunk_min_l", "gross_weight_kg", "disk_size", "clearance_mm",
        "track_front_width_mm", "track_rear_width_mm", "payload_kg", "train_weight_kg",
        "axle_load_kg", "loading_height_mm", "cargo_compartment_dims", "cargo_volume_m3", "bolt_pattern",
        "engine_type", "engine_volume_cc", "power_rpm", "torque_nm", "intake_type",
        "cylinder_layout", "cylinder_count", "compression_ratio", "valves_per_cylinder", "turbo_type",
        "bore_mm", "stroke_mm", "engine_model", "engine_location", "power_kw",
        "torque_rpm", "intercooler", "engine_code", "timing_system", "fuel_consumption_method",
        "gear_count", "drive_type", "turning_diameter_m",
        "fuel_type", "max_speed_kmh", "acceleration_100", "fuel_tank_l", "eco_standard",
        "fuel_city_l", "fuel_highway_l", "fuel_mixed_l", "range_km", "co2_g_km",
        "front_brakes", "rear_brakes", "front_suspension", "rear_suspension",
        "doors_count", "country_of_origin", "vehicle_class", "steering_position",
        "safety_rating", "safety_rating_name",
        "battery_capacity_kwh", "electric_range_km", "charge_time_h", "battery_type",
        "battery_temp_range_c", "fast_charge_time_h", "fast_charge_desc",
        "charge_connector_type", "consumption_kwh_per_100km", "max_charge_power_kw",
        "battery_available_kwh", "charge_cycles",
    ],
}

CLEAR_ORDER = ["car_modifications", "car_generations", "car_models", "car_brands"]


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def handler(event: dict, context) -> dict:
    """Импортирует CSV-данные в таблицы серверной БД (brands, models, generations, modifications)."""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    if event.get("httpMethod") != "POST":
        return {"statusCode": 405, "headers": CORS, "body": json.dumps({"error": "POST only"})}

    body = json.loads(event.get("body") or "{}")
    table = body.get("table", "")
    rows = body.get("rows", [])
    header = body.get("header", [])
    mode = body.get("mode", "merge")
    chunk = body.get("chunk", 0)
    total_chunks = body.get("total_chunks", 1)

    if table not in ALLOWED_TABLES:
        return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": f"Unknown table: {table}"})}

    if not rows:
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"ok": True, "inserted": 0})}

    expected_cols = TABLE_COLUMNS[table]
    header_lower = [h.strip().lower() for h in header]
    col_map = {}
    for col in expected_cols:
        if col in header_lower:
            col_map[col] = header_lower.index(col)

    if "id" not in col_map:
        return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Missing 'id' column in header"})}

    conn = get_conn()
    cur = conn.cursor()

    if mode == "replace" and chunk == 0:
        for t in CLEAR_ORDER:
            cur.execute(f"DELETE FROM {t}")
        conn.commit()

    inserted = 0
    skipped = 0

    def g(row, col_name):
        idx = col_map.get(col_name)
        if idx is None or idx >= len(row):
            return ""
        val = row[idx]
        if val is None:
            return ""
        return str(val).strip()

    batch = []
    for row in rows:
        row_id = g(row, "id")
        if not row_id:
            skipped += 1
            continue

        values = []
        for col in expected_cols:
            values.append(g(row, col) or ("" if col not in ("engine", "transmission", "power") else ""))
        batch.append(tuple(values))

    if batch:
        placeholders = ",".join(["%s"] * len(expected_cols))
        cols_str = ",".join(expected_cols)
        update_cols = [c for c in expected_cols if c != "id"]
        update_str = ",".join(f"{c}=EXCLUDED.{c}" for c in update_cols)
        sql = f"INSERT INTO {table} ({cols_str}) VALUES ({placeholders}) ON CONFLICT (id) DO UPDATE SET {update_str}"
        cur.executemany(sql, batch)
        inserted = len(batch)

    conn.commit()
    cur.close()
    conn.close()

    return {
        "statusCode": 200,
        "headers": {**CORS, "Content-Type": "application/json"},
        "body": json.dumps({
            "ok": True,
            "table": table,
            "inserted": inserted,
            "skipped": skipped,
            "chunk": chunk,
            "total_chunks": total_chunks,
        }),
    }
