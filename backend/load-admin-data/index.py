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

    if key == "works":
        cur.execute("SELECT id, name FROM works ORDER BY sort_order, created_at")
        rows = cur.fetchall()
        cur.close()
        conn.close()
        return {"statusCode": 200, "headers": CORS, "body": json.dumps([{"id": r[0], "name": r[1]} for r in rows])}

    if key:
        cur.execute("SELECT value FROM admin_data WHERE key = %s", (key,))
        row = cur.fetchone()
        cur.close()
        conn.close()
        if row:
            return {"statusCode": 200, "headers": CORS, "body": json.dumps(row[0])}
        return {"statusCode": 200, "headers": CORS, "body": json.dumps(None)}

    cur.execute("SELECT key, value FROM admin_data WHERE key != 'works'")
    rows = cur.fetchall()
    result = {r[0]: r[1] for r in rows}

    cur.execute("SELECT id, name FROM works ORDER BY sort_order, created_at")
    works_rows = cur.fetchall()
    result["works"] = [{"id": r[0], "name": r[1]} for r in works_rows]

    cur.close()
    conn.close()

    return {"statusCode": 200, "headers": CORS, "body": json.dumps(result)}
