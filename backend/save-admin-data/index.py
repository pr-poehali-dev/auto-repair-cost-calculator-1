"""Сохранение данных админ-панели в БД (работы, связи, фильтры, филиалы, настройки)."""
import json
import os
import psycopg2

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
}

ALLOWED_KEYS = {"works", "work_links", "work_filters", "branches", "settings"}


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def save_works(conn, works):
    """Синхронизирует таблицу works с переданным списком."""
    cur = conn.cursor()
    incoming_ids = {w["id"] for w in works}

    cur.execute("SELECT id FROM works")
    existing_ids = {r[0] for r in cur.fetchall()}

    ids_to_delete = existing_ids - incoming_ids
    if ids_to_delete:
        cur.execute("DELETE FROM works WHERE id = ANY(%s)", (list(ids_to_delete),))

    for i, w in enumerate(works):
        cur.execute(
            """INSERT INTO works (id, name, sort_order)
               VALUES (%s, %s, %s)
               ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order""",
            (w["id"], w["name"], i),
        )

    conn.commit()
    cur.close()


def handler(event: dict, context) -> dict:
    """Сохраняет данные админ-панели в базу данных."""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    body = json.loads(event.get("body") or "{}")
    key = body.get("key")
    value = body.get("value")

    if not key or key not in ALLOWED_KEYS:
        return {
            "statusCode": 400,
            "headers": CORS,
            "body": json.dumps({"error": f"Invalid key. Allowed: {', '.join(sorted(ALLOWED_KEYS))}"}),
        }

    if value is None:
        return {
            "statusCode": 400,
            "headers": CORS,
            "body": json.dumps({"error": "Missing 'value' field"}),
        }

    conn = get_conn()

    if key == "works":
        save_works(conn, value if isinstance(value, list) else [])
        conn.close()
        return {
            "statusCode": 200,
            "headers": CORS,
            "body": json.dumps({"ok": True, "key": key, "count": len(value) if isinstance(value, list) else 0}),
        }

    cur = conn.cursor()
    cur.execute(
        """INSERT INTO admin_data (key, value, updated_at)
           VALUES (%s, %s::jsonb, NOW())
           ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()""",
        (key, json.dumps(value)),
    )
    conn.commit()
    cur.close()
    conn.close()

    return {
        "statusCode": 200,
        "headers": CORS,
        "body": json.dumps({"ok": True, "key": key}),
    }
