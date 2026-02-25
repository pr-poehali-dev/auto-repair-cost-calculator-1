"""
Возвращает прямую ссылку для скачивания публичного файла с Яндекс.Диска.
POST { url: "https://disk.yandex.ru/d/..." }
→ { download_url: "https://..." }
"""
import json
import urllib.request
import urllib.parse

CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
}

FUNC_URL = "https://functions.poehali.dev/768a84bf-ea8e-43a1-a6ae-9a830e80b9f3"


def handler(event: dict, context) -> dict:
    """Возвращает прямую ссылку на скачивание файла с Яндекс.Диска (обход CORS).
    GET ?dl=<url> — скачивает файл и отдаёт как бинарный прокси (для небольших файлов).
    POST { url } — возвращает прямую ссылку на скачивание Яндекс.Диска.
    """
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS_HEADERS, "body": ""}

    # POST: получить прямую ссылку
    try:
        body = json.loads(event.get("body") or "{}")
        public_url = body.get("url", "").strip()
    except Exception:
        return {"statusCode": 400, "headers": CORS_HEADERS, "body": json.dumps({"error": "Неверный формат запроса"})}

    if not public_url:
        return {"statusCode": 400, "headers": CORS_HEADERS, "body": json.dumps({"error": "URL не указан"})}

    api_url = "https://cloud-api.yandex.net/v1/disk/public/resources/download?public_key=" + urllib.parse.quote(public_url, safe="")
    req = urllib.request.Request(api_url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=15) as resp:
        meta = json.loads(resp.read().decode("utf-8"))

    download_url = meta.get("href")
    if not download_url:
        return {"statusCode": 502, "headers": CORS_HEADERS, "body": json.dumps({"error": "Не удалось получить ссылку для скачивания"})}

    # Возвращаем прямую ссылку — браузер скачает файл сам
    return {
        "statusCode": 200,
        "headers": {**CORS_HEADERS, "Content-Type": "application/json"},
        "body": json.dumps({"download_url": download_url}),
    }