"""
Получение базы автомобилей из PostgreSQL.
GET /                — мета: количество марок и чанков
GET /?count=1        — количество записей
GET /?brands=1       — только марки
GET /?brand_id=X     — дерево одной марки (модели → поколения, без модификаций)
GET /?model_id=X     — поколения одной модели
GET /?gen_id=X       — модификации одного поколения (лёгкие поля)
GET /?gen_id=X&full=1— модификации одного поколения (все поля)
GET /?tree=1         — полный каркас (марки → модели → поколения, без модификаций)
GET /?chunk=0        — чанк каркаса по N марок
"""
import json
import os
import psycopg2

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
}

MOD_COLUMNS = """id, name, engine, transmission, power,
    body_type, seats, length_mm, width_mm, height_mm, wheelbase_mm,
    track_front_mm, track_rear_mm, curb_weight_kg, wheel_size, ground_clearance_mm,
    trunk_max_l, trunk_min_l, gross_weight_kg, disk_size, clearance_mm,
    track_front_width_mm, track_rear_width_mm, payload_kg, train_weight_kg,
    axle_load_kg, loading_height_mm, cargo_compartment_dims, cargo_volume_m3, bolt_pattern,
    engine_type, engine_volume_cc, power_rpm, torque_nm, intake_type,
    cylinder_layout, cylinder_count, compression_ratio, valves_per_cylinder, turbo_type,
    bore_mm, stroke_mm, engine_model, engine_location, power_kw, torque_rpm,
    intercooler, engine_code, timing_system, fuel_consumption_method,
    gear_count, drive_type, turning_diameter_m,
    fuel_type, max_speed_kmh, acceleration_100, fuel_tank_l, eco_standard,
    fuel_city_l, fuel_highway_l, fuel_mixed_l, range_km, co2_g_km,
    front_brakes, rear_brakes, front_suspension, rear_suspension,
    doors_count, country_of_origin, vehicle_class, steering_position,
    safety_rating, safety_rating_name"""

LIGHT_MOD_COLS = "id, name, engine, transmission, power, engine_type, engine_code, drive_type, turbo_type, front_brakes, rear_brakes, front_suspension, rear_suspension"


FILTER_PARAM_MAP = {
    "engineType": "engineType",
    "transmission": "transmission",
    "frontBrakes": "frontBrakes",
    "rearBrakes": "rearBrakes",
    "driveType": "driveType",
    "frontSuspension": "frontSuspension",
    "rearSuspension": "rearSuspension",
    "turboType": "turboType",
}


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def is_work_available(work_name, mod, work_filters):
    for wf in work_filters:
        if wf.get("workName") != work_name:
            continue
        active_rules = [r for r in wf.get("rules", []) if r.get("allowedValues")]
        if not active_rules:
            continue
        for rule in active_rules:
            param = rule["param"]
            mod_key = FILTER_PARAM_MAP.get(param, param)
            mod_val = (mod.get(mod_key) or "").strip()
            if not mod_val or mod_val == "\u2014":
                continue
            if mod_val not in rule["allowedValues"]:
                return False
    return True


def merge_all_works(mods, cur):
    cur.execute("SELECT id, name FROM works ORDER BY sort_order, created_at")
    all_works = [{"id": r[0], "name": r[1]} for r in cur.fetchall()]
    if not all_works:
        return

    cur.execute("SELECT value FROM admin_data WHERE key = 'work_filters'")
    row = cur.fetchone()
    work_filters = []
    if row and row[0]:
        val = row[0]
        work_filters = json.loads(val) if isinstance(val, str) else val

    for m in mods:
        existing_names = {w["name"] for w in m["works"]}
        for work in all_works:
            if work["name"] in existing_names:
                continue
            if is_work_available(work["name"], m, work_filters):
                m["works"].append({
                    "id": f"w-{m['id']}-{work['name']}",
                    "name": work["name"],
                    "hours": 0,
                })


