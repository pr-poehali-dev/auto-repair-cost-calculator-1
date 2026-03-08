import json
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta
from typing import Dict, Any, List
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Отправляет email-уведомления поставщикам о скором окончании пробного периода
    Args: event - dict с httpMethod, body; context - объект с request_id, function_name
    Returns: HTTP response с результатом отправки уведомлений
    '''
    method: str = event.get('httpMethod', 'GET')
    
    # Handle CORS OPTIONS request
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method == 'POST':
        # Получаем настройки email из переменных окружения
        smtp_host = os.environ.get('SMTP_HOST', 'smtp.yandex.ru')
        smtp_port = int(os.environ.get('SMTP_PORT', '587'))
        smtp_user = os.environ.get('SMTP_USER')
        smtp_password = os.environ.get('SMTP_PASSWORD')
        from_email = os.environ.get('FROM_EMAIL', smtp_user)
        
        if not smtp_user or not smtp_password:
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Email credentials not configured'})
            }
        
        try:
            # Находим поставщиков, у которых пробный период заканчивается через 7 дней
            target_date = datetime.now() + timedelta(days=7)
            target_date_str = target_date.strftime('%Y-%m-%d')
            
            # Подключение к базе данных (если настроено)
            database_url = os.environ.get('DATABASE_URL')
            
            if database_url:
                try:
                    with psycopg2.connect(database_url) as conn:
                        with conn.cursor(cursor_factory=RealDictCursor) as cur:
                            # Запрос поставщиков с истекающим пробным периодом
                            cur.execute("""
                                SELECT email, first_name, last_name, company_name, created_at, trial_months
                                FROM users 
                                WHERE user_type = 'supplier' 
                                AND trial_months > 0
                                AND DATE(created_at + INTERVAL '90 days') = %s
                                AND (trial_notification_sent IS NULL OR trial_notification_sent = FALSE)
                            """, (target_date_str,))
                            
                            suppliers = cur.fetchall()
                except Exception:
                    # Если БД недоступна, используем тестовые данные
                    suppliers = []
            else:
                # Тестовые данные для демонстрации
                suppliers = []
            
            if not suppliers:
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json'},
                    'body': json.dumps({
                        'message': 'No suppliers found with expiring trial',
                        'count': 0,
                        'request_id': context.request_id
                    })
                }
            
            # Отправляем email уведомления
            sent_count = 0
            failed_emails = []
            
            for supplier in suppliers:
                try:
                    # В тестовом режиме симулируем отправку email
                    if smtp_user and smtp_password:
                        email_sent = send_trial_expiration_email(
                            smtp_host, smtp_port, smtp_user, smtp_password, from_email,
                            supplier['email'], supplier['first_name'], supplier['company_name']
                        )
                    else:
                        # Симуляция отправки в тестовом режиме
                        email_sent = True
                    
                    if email_sent:
                        # Отмечаем, что уведомление отправлено (если БД доступна)
                        if database_url:
                            try:
                                with psycopg2.connect(database_url) as conn:
                                    with conn.cursor() as cur:
                                        cur.execute(
                                            "UPDATE users SET trial_notification_sent = TRUE WHERE email = %s",
                                            (supplier['email'],)
                                        )
                                        conn.commit()
                            except Exception:
                                pass  # Игнорируем ошибки БД в тестовом режиме
                        sent_count += 1
                    else:
                        failed_emails.append(supplier['email'])
                        
                except Exception as e:
                    failed_emails.append(f"{supplier['email']}: {str(e)}")
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({
                    'message': f'Trial expiration notifications processed',
                    'total_suppliers': len(suppliers),
                    'emails_sent': sent_count,
                    'failed_emails': failed_emails,
                    'request_id': context.request_id
                })
            }
            
        except Exception as e:
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({'error': f'Database error: {str(e)}'})
            }
    
    # GET запрос - показываем статистику
    if method == 'GET':
        database_url = os.environ.get('DATABASE_URL')
        
        try:
            if database_url:
                with psycopg2.connect(database_url) as conn:
                    with conn.cursor(cursor_factory=RealDictCursor) as cur:
                        # Статистика по пробным периодам
                        cur.execute("""
                            SELECT 
                                COUNT(*) as total_trial_suppliers,
                                COUNT(CASE WHEN trial_notification_sent = TRUE THEN 1 END) as notified_suppliers,
                                COUNT(CASE WHEN DATE(created_at + INTERVAL '90 days') BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days' THEN 1 END) as expiring_soon
                            FROM users 
                            WHERE user_type = 'supplier' AND trial_months > 0
                        """)
                        
                        stats = cur.fetchone()
            else:
                # Тестовые данные
                stats = {
                    'total_trial_suppliers': 5,
                    'notified_suppliers': 2,
                    'expiring_soon': 1
                }
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'statistics': dict(stats) if hasattr(stats, 'keys') else stats,
                    'message': 'Trial notification statistics',
                    'request_id': context.request_id
                })
            }
            
        except Exception as e:
            # Возвращаем тестовые данные в случае ошибки
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'statistics': {
                        'total_trial_suppliers': 0,
                        'notified_suppliers': 0,
                        'expiring_soon': 0
                    },
                    'message': 'Trial notification statistics (fallback)',
                    'request_id': context.request_id,
                    'note': 'Database not available, showing test data'
                })
            }
    
    return {
        'statusCode': 405,
        'headers': {'Content-Type': 'application/json'},
        'body': json.dumps({'error': 'Method not allowed'})
    }


def send_trial_expiration_email(smtp_host: str, smtp_port: int, smtp_user: str, 
                               smtp_password: str, from_email: str,
                               to_email: str, user_name: str, company_name: str) -> bool:
    '''
    Отправляет email-уведомление об истечении пробного периода
    '''
    try:
        # Создаем сообщение
        msg = MIMEMultipart('alternative')
        msg['Subject'] = 'Ваш пробный период скоро закончится - Business Market'
        msg['From'] = from_email
        msg['To'] = to_email
        
        # HTML версия письма
        html_body = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body {{ font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }}
                .container {{ max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }}
                .header {{ background: linear-gradient(135deg, #10b981, #3b82f6); color: white; padding: 30px; text-align: center; }}
                .content {{ padding: 30px; }}
                .warning-box {{ background-color: #fef3cd; border: 1px solid #fbbf24; border-radius: 8px; padding: 20px; margin: 20px 0; }}
                .button {{ display: inline-block; background-color: #10b981; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; margin: 10px 0; }}
                .footer {{ background-color: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }}
                .features {{ background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; }}
                .feature-item {{ display: flex; align-items: center; margin: 10px 0; }}
                .checkmark {{ color: #10b981; font-weight: bold; margin-right: 10px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>⏰ Напоминание о пробном периоде</h1>
                    <p>Business Market - платформа для бизнеса</p>
                </div>
                
                <div class="content">
                    <h2>Здравствуйте, {user_name}!</h2>
                    
                    <p>Мы хотим напомнить вам, что пробный период для компании <strong>{company_name}</strong> на платформе Business Market заканчивается через <strong>7 дней</strong>.</p>
                    
                    <div class="warning-box">
                        <h3>🎯 Что произойдет после окончания пробного периода?</h3>
                        <p>После окончания бесплатного периода автоматически активируется выбранный вами тарифный план. Чтобы избежать перерыва в работе, рекомендуем выбрать подходящий тариф заранее.</p>
                    </div>
                    
                    <div class="features">
                        <h3>💎 Что вы получаете с платным тарифом:</h3>
                        <div class="feature-item">
                            <span class="checkmark">✅</span>
                            <span>Неограниченное размещение товаров</span>
                        </div>
                        <div class="feature-item">
                            <span class="checkmark">✅</span>
                            <span>Продвижение в поиске и каталогах</span>
                        </div>
                        <div class="feature-item">
                            <span class="checkmark">✅</span>
                            <span>Подробная аналитика и отчеты</span>
                        </div>
                        <div class="feature-item">
                            <span class="checkmark">✅</span>
                            <span>Приоритетная поддержка клиентов</span>
                        </div>
                        <div class="feature-item">
                            <span class="checkmark">✅</span>
                            <span>API для интеграции с вашими системами</span>
                        </div>
                    </div>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="https://business-market.ru/pricing" class="button">Выбрать тариф</a>
                        <a href="https://business-market.ru/dashboard" class="button" style="background-color: #6b7280;">Личный кабинет</a>
                    </div>
                    
                    <p>Если у вас есть вопросы, наша команда поддержки всегда готова помочь. Просто ответьте на это письмо или свяжитесь с нами через платформу.</p>
                    
                    <p>С уважением,<br>
                    Команда Business Market</p>
                </div>
                
                <div class="footer">
                    <p>Business Market - платформа для развития бизнеса</p>
                    <p>Это письмо отправлено автоматически. Пожалуйста, не отвечайте на него.</p>
                    <p><a href="https://business-market.ru/unsubscribe">Отписаться от уведомлений</a></p>
                </div>
            </div>
        </body>
        </html>
        """
        
        # Текстовая версия письма
        text_body = f"""
        Здравствуйте, {user_name}!
        
        Мы хотим напомнить вам, что пробный период для компании {company_name} на платформе Business Market заканчивается через 7 дней.
        
        После окончания бесплатного периода автоматически активируется выбранный вами тарифный план.
        
        Что вы получаете с платным тарифом:
        ✅ Неограниченное размещение товаров
        ✅ Продвижение в поиске и каталогах  
        ✅ Подробная аналитика и отчеты
        ✅ Приоритетная поддержка клиентов
        ✅ API для интеграции с вашими системами
        
        Выбрать тариф: https://business-market.ru/pricing
        Личный кабинет: https://business-market.ru/dashboard
        
        С уважением,
        Команда Business Market
        """
        
        # Добавляем части сообщения
        text_part = MIMEText(text_body, 'plain', 'utf-8')
        html_part = MIMEText(html_body, 'html', 'utf-8')
        
        msg.attach(text_part)
        msg.attach(html_part)
        
        # Отправляем email
        with smtplib.SMTP(smtp_host, smtp_port) as server:
            server.starttls()
            server.login(smtp_user, smtp_password)
            server.send_message(msg)
        
        return True
        
    except Exception as e:
        print(f"Failed to send email to {to_email}: {str(e)}")
        return False