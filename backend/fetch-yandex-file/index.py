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
    """Скачивает файл с Яндекс.Диска, сохраняет в S3 и возвращает временную CDN-ссылку."""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS_HEADERS, "body": ""}

    try:
        body = json.loads(event.get("body") or "{}")
        public_url = body.get("url", "").strip()
    except Exception:
        return {"statusCode": 400, "headers": CORS_HEADERS, "body": json.dumps({"error": "Неверный формат запроса"})}

    if not public_url:
        return {"statusCode": 400, "headers": CORS_HEADERS, "body": json.dumps({"error": "URL не указан"})}

    # Получаем прямую ссылку через API Яндекс.Диска
    api_url = "https://cloud-api.yandex.net/v1/disk/public/resources/download?public_key=" + urllib.parse.quote(public_url, safe="")
    req = urllib.request.Request(api_url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=15) as resp:
        meta = json.loads(resp.read().decode("utf-8"))

    download_url = meta.get("href")
    if not download_url:
        return {"statusCode": 502, "headers": CORS_HEADERS, "body": json.dumps({"error": "Не удалось получить ссылку для скачивания с Яндекс.Диска"})}

    # Скачиваем файл
    req2 = urllib.request.Request(download_url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req2, timeout=60) as resp2:
        file_bytes = resp2.read()

    # Сохраняем в S3
    s3 = boto3.client(
        "s3",
        endpoint_url="https://bucket.poehali.dev",
        aws_access_key_id=os.environ["AWS_ACCESS_KEY_ID"],
        aws_secret_access_key=os.environ["AWS_SECRET_ACCESS_KEY"],
    )
    s3.put_object(
        Bucket="files",
        Key=S3_KEY,
        Body=file_bytes,
        ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    )

    # Генерируем presigned URL (действует 1 час)
    presigned = s3.generate_presigned_url(
        "get_object",
        Params={"Bucket": "files", "Key": S3_KEY},
        ExpiresIn=3600,
    )

    return {
        "statusCode": 200,
        "headers": {**CORS_HEADERS, "Content-Type": "application/json"},
        "body": json.dumps({"url": presigned, "size": len(file_bytes)}),
    }