def mod_to_dict(m):
    return {
        "id": m["id"], "name": m["name"],
        "engine": m["engine"] or "", "transmission": m["transmission"] or "—", "power": m["power"] or "—",
        "bodyType": m.get("body_type"), "seats": m.get("seats"),
        "lengthMm": m.get("length_mm"), "widthMm": m.get("width_mm"), "heightMm": m.get("height_mm"),
        "wheelbaseMm": m.get("wheelbase_mm"), "trackFrontMm": m.get("track_front_mm"), "trackRearMm": m.get("track_rear_mm"),
        "curbWeightKg": m.get("curb_weight_kg"), "wheelSize": m.get("wheel_size"), "groundClearanceMm": m.get("ground_clearance_mm"),
        "trunkMaxL": m.get("trunk_max_l"), "trunkMinL": m.get("trunk_min_l"), "grossWeightKg": m.get("gross_weight_kg"),
        "diskSize": m.get("disk_size"), "clearanceMm": m.get("clearance_mm"),
        "trackFrontWidthMm": m.get("track_front_width_mm"), "trackRearWidthMm": m.get("track_rear_width_mm"),
        "payloadKg": m.get("payload_kg"), "trainWeightKg": m.get("train_weight_kg"), "axleLoadKg": m.get("axle_load_kg"),
        "loadingHeightMm": m.get("loading_height_mm"), "cargoCompartmentDims": m.get("cargo_compartment_dims"),
        "cargoVolumeM3": m.get("cargo_volume_m3"), "boltPattern": m.get("bolt_pattern"),
        "engineType": m.get("engine_type") or "", "engineVolumeCC": m.get("engine_volume_cc"),
        "powerRpm": m.get("power_rpm"), "torqueNm": m.get("torque_nm"), "intakeType": m.get("intake_type"),
        "cylinderLayout": m.get("cylinder_layout"), "cylinderCount": m.get("cylinder_count"),
        "compressionRatio": m.get("compression_ratio"), "valvesPerCylinder": m.get("valves_per_cylinder"),
        "turboType": m.get("turbo_type"), "boreMm": m.get("bore_mm"), "strokeMm": m.get("stroke_mm"),
        "engineModel": m.get("engine_model"), "engineLocation": m.get("engine_location"),
        "powerKw": m.get("power_kw"), "torqueRpm": m.get("torque_rpm"), "intercooler": m.get("intercooler"),
        "engineCode": m.get("engine_code") or "", "timingSystem": m.get("timing_system"),
        "fuelConsumptionMethod": m.get("fuel_consumption_method"),
        "gearCount": m.get("gear_count"), "driveType": m.get("drive_type") or "",
        "turningDiameterM": m.get("turning_diameter_m"),
        "fuelType": m.get("fuel_type"), "maxSpeedKmh": m.get("max_speed_kmh"), "acceleration100": m.get("acceleration_100"),
        "fuelTankL": m.get("fuel_tank_l"), "ecoStandard": m.get("eco_standard"),
        "fuelCityL": m.get("fuel_city_l"), "fuelHighwayL": m.get("fuel_highway_l"), "fuelMixedL": m.get("fuel_mixed_l"),
        "rangeKm": m.get("range_km"), "co2GKm": m.get("co2_g_km"),
        "frontBrakes": m.get("front_brakes"), "rearBrakes": m.get("rear_brakes"),
        "frontSuspension": m.get("front_suspension"), "rearSuspension": m.get("rear_suspension"),
        "doorsCount": m.get("doors_count"), "countryOfOrigin": m.get("country_of_origin"),
        "vehicleClass": m.get("vehicle_class"), "steeringPosition": m.get("steering_position"),
        "safetyRating": m.get("safety_rating"), "safetyRatingName": m.get("safety_rating_name"),
        "works": [],
    }


def mod_to_light(r):
    return {
        "id": r[0], "name": r[1],
        "engine": r[2] or "", "transmission": r[3] or "—", "power": r[4] or "—",
        "engineType": r[5] or "", "engineCode": r[6] or "", "driveType": r[7] or "",
        "turboType": r[8] or "", "frontBrakes": r[9] or "", "rearBrakes": r[10] or "",
        "frontSuspension": r[11] or "", "rearSuspension": r[12] or "",
        "works": [],
    }


def build_skeleton(cur, brand_ids):
    """Строит каркас: марки → модели → поколения (без модификаций)."""
    if not brand_ids:
        return []

    placeholders = ",".join(["%s"] * len(brand_ids))

    cur.execute(f"SELECT id, name FROM car_brands WHERE id IN ({placeholders}) ORDER BY name", brand_ids)
    brands = {r[0]: {"id": r[0], "name": r[1], "models": []} for r in cur.fetchall()}

    cur.execute(f"SELECT id, brand_id, name FROM car_models WHERE brand_id IN ({placeholders}) ORDER BY name", brand_ids)
    models = {}
    for r in cur.fetchall():
        models[r[0]] = {"id": r[0], "name": r[2], "generations": []}
        if r[1] in brands:
            brands[r[1]]["models"].append(models[r[0]])

    if models:
        model_ids = list(models.keys())
        mp = ",".join(["%s"] * len(model_ids))
        cur.execute(f"SELECT id, model_id, name, years FROM car_generations WHERE model_id IN ({mp}) ORDER BY name", model_ids)
        for r in cur.fetchall():
            gen = {"id": r[0], "name": r[2], "years": r[3], "modifications": []}
            if r[1] in models:
                models[r[1]]["generations"].append(gen)

    return list(brands.values())


