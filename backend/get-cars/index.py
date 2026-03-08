"""
Получение базы автомобилей из PostgreSQL.
GET /            — полное дерево (brands → models → generations → modifications)
GET /?brands=1   — только марки (быстро)
GET /?brand_id=toyota — модели одной марки
GET /?model_id=toyota__camry — поколения одной модели
GET /?gen_id=... — модификации одного поколения
GET /?count=1    — только количество записей
"""
import json
import os
import psycopg2

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
}


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def handler(event: dict, context) -> dict:
    """Возвращает базу автомобилей из БД."""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    params = event.get("queryStringParameters") or {}
    conn = get_conn()
    cur = conn.cursor()

    # Только счётчик
    if params.get("count"):
        cur.execute("SELECT COUNT(*) FROM car_modifications")
        cnt = cur.fetchone()[0]
        cur.execute("SELECT COUNT(*) FROM car_brands")
        brands = cur.fetchone()[0]
        cur.close(); conn.close()
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"modifications": cnt, "brands": brands})}

    # Только марки
    if params.get("brands"):
        cur.execute("SELECT id, name FROM car_brands ORDER BY name")
        rows = cur.fetchall()
        cur.close(); conn.close()
        return {"statusCode": 200, "headers": CORS, "body": json.dumps([{"id": r[0], "name": r[1]} for r in rows])}

    # Модели одной марки
    if params.get("brand_id"):
        bid = params["brand_id"]
        cur.execute("SELECT id, name FROM car_models WHERE brand_id=%s ORDER BY name", (bid,))
        rows = cur.fetchall()
        cur.close(); conn.close()
        return {"statusCode": 200, "headers": CORS, "body": json.dumps([{"id": r[0], "name": r[1]} for r in rows])}

    # Поколения одной модели
    if params.get("model_id"):
        mid = params["model_id"]
        cur.execute("SELECT id, name, years FROM car_generations WHERE model_id=%s ORDER BY name", (mid,))
        rows = cur.fetchall()
        cur.close(); conn.close()
        return {"statusCode": 200, "headers": CORS, "body": json.dumps([{"id": r[0], "name": r[1], "years": r[2]} for r in rows])}

    # Модификации одного поколения
    if params.get("gen_id"):
        gid = params["gen_id"]
        cur.execute("""
            SELECT id, name, engine, transmission, power,
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
                safety_rating, safety_rating_name
            FROM car_modifications WHERE generation_id=%s ORDER BY name
        """, (gid,))
        cols = [d[0] for d in cur.description]
        rows = cur.fetchall()
        cur.close(); conn.close()
        result = []
        for row in rows:
            m = dict(zip(cols, row))
            m["works"] = []
            # camelCase mapping for frontend compatibility
            result.append({
                "id": m["id"], "name": m["name"],
                "engine": m["engine"] or "", "transmission": m["transmission"] or "—", "power": m["power"] or "—",
                "bodyType": m["body_type"], "seats": m["seats"],
                "lengthMm": m["length_mm"], "widthMm": m["width_mm"], "heightMm": m["height_mm"],
                "wheelbaseMm": m["wheelbase_mm"], "trackFrontMm": m["track_front_mm"], "trackRearMm": m["track_rear_mm"],
                "curbWeightKg": m["curb_weight_kg"], "wheelSize": m["wheel_size"], "groundClearanceMm": m["ground_clearance_mm"],
                "trunkMaxL": m["trunk_max_l"], "trunkMinL": m["trunk_min_l"], "grossWeightKg": m["gross_weight_kg"],
                "diskSize": m["disk_size"], "clearanceMm": m["clearance_mm"],
                "trackFrontWidthMm": m["track_front_width_mm"], "trackRearWidthMm": m["track_rear_width_mm"],
                "payloadKg": m["payload_kg"], "trainWeightKg": m["train_weight_kg"], "axleLoadKg": m["axle_load_kg"],
                "loadingHeightMm": m["loading_height_mm"], "cargoCompartmentDims": m["cargo_compartment_dims"],
                "cargoVolumeM3": m["cargo_volume_m3"], "boltPattern": m["bolt_pattern"],
                "engineType": m["engine_type"], "engineVolumeCC": m["engine_volume_cc"],
                "powerRpm": m["power_rpm"], "torqueNm": m["torque_nm"], "intakeType": m["intake_type"],
                "cylinderLayout": m["cylinder_layout"], "cylinderCount": m["cylinder_count"],
                "compressionRatio": m["compression_ratio"], "valvesPerCylinder": m["valves_per_cylinder"],
                "turboType": m["turbo_type"], "boreMm": m["bore_mm"], "strokeMm": m["stroke_mm"],
                "engineModel": m["engine_model"], "engineLocation": m["engine_location"],
                "powerKw": m["power_kw"], "torqueRpm": m["torque_rpm"], "intercooler": m["intercooler"],
                "engineCode": m["engine_code"], "timingSystem": m["timing_system"],
                "fuelConsumptionMethod": m["fuel_consumption_method"],
                "gearCount": m["gear_count"], "driveType": m["drive_type"], "turningDiameterM": m["turning_diameter_m"],
                "fuelType": m["fuel_type"], "maxSpeedKmh": m["max_speed_kmh"], "acceleration100": m["acceleration_100"],
                "fuelTankL": m["fuel_tank_l"], "ecoStandard": m["eco_standard"],
                "fuelCityL": m["fuel_city_l"], "fuelHighwayL": m["fuel_highway_l"], "fuelMixedL": m["fuel_mixed_l"],
                "rangeKm": m["range_km"], "co2GKm": m["co2_g_km"],
                "frontBrakes": m["front_brakes"], "rearBrakes": m["rear_brakes"],
                "frontSuspension": m["front_suspension"], "rearSuspension": m["rear_suspension"],
                "doorsCount": m["doors_count"], "countryOfOrigin": m["country_of_origin"],
                "vehicleClass": m["vehicle_class"], "steeringPosition": m["steering_position"],
                "safetyRating": m["safety_rating"], "safetyRatingName": m["safety_rating_name"],
                "works": [],
            })
        return {"statusCode": 200, "headers": CORS, "body": json.dumps(result)}

    # Полное дерево (для небольших баз или админки)
    cur.execute("SELECT id, name FROM car_brands ORDER BY name")
    brands = {r[0]: {"id": r[0], "name": r[1], "models": []} for r in cur.fetchall()}

    cur.execute("SELECT id, brand_id, name FROM car_models ORDER BY name")
    models = {r[0]: {"id": r[0], "name": r[2], "generations": []} for r in cur.fetchall()}
    for r in cur.fetchall() if False else []:
        pass
    cur.execute("SELECT id, brand_id, name FROM car_models ORDER BY name")
    rows_m = cur.fetchall()
    models = {}
    for r in rows_m:
        models[r[0]] = {"id": r[0], "name": r[2], "generations": []}
        if r[1] in brands:
            brands[r[1]]["models"].append(models[r[0]])

    cur.execute("SELECT id, model_id, name, years FROM car_generations ORDER BY name")
    gens = {}
    for r in cur.fetchall():
        gens[r[0]] = {"id": r[0], "name": r[2], "years": r[3], "modifications": []}
        if r[1] in models:
            models[r[1]]["generations"].append(gens[r[0]])

    cur.execute("SELECT id, generation_id, name, engine, transmission, power, engine_type, engine_code, drive_type FROM car_modifications ORDER BY name")
    for r in cur.fetchall():
        if r[1] in gens:
            gens[r[1]]["modifications"].append({
                "id": r[0], "name": r[2], "engine": r[3] or "", "transmission": r[4] or "—", "power": r[5] or "—",
                "engineType": r[6] or "", "engineCode": r[7] or "", "driveType": r[8] or "",
                "works": []
            })

    cur.close()
    conn.close()
    return {"statusCode": 200, "headers": CORS, "body": json.dumps(list(brands.values()))}