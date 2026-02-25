"""
Читает xlsx из S3 (загруженный fetch-yandex-file), парсит и загружает в БД через upload-cars-chunk.
POST { mode: "replace"|"merge" } → { inserted, skipped, total_rows }
"""
import json
import urllib.request
import os
import io
import boto3
import openpyxl

CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
}

UPLOAD_CHUNK_URL = "https://functions.poehali.dev/3d38a075-03d1-4f23-864a-7c175df1cf24"
S3_KEY = "tmp/yandex-disk-cars.xlsx"
CHUNK_SIZE = 500


def handler(event: dict, context) -> dict:
    """Читает xlsx из S3 и загружает данные в базу авто чанками."""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS_HEADERS, "body": ""}

    try:
        body = json.loads(event.get("body") or "{}")
        mode = body.get("mode", "replace")
    except Exception:
        mode = "replace"

    # 1. Читаем файл из S3
    s3 = boto3.client(
        "s3",
        endpoint_url="https://bucket.poehali.dev",
        aws_access_key_id=os.environ["AWS_ACCESS_KEY_ID"],
        aws_secret_access_key=os.environ["AWS_SECRET_ACCESS_KEY"],
    )
    obj = s3.get_object(Bucket="files", Key=S3_KEY)
    file_bytes = obj["Body"].read()

    # 2. Парсим xlsx
    wb = openpyxl.load_workbook(io.BytesIO(file_bytes), read_only=True, data_only=True)
    ws = wb.active
    all_rows = []
    for row in ws.iter_rows(values_only=True):
        all_rows.append([str(c) if c is not None else "" for c in row])
    wb.close()

    if len(all_rows) < 2:
        return {"statusCode": 400, "headers": CORS_HEADERS, "body": json.dumps({"error": "Файл пустой или не содержит данных"})}

    # Находим строку с заголовком
    header_idx = 0
    for i in range(min(5, len(all_rows))):
        first = str(all_rows[i][0]).strip().lower()
        if first in ("марка", "brand"):
            header_idx = i
            break

    header_row = all_rows[header_idx]
    data_rows = [r for r in all_rows[header_idx + 1:] if any(c != "" for c in r)]

    if not data_rows:
        return {"statusCode": 400, "headers": CORS_HEADERS, "body": json.dumps({"error": "Нет строк с данными"})}

    # 3. Загружаем чанками
    chunks = [data_rows[i:i + CHUNK_SIZE] for i in range(0, len(data_rows), CHUNK_SIZE)]
    total_inserted = 0
    total_skipped = 0

    for ci, chunk in enumerate(chunks):
        payload = json.dumps({
            "header": header_row,
            "rows": chunk,
            "chunk": ci,
            "total_chunks": len(chunks),
            "mode": mode,
        }).encode("utf-8")

        req = urllib.request.Request(
            UPLOAD_CHUNK_URL,
            data=payload,
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=60) as resp:
            chunk_raw = resp.read().decode("utf-8")

        chunk_data = json.loads(chunk_raw)
        if isinstance(chunk_data, str):
            chunk_data = json.loads(chunk_data)

        if chunk_data.get("error"):
            return {"statusCode": 502, "headers": CORS_HEADERS, "body": json.dumps({"error": f"Ошибка на чанке {ci+1}: {chunk_data['error']}"})}

        total_inserted += chunk_data.get("inserted", 0)
        total_skipped += chunk_data.get("skipped", 0)

    return {
        "statusCode": 200,
        "headers": {**CORS_HEADERS, "Content-Type": "application/json"},
        "body": json.dumps({"inserted": total_inserted, "skipped": total_skipped, "total_rows": len(data_rows)}),
    }
