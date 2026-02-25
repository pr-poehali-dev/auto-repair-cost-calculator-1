"""
Скачивает xlsx с Яндекс.Диска, парсит его и загружает в БД через upload-cars-chunk.
POST { url: "https://disk.yandex.ru/d/...", mode: "replace"|"merge" }
"""
import json
import urllib.request
import urllib.parse
import os
import io

CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
}

UPLOAD_CHUNK_URL = "https://functions.poehali.dev/3d38a075-03d1-4f23-864a-7c175df1cf24"
CHUNK_SIZE = 500


def handler(event: dict, context) -> dict:
    """Скачивает xlsx с Яндекс.Диска и загружает данные в базу авто чанками."""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS_HEADERS, "body": ""}

    try:
        body = json.loads(event.get("body") or "{}")
        public_url = body.get("url", "").strip()
        mode = body.get("mode", "replace")
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
        return {"statusCode": 502, "headers": CORS_HEADERS, "body": json.dumps({"error": "Не удалось получить ссылку для скачивания с Яндекс.Диска"})}

    # 2. Скачиваем файл в память
    req2 = urllib.request.Request(download_url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req2, timeout=60) as resp2:
        file_bytes = resp2.read()

    # 3. Парсим xlsx через openpyxl
    import openpyxl
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
        return {"statusCode": 400, "headers": CORS_HEADERS, "body": json.dumps({"error": "Файл не содержит строк с данными"})}

    # 4. Отправляем чанки в upload-cars-chunk
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

        req3 = urllib.request.Request(
            UPLOAD_CHUNK_URL,
            data=payload,
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        with urllib.request.urlopen(req3, timeout=60) as resp3:
            chunk_raw = resp3.read().decode("utf-8")

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
        "body": json.dumps({
            "inserted": total_inserted,
            "skipped": total_skipped,
            "total_rows": len(data_rows),
            "file_size": len(file_bytes),
        }),
    }
