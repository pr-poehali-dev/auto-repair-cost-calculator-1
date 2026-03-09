"""Массовое сохранение нормачасов для всех модификаций марки/модели/поколения."""
import json
import os
import psycopg2

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
}

FILTER_PARAM_MAP = {
    "engineType": "engine_type",
    "transmission": "transmission",
    "frontBrakes": "front_brakes",
    "rearBrakes": "rear_brakes",
    "driveType": "drive_type",
    "frontSuspension": "front_suspension",
    "rearSuspension": "rear_suspension",
    "turboType": "turbo_type",
}


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def is_work_available(work_name, mod_row, work_filters):
    for wf in work_filters:
        if wf.get("workName") != work_name:
            continue
        active_rules = [r for r in wf.get("rules", []) if r.get("allowedValues")]
        if not active_rules:
            continue
        for rule in active_rules:
            param = rule["param"]
            db_col = FILTER_PARAM_MAP.get(param, param)
            mod_val = (mod_row.get(db_col) or "").strip()
            if not mod_val or mod_val == "\u2014":
                continue
            if mod_val not in rule["allowedValues"]:
                return False
    return True


def handler(event: dict, context) -> dict:
    """Массовое сохранение нормачасов — применяет часы ко всем подходящим модификациям."""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    conn = get_conn()
    cur = conn.cursor()

    if event.get("httpMethod") == "GET":
        params = event.get("queryStringParameters") or {}
        scope = params.get("scope", "brand")
        scope_id = params.get("id", "")
        if not scope_id:
            cur.close()
            conn.close()
            return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "id required"})}

        if scope == "brand":
            cur.execute(
                "SELECT COUNT(*) FROM car_modifications cm "
                "JOIN car_generations cg ON cm.generation_id = cg.id "
                "JOIN car_models cmod ON cg.model_id = cmod.id "
                "WHERE cmod.brand_id = %s",
                (scope_id,),
            )
        elif scope == "model":
            cur.execute(
                "SELECT COUNT(*) FROM car_modifications cm "
                "JOIN car_generations cg ON cm.generation_id = cg.id "
                "WHERE cg.model_id = %s",
                (scope_id,),
            )
        elif scope == "generation":
            cur.execute(
                "SELECT COUNT(*) FROM car_modifications WHERE generation_id = %s",
                (scope_id,),
            )
        else:
            cur.close()
            conn.close()
            return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Invalid scope"})}

        count = cur.fetchone()[0]
        cur.close()
        conn.close()
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"count": count})}

    if event.get("httpMethod") == "POST":
        body = json.loads(event.get("body") or "{}")
        scope = body.get("scope", "brand")
        scope_id = body.get("id", "")
        works = body.get("works", [])
        mode = body.get("mode", "fill_empty")

        if not scope_id or not works:
            cur.close()
            conn.close()
            return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "id and works required"})}

        if scope == "brand":
            cur.execute(
                "SELECT cm.id, cm.engine_type, cm.transmission, cm.front_brakes, cm.rear_brakes, "
                "cm.drive_type, cm.front_suspension, cm.rear_suspension, cm.turbo_type "
                "FROM car_modifications cm "
                "JOIN car_generations cg ON cm.generation_id = cg.id "
                "JOIN car_models cmod ON cg.model_id = cmod.id "
                "WHERE cmod.brand_id = %s",
                (scope_id,),
            )
        elif scope == "model":
            cur.execute(
                "SELECT cm.id, cm.engine_type, cm.transmission, cm.front_brakes, cm.rear_brakes, "
                "cm.drive_type, cm.front_suspension, cm.rear_suspension, cm.turbo_type "
                "FROM car_modifications cm "
                "JOIN car_generations cg ON cm.generation_id = cg.id "
                "WHERE cg.model_id = %s",
                (scope_id,),
            )
        elif scope == "generation":
            cur.execute(
                "SELECT id, engine_type, transmission, front_brakes, rear_brakes, "
                "drive_type, front_suspension, rear_suspension, turbo_type "
                "FROM car_modifications WHERE generation_id = %s",
                (scope_id,),
            )
        else:
            cur.close()
            conn.close()
            return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Invalid scope"})}

        mod_rows = cur.fetchall()
        col_names = ["id", "engine_type", "transmission", "front_brakes", "rear_brakes",
                     "drive_type", "front_suspension", "rear_suspension", "turbo_type"]
        modifications = [dict(zip(col_names, row)) for row in mod_rows]

        cur.execute("SELECT value FROM admin_data WHERE key = 'work_filters'")
        row = cur.fetchone()
        work_filters = []
        if row and row[0]:
            val = row[0]
            work_filters = json.loads(val) if isinstance(val, str) else val

        existing = {}
        if modifications:
            mod_ids = [m["id"] for m in modifications]
            ph = ",".join(["%s"] * len(mod_ids))
            cur.execute(
                f"SELECT modification_id, work_name, hours FROM modification_works WHERE modification_id IN ({ph})",
                mod_ids,
            )
            for r in cur.fetchall():
                existing[(r[0], r[1])] = float(r[2])

        inserted = 0
        updated = 0
        skipped = 0

        for mod in modifications:
            for w in works:
                name = w.get("name", "").strip()
                hours = float(w.get("hours", 0))
                if not name or hours <= 0:
                    continue

                if not is_work_available(name, mod, work_filters):
                    skipped += 1
                    continue

                key = (mod["id"], name)
                current = existing.get(key)

                if mode == "fill_empty":
                    if current is not None and current > 0:
                        continue
                    cur.execute(
                        "INSERT INTO modification_works (modification_id, work_name, hours) "
                        "VALUES (%s, %s, %s) "
                        "ON CONFLICT (modification_id, work_name) DO UPDATE SET hours = EXCLUDED.hours, updated_at = NOW()",
                        (mod["id"], name, hours),
                    )
                    inserted += 1
                elif mode == "overwrite":
                    cur.execute(
                        "INSERT INTO modification_works (modification_id, work_name, hours) "
                        "VALUES (%s, %s, %s) "
                        "ON CONFLICT (modification_id, work_name) DO UPDATE SET hours = EXCLUDED.hours, updated_at = NOW()",
                        (mod["id"], name, hours),
                    )
                    if current is not None:
                        updated += 1
                    else:
                        inserted += 1

        conn.commit()
        cur.close()
        conn.close()
        return {
            "statusCode": 200,
            "headers": CORS,
            "body": json.dumps({
                "ok": True,
                "modifications": len(modifications),
                "inserted": inserted,
                "updated": updated,
                "skipped_by_filter": skipped,
            }),
        }

    cur.close()
    conn.close()
    return {"statusCode": 405, "headers": CORS, "body": json.dumps({"error": "Method not allowed"})}
