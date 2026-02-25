"""
Парсит xlsx из S3 (tmp/ydisk-raw.xlsx) и нарезает на JSON-чанки.
POST {} → { ok: true, total_rows, total_chunks }
"""
import json
import os
import io
import boto3
import openpyxl

CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
}

S3_RAW_KEY = "tmp/ydisk-raw.xlsx"
S3_META_KEY = "tmp/ydisk-meta.json"
CHUNK_SIZE = 300


def handler(event: dict, context) -> dict:
    """Читает xlsx из S3, парсит openpyxl и нарезает на JSON-чанки."""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS_HEADERS, "body": ""}

    try:
        body = json.loads(event.get("body") or "{}")
        chunk_size = int(body.get("chunk_size", CHUNK_SIZE))
    except Exception:
        chunk_size = CHUNK_SIZE

    s3 = boto3.client(
        "s3",
        endpoint_url="https://bucket.poehali.dev",
        aws_access_key_id=os.environ["AWS_ACCESS_KEY_ID"],
        aws_secret_access_key=os.environ["AWS_SECRET_ACCESS_KEY"],
    )

    # 1. Читаем xlsx из S3
    obj = s3.get_object(Bucket="files", Key=S3_RAW_KEY)
    file_bytes = obj["Body"].read()

    # 2. Парсим xlsx
    wb = openpyxl.load_workbook(io.BytesIO(file_bytes), read_only=True, data_only=True)
    ws = wb.active
    all_rows = [[str(c) if c is not None else "" for c in row] for row in ws.iter_rows(values_only=True)]
    wb.close()

    if len(all_rows) < 2:
        return {"statusCode": 400, "headers": CORS_HEADERS, "body": json.dumps({"error": "Файл пустой"})}

    # 3. Ищем строку заголовка
    header_idx = 0
    for i in range(min(5, len(all_rows))):
        if str(all_rows[i][0]).strip().lower() in ("марка", "brand"):
            header_idx = i
            break

    header_row = all_rows[header_idx]
    data_rows = [r for r in all_rows[header_idx + 1:] if any(c for c in r)]
    total_rows = len(data_rows)
    total_chunks = (total_rows + chunk_size - 1) // chunk_size

    # 4. Сохраняем чанки в S3
    for ci in range(total_chunks):
        chunk = data_rows[ci * chunk_size:(ci + 1) * chunk_size]
        s3.put_object(
            Bucket="files",
            Key=f"tmp/ydisk-chunk-{ci}.json",
            Body=json.dumps(chunk, ensure_ascii=False).encode("utf-8"),
            ContentType="application/json",
        )

    s3.put_object(
        Bucket="files",
        Key=S3_META_KEY,
        Body=json.dumps({
            "header": header_row,
            "total_rows": total_rows,
            "total_chunks": total_chunks,
            "chunk_size": chunk_size,
        }, ensure_ascii=False).encode("utf-8"),
        ContentType="application/json",
    )

    return {
        "statusCode": 200,
        "headers": {**CORS_HEADERS, "Content-Type": "application/json"},
        "body": json.dumps({"ok": True, "total_rows": total_rows, "total_chunks": total_chunks}),
    }
