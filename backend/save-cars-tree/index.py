"""Сохранение дерева автомобилей (CarBrand[]) из фронтенда в PostgreSQL."""
import json
import os
import re
import psycopg2
from psycopg2.extras import execute_values

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
}


def slug(s: str) -> str:
    return re.sub(r"[\s()/\\]+", "-", s.lower()).strip("-")


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def handler(event: dict, context) -> dict:
    """Принимает дерево CarBrand[] и сохраняет в PostgreSQL батчами."""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    if event.get("httpMethod") == "DELETE":
        conn = get_conn()
        cur = conn.cursor()
        cur.execute("TRUNCATE car_modifications, car_generations, car_models, car_brands RESTART IDENTITY CASCADE")
        conn.commit()
        cur.close()
        conn.close()
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"ok": True})}

    body = json.loads(event.get("body") or "{}")
    brands = body.get("brands", [])
    chunk = body.get("chunk", 0)
    total_chunks = body.get("total_chunks", 1)
    mode = body.get("mode", "merge")

    if not brands:
        return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "No brands data"})}

    conn = get_conn()
    cur = conn.cursor()

    if chunk == 0 and mode == "replace":
        cur.execute("TRUNCATE car_modifications, car_generations, car_models, car_brands RESTART IDENTITY CASCADE")
        conn.commit()

    brands_batch = []
    models_batch = []
    gens_batch = []
    mods_batch = []
    total_mods = 0

    for brand in brands:
        bid = brand.get("id", slug(brand["name"]))
        brands_batch.append((bid, brand["name"]))

        for model in brand.get("models", []):
            mid = model.get("id", f"{bid}__{slug(model['name'])}")
            models_batch.append((mid, bid, model["name"]))

            for gen in model.get("generations", []):
                gid = gen.get("id", f"{mid}__{slug(gen['name'])}")
                years = gen.get("years", "")
                gens_batch.append((gid, mid, gen["name"], years))

                for mod in gen.get("modifications", []):
                    modid = mod.get("id", f"{gid}__{slug(mod['name'])}")
                    mods_batch.append((
                        modid, gid,
                        mod.get("name", ""),
                        mod.get("engine", ""),
                        mod.get("transmission", "") or "—",
                        mod.get("power", "") or "—",
                        mod.get("engineType", ""),
                        mod.get("engineCode", ""),
                        mod.get("driveType", ""),
                        mod.get("bodyType", ""),
                        mod.get("seats"),
                        mod.get("lengthMm"), mod.get("widthMm"), mod.get("heightMm"),
                        mod.get("wheelbaseMm"),
                        mod.get("engineVolumeCC", ""),
                        mod.get("turboType", ""),
                        mod.get("frontBrakes", ""),
                        mod.get("rearBrakes", ""),
                        mod.get("frontSuspension", ""),
                        mod.get("rearSuspension", ""),
                        mod.get("fuelType", ""),
                        mod.get("fuelCityL"),
                        mod.get("fuelHighwayL"),
                        mod.get("fuelMixedL"),
                        mod.get("cylinderLayout", ""),
                        mod.get("cylinderCount"),
                    ))
                    total_mods += 1

    if brands_batch:
        execute_values(cur,
            "INSERT INTO car_brands (id, name) VALUES %s ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name",
            brands_batch)

    if models_batch:
        execute_values(cur,
            "INSERT INTO car_models (id, brand_id, name) VALUES %s ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name",
            models_batch)

    if gens_batch:
        execute_values(cur,
            "INSERT INTO car_generations (id, model_id, name, years) VALUES %s ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, years=EXCLUDED.years",
            gens_batch)

    conn.commit()

    if mods_batch:
        BATCH = 50
        for i in range(0, len(mods_batch), BATCH):
            execute_values(cur, """
                INSERT INTO car_modifications (
                    id, generation_id, name, engine, transmission, power,
                    engine_type, engine_code, drive_type,
                    body_type, seats, length_mm, width_mm, height_mm, wheelbase_mm,
                    engine_volume_cc, turbo_type,
                    front_brakes, rear_brakes, front_suspension, rear_suspension,
                    fuel_type, fuel_city_l, fuel_highway_l, fuel_mixed_l,
                    cylinder_layout, cylinder_count
                ) VALUES %s ON CONFLICT (id) DO UPDATE SET
                    name=EXCLUDED.name, engine=EXCLUDED.engine,
                    transmission=EXCLUDED.transmission, power=EXCLUDED.power,
                    engine_type=EXCLUDED.engine_type, engine_code=EXCLUDED.engine_code,
                    drive_type=EXCLUDED.drive_type, body_type=EXCLUDED.body_type,
                    front_brakes=EXCLUDED.front_brakes, rear_brakes=EXCLUDED.rear_brakes,
                    front_suspension=EXCLUDED.front_suspension, rear_suspension=EXCLUDED.rear_suspension,
                    fuel_type=EXCLUDED.fuel_type, turbo_type=EXCLUDED.turbo_type
            """, mods_batch[i:i+BATCH])
            conn.commit()
    cur.close()
    conn.close()

    return {
        "statusCode": 200,
        "headers": CORS,
        "body": json.dumps({
            "ok": True,
            "chunk": chunk,
            "total_chunks": total_chunks,
            "brands": len(brands_batch),
            "models": len(models_batch),
            "generations": len(gens_batch),
            "modifications": total_mods,
        }),
    }