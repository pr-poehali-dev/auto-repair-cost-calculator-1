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
