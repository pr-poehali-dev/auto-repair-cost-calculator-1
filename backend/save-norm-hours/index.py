"""Сохранение и загрузка нормачасов для модификации."""
import json
import os
import psycopg2

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
}


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def handler(event: dict, context) -> dict:
    """Сохраняет или загружает нормачасы для модификации авто."""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    conn = get_conn()
    cur = conn.cursor()

    if event.get("httpMethod") == "GET":
        params = event.get("queryStringParameters") or {}
        mod_id = params.get("modification_id")
        if not mod_id:
            cur.close()
            conn.close()
            return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "modification_id required"})}

        cur.execute(
            "SELECT work_name, hours FROM modification_works WHERE modification_id = %s ORDER BY work_name",
            (mod_id,),
        )
        rows = cur.fetchall()
        cur.close()
        conn.close()
        works = [{"name": r[0], "hours": float(r[1])} for r in rows]
        return {"statusCode": 200, "headers": CORS, "body": json.dumps(works)}

    if event.get("httpMethod") == "POST":
        body = json.loads(event.get("body") or "{}")
        mod_id = body.get("modification_id")
        works = body.get("works", [])

        if not mod_id:
            cur.close()
            conn.close()
            return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "modification_id required"})}

        cur.execute("DELETE FROM modification_works WHERE modification_id = %s", (mod_id,))

        for w in works:
            name = w.get("name", "").strip()
            hours = w.get("hours", 0)
            if name and hours and float(hours) > 0:
                cur.execute(
                    "INSERT INTO modification_works (modification_id, work_name, hours) VALUES (%s, %s, %s)",
                    (mod_id, name, float(hours)),
                )

        conn.commit()
        cur.close()
        conn.close()
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"ok": True, "saved": len(works)})}

    cur.close()
    conn.close()
    return {"statusCode": 405, "headers": CORS, "body": json.dumps({"error": "Method not allowed"})}
