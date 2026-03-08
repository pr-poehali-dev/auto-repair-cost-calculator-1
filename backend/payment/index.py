import json
import os
import hashlib
import urllib.parse


def handler(event: dict, context) -> dict:
    """
    API для создания платежа через Robokassa
    
    Принимает данные о тарифе и создает платежную ссылку
    """
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id'
            },
            'body': '',
            'isBase64Encoded': False
        }

    if method == 'POST':
        try:
            body = json.loads(event.get('body', '{}'))
            
            plan_name = body.get('planName', '')
            amount = body.get('amount', 0)
            period = body.get('period', 'monthly')
            user_email = body.get('email', '')
            
            if not plan_name or not amount:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({
                        'error': 'Не указаны обязательные параметры: planName, amount'
                    }),
                    'isBase64Encoded': False
                }
            
            merchant_login = os.environ.get('ROBOKASSA_MERCHANT_LOGIN', '')
            password1 = os.environ.get('ROBOKASSA_PASSWORD1', '')
            is_test = os.environ.get('ROBOKASSA_TEST_MODE', 'true').lower() == 'true'
            
            inv_id = f"{int(context.request_id.replace('-', '')[:10], 16)}"
            description = f"Оплата тарифа {plan_name} ({period})"
            
            signature_string = f"{merchant_login}:{amount}:{inv_id}:{password1}"
            signature = hashlib.md5(signature_string.encode()).hexdigest()
            
            base_url = "https://auth.robokassa.ru/Merchant/Index.aspx"
            params = {
                'MerchantLogin': merchant_login,
                'OutSum': amount,
                'InvId': inv_id,
                'Description': description,
                'SignatureValue': signature,
                'IsTest': '1' if is_test else '0',
                'Culture': 'ru'
            }
            
            if user_email:
                params['Email'] = user_email
            
            params['Shp_planName'] = plan_name
            params['Shp_period'] = period
            
            payment_url = f"{base_url}?{urllib.parse.urlencode(params)}"
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'paymentUrl': payment_url,
                    'invoiceId': inv_id,
                    'amount': amount,
                    'description': description
                }),
                'isBase64Encoded': False
            }
            
        except Exception as e:
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'error': f'Ошибка создания платежа: {str(e)}'
                }),
                'isBase64Encoded': False
            }

    return {
        'statusCode': 405,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({'error': 'Метод не поддерживается'}),
        'isBase64Encoded': False
    }
