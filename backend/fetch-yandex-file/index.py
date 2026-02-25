"""
Скачивает xlsx с Яндекс.Диска, парсит и нарезает на JSON-чанки в S3.
POST { url: "https://disk.yandex.ru/d/...", chunk_size: 300 }
→ { ok: true, total_rows, total_chunks, size }
"""
import json
import urllib.request
import urllib.parse
import os
import io
import boto3
import openpyxl

CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
}

S3_META_KEY = "tmp/ydisk-meta.json"
CHUNK_SIZE = 300


def handler(event: dict, context) -> dict:
    """Скачивает xlsx с Яндекс.Диска и нарезает на JSON-чанки в S3."""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS_HEADERS, "body": ""}

    try:
        body = json.loads(event.get("body") or "{}")
        public_url = body.get("url", "").strip()
        chunk_size = int(body.get("chunk_size", CHUNK_SIZE))
    except Exception:
        return {"statusCode": 400, "headers": CORS_HEADERS, "body": json.dumps({"error": "Неверный формат запроса"})}

    if not public_url:
        return {"statusCode": 400, "headers": CORS_HEADERS, "body": json.dumps({"error": "URL не указан"})}

    # 1. Получаем прямую ссылку через API Яндекс.Диска
    api_url = "https://cloud-api.yandex.net/v1/disk/public/resources/download?public_key=" + urllib.parse.quote(public_url, safe="")
    req = urllib.request.Request(api_url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=15) as resp:
        meta = json.loads(resp.read().decode("utf-8"))

    download_url = meta.get("href")
    if not download_url:
        return {"statusCode": 502, "headers": CORS_HEADERS, "body": json.dumps({"error": "Не удалось получить ссылку Яндекс.Диска"})}

    # 2. Скачиваем файл
    req2 = urllib.request.Request(download_url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req2, timeout=25) as resp2:
        file_bytes = resp2.read()

    # 3. Парсим xlsx
    wb = openpyxl.load_workbook(io.BytesIO(file_bytes), read_only=True, data_only=True)
    ws = wb.active
    all_rows = [[str(c) if c is not None else "" for c in row] for row in ws.iter_rows(values_only=True)]
    wb.close()

    if len(all_rows) < 2:
        return {"statusCode": 400, "headers": CORS_HEADERS, "body": json.dumps({"error": "Файл пустой"})}

    header_idx = 0
    for i in range(min(5, len(all_rows))):
        if str(all_rows[i][0]).strip().lower() in ("марка", "brand"):
            header_idx = i; break

    header_row = all_rows[header_idx]
    data_rows  = [r for r in all_rows[header_idx + 1:] if any(c for c in r)]
    total_rows   = len(data_rows)
    total_chunks = (total_rows + chunk_size - 1) // chunk_size

    # 4. Сохраняем чанки в S3
    s3 = boto3.client(
        "s3",
        endpoint_url="https://bucket.poehali.dev",
        aws_access_key_id=os.environ["AWS_ACCESS_KEY_ID"],
        aws_secret_access_key=os.environ["AWS_SECRET_ACCESS_KEY"],
    )

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
        Body=json.dumps({"header": header_row, "total_rows": total_rows, "total_chunks": total_chunks, "chunk_size": chunk_size}, ensure_ascii=False).encode("utf-8"),
        ContentType="application/json",
    )

    return {
        "statusCode": 200,
        "headers": {**CORS_HEADERS, "Content-Type": "application/json"},
        "body": json.dumps({"ok": True, "total_rows": total_rows, "total_chunks": total_chunks, "size": len(file_bytes)}),
    }
