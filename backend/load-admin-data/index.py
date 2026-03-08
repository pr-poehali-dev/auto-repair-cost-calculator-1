"""Загрузка данных админ-панели из БД."""
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
    """Возвращает все данные админ-панели из базы данных."""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    params = event.get("queryStringParameters") or {}
    key = params.get("key")

    conn = get_conn()
    cur = conn.cursor()

    if key:
        cur.execute("SELECT value FROM admin_data WHERE key = %s", (key,))
        row = cur.fetchone()
        cur.close()
        conn.close()
        if row:
            return {"statusCode": 200, "headers": CORS, "body": json.dumps(row[0])}
        return {"statusCode": 200, "headers": CORS, "body": json.dumps(None)}

    cur.execute("SELECT key, value FROM admin_data")
    rows = cur.fetchall()
    cur.close()
    conn.close()

    result = {r[0]: r[1] for r in rows}
    return {"statusCode": 200, "headers": CORS, "body": json.dumps(result)}
