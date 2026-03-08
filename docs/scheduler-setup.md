# Настройка автоматического планировщика уведомлений

## Обзор системы

Система состоит из двух backend функций:
1. **trial-notifications** - отправляет email-уведомления поставщикам
2. **trial-scheduler** - координирует и запускает отправку по расписанию

## URL функций

- **Уведомления**: `https://functions.poehali.dev/9e8e77f5-a732-4a04-8834-4c01eaab689b`
- **Планировщик**: `https://functions.poehali.dev/a810a2b1-9e5a-4db1-b56a-8e116e1eb89a`

## Варианты автоматизации

### 1. GitHub Actions (Рекомендуется)

Создайте файл `.github/workflows/trial-notifications.yml`:

```yaml
name: Daily Trial Notifications

on:
  schedule:
    # Запуск каждый день в 10:00 UTC
    - cron: '0 10 * * *'
  workflow_dispatch: # Позволяет запускать вручную

jobs:
  send-notifications:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Trial Notifications
        run: |
          curl -X POST \
            -H "Content-Type: application/json" \
            -d '{}' \
            https://functions.poehali.dev/a810a2b1-9e5a-4db1-b56a-8e116e1eb89a
```

### 2. External Cron Service

Используйте сервисы типа cron-job.org или EasyCron:

**URL для вызова**: `https://functions.poehali.dev/a810a2b1-9e5a-4db1-b56a-8e116e1eb89a`  
**Method**: POST  
**Frequency**: Daily at 10:00 UTC  
**Body**: `{}`

### 3. Server Cron Job

На вашем сервере добавьте в crontab:

```bash
# Открыть crontab
crontab -e

# Добавить строку (запуск каждый день в 10:00 UTC)
0 10 * * * curl -X POST -H "Content-Type: application/json" -d '{}' https://functions.poehali.dev/a810a2b1-9e5a-4db1-b56a-8e116e1eb89a
```

### 4. Yandex Cloud Triggers

1. Перейдите в консоль Yandex Cloud
2. Создайте триггер типа "Timer"
3. Настройте расписание: `0 10 * * ? *` (каждый день в 10:00)
4. Укажите HTTP endpoint: `https://functions.poehali.dev/a810a2b1-9e5a-4db1-b56a-8e116e1eb89a`
5. Method: POST, Body: `{}`

## Мониторинг и логи

### Проверка статуса

```bash
# Получить статус планировщика
curl https://functions.poehali.dev/a810a2b1-9e5a-4db1-b56a-8e116e1eb89a

# Получить статистику уведомлений  
curl https://functions.poehali.dev/9e8e77f5-a732-4a04-8834-4c01eaab689b
```

### Ручной запуск

```bash
# Запустить планировщик вручную
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{}' \
  https://functions.poehali.dev/a810a2b1-9e5a-4db1-b56a-8e116e1eb89a

# Отправить уведомления напрямую
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{}' \
  https://functions.poehali.dev/9e8e77f5-a732-4a04-8834-4c01eaab689b
```

## Настройка email (переменные окружения)

Для отправки реальных email добавьте переменные окружения в функцию `trial-notifications`:

```bash
SMTP_HOST=smtp.yandex.ru
SMTP_PORT=587
SMTP_USER=your-email@domain.com
SMTP_PASSWORD=your-app-password
FROM_EMAIL=noreply@business-market.ru
DATABASE_URL=postgresql://user:pass@host:port/db
```

## Логика работы

1. **Планировщик** вызывается по расписанию
2. Он обращается к функции **уведомлений**
3. Функция уведомлений:
   - Находит поставщиков с истекающим через 7 дней пробным периодом
   - Отправляет им email-уведомления
   - Отмечает в БД, что уведомление отправлено
   - Возвращает статистику

## Рекомендации

- **GitHub Actions** - лучший вариант для проектов на GitHub
- **External Cron** - простой вариант без собственной инфраструктуры  
- **Server Cron** - если у вас есть VPS/сервер
- **Yandex Triggers** - интеграция с облачной инфраструктурой

## Тестирование

В админ-панели поставщика есть интерфейс для:
- Просмотра статуса планировщика
- Ручного запуска уведомлений
- Мониторинга статистики отправки