def handler(event: dict, context) -> dict:
    """Возвращает базу автомобилей из БД."""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    params = event.get("queryStringParameters") or {}
    conn = get_conn()
    cur = conn.cursor()

    if params.get("count"):
        cur.execute("SELECT COUNT(*) FROM car_modifications")
        cnt = cur.fetchone()[0]
        cur.execute("SELECT COUNT(*) FROM car_brands")
        brands_cnt = cur.fetchone()[0]
        cur.close(); conn.close()
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"modifications": cnt, "brands": brands_cnt})}

    if params.get("distinct_values"):
        ALLOWED_COLS = {
            "engine_type", "transmission", "front_brakes", "rear_brakes",
            "drive_type", "front_suspension", "rear_suspension", "turbo_type",
        }
        result = {}
        for col in ALLOWED_COLS:
            cur.execute(
                f"SELECT DISTINCT UPPER(LEFT(TRIM({col}), 1)) || SUBSTRING(TRIM({col}) FROM 2) AS val "
                f"FROM car_modifications "
                f"WHERE {col} IS NOT NULL AND TRIM({col}) != '' AND TRIM({col}) != '—' "
                f"ORDER BY val"
            )
            result[col] = [r[0] for r in cur.fetchall()]
        cur.close(); conn.close()
        camel = {
            "engine_type": "engineType", "transmission": "transmission",
            "front_brakes": "frontBrakes", "rear_brakes": "rearBrakes",
            "drive_type": "driveType", "front_suspension": "frontSuspension",
            "rear_suspension": "rearSuspension", "turbo_type": "turboType",
        }
        out = {camel.get(k, k): v for k, v in result.items()}
        return {"statusCode": 200, "headers": CORS, "body": json.dumps(out)}

    if params.get("brands"):
        cur.execute("SELECT id, name FROM car_brands ORDER BY name")
        rows = cur.fetchall()
        cur.close(); conn.close()
        return {"statusCode": 200, "headers": CORS, "body": json.dumps([{"id": r[0], "name": r[1]} for r in rows])}

    if params.get("brand_id"):
        result = build_skeleton(cur, [params["brand_id"]])
        cur.close(); conn.close()
        return {"statusCode": 200, "headers": CORS, "body": json.dumps(result[0] if result else {})}

    if params.get("model_id"):
        mid = params["model_id"]
        cur.execute("SELECT id, name, years FROM car_generations WHERE model_id=%s ORDER BY name", (mid,))
        rows = cur.fetchall()
        cur.close(); conn.close()
        return {"statusCode": 200, "headers": CORS, "body": json.dumps([{"id": r[0], "name": r[1], "years": r[2]} for r in rows])}

    if params.get("gen_id"):
        gid = params["gen_id"]
        if params.get("full"):
            cur.execute(f"SELECT {MOD_COLUMNS} FROM car_modifications WHERE generation_id=%s ORDER BY name", (gid,))
            cols = [d[0] for d in cur.description]
            rows = cur.fetchall()
            cur.close(); conn.close()
            return {"statusCode": 200, "headers": CORS, "body": json.dumps([mod_to_dict(dict(zip(cols, row))) for row in rows])}
        else:
            cur.execute(f"SELECT {LIGHT_MOD_COLS} FROM car_modifications WHERE generation_id=%s ORDER BY name", (gid,))
            rows = cur.fetchall()
            mods = [mod_to_light(row) for row in rows]
            mod_ids = [m["id"] for m in mods]
            if mod_ids:
                ph = ",".join(["%s"] * len(mod_ids))
                cur.execute(f"SELECT modification_id, work_name, hours FROM modification_works WHERE modification_id IN ({ph}) ORDER BY work_name", mod_ids)
                for wr in cur.fetchall():
                    for m in mods:
                        if m["id"] == wr[0]:
                            m["works"].append({"id": f"w-{wr[0]}-{wr[1]}", "name": wr[1], "hours": float(wr[2])})
                            break
            merge_all_works(mods, cur)
            cur.close(); conn.close()
            return {"statusCode": 200, "headers": CORS, "body": json.dumps(mods)}

    if params.get("tree"):
        cur.execute("SELECT id FROM car_brands ORDER BY name")
        all_brand_ids = [r[0] for r in cur.fetchall()]
        tree = build_skeleton(cur, all_brand_ids)
        cur.close(); conn.close()
        return {"statusCode": 200, "headers": CORS, "body": json.dumps(tree)}

    chunk = params.get("chunk")
    chunk_size = int(params.get("chunk_size", "10"))

    cur.execute("SELECT id FROM car_brands ORDER BY name")
    all_brand_ids = [r[0] for r in cur.fetchall()]
    total_brands = len(all_brand_ids)
    total_chunks = (total_brands + chunk_size - 1) // chunk_size

    if chunk is not None:
        idx = int(chunk)
        start = idx * chunk_size
        brand_ids = all_brand_ids[start:start + chunk_size]
        tree = build_skeleton(cur, brand_ids)
        cur.close(); conn.close()
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({
            "brands": tree,
            "chunk": idx,
            "total_chunks": total_chunks,
            "total_brands": total_brands,
        })}

    cur.close(); conn.close()
    return {"statusCode": 200, "headers": CORS, "body": json.dumps({
        "total_brands": total_brands,
        "total_chunks": total_chunks,
        "chunk_size": chunk_size,
    })}