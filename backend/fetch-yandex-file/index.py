"""
Скачивает файл с Яндекс.Диска и сохраняет в S3.
POST { url: "https://disk.yandex.ru/d/..." } → { cdn_url: "https://cdn.poehali.dev/..." }
Фронт затем читает файл напрямую с CDN (публичный доступ, без CORS-проблем).
"""
import json
import urllib.request
import urllib.parse
import os
import boto3

CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
}

S3_KEY = "tmp/yandex-disk-cars.xlsx"


def handler(event: dict, context) -> dict:
    """Скачивает файл с Яндекс.Диска и сохраняет в S3, возвращает CDN-ссылку."""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS_HEADERS, "body": ""}

    try:
        body = json.loads(event.get("body") or "{}")
        public_url = body.get("url", "").strip()
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

    # 2. Скачиваем файл
    req2 = urllib.request.Request(download_url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req2, timeout=25) as resp2:
        file_bytes = resp2.read()

    # 3. Сохраняем в S3 с публичным ACL
    aws_key = os.environ["AWS_ACCESS_KEY_ID"]
    s3 = boto3.client(
        "s3",
        endpoint_url="https://bucket.poehali.dev",
        aws_access_key_id=aws_key,
        aws_secret_access_key=os.environ["AWS_SECRET_ACCESS_KEY"],
    )
    s3.put_object(
        Bucket="files",
        Key=S3_KEY,
        Body=file_bytes,
        ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        ACL="public-read",
    )

    cdn_url = f"https://cdn.poehali.dev/projects/{aws_key}/files/{S3_KEY}"

    return {
        "statusCode": 200,
        "headers": {**CORS_HEADERS, "Content-Type": "application/json"},
        "body": json.dumps({"cdn_url": cdn_url, "size": len(file_bytes)}),
    }
