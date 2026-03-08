import json
import os
import psycopg2
import bcrypt
import jwt
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
from pydantic import BaseModel, Field, ValidationError, EmailStr

class UserRegistration(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    confirm_password: str
    user_type: str = Field(..., pattern='^(buyer|supplier)$')
    first_name: str = Field(..., min_length=1)
    last_name: str = Field(..., min_length=1)
    phone: str
    
    # Данные покупателя (опциональные)
    company_name: Optional[str] = None
    position: Optional[str] = None
    business_type: Optional[str] = None
    purchase_volume: Optional[str] = None
    interests: Optional[list] = None
    
    # Данные поставщика (обязательные для поставщиков)
    contact_person: Optional[str] = None
    website: Optional[str] = None
    supplier_business_type: Optional[str] = None
    description: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

def get_db_connection():
    """Создание подключения к базе данных"""
    database_url = os.environ.get('DATABASE_URL')
    if not database_url:
        raise Exception('DATABASE_URL environment variable not set')
    
    return psycopg2.connect(database_url)

def hash_password(password: str) -> str:
    """Хеширование пароля"""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    """Проверка пароля"""
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def generate_jwt_token(user_id: int, email: str, user_type: str) -> str:
    """Генерация JWT токена"""
    payload = {
        'user_id': user_id,
        'email': email,
        'user_type': user_type,
        'exp': datetime.utcnow() + timedelta(days=7)
    }
    
    # В продакшене используйте секретный ключ из переменных окружения
    secret_key = os.environ.get('JWT_SECRET', 'your-secret-key-here')
    return jwt.encode(payload, secret_key, algorithm='HS256')

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Регистрация и авторизация пользователей
    Args: event с httpMethod, body для POST запросов
    Returns: HTTP response с токеном или ошибкой
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
    
    try:
        if method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            action = body_data.get('action')
            
            if action == 'register':
                return register_user(body_data)
            elif action == 'login':
                return login_user(body_data)
            else:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Invalid action'})
                }
        
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Server error: {str(e)}'})
        }

def register_user(data: dict) -> Dict[str, Any]:
    """Регистрация нового пользователя"""
    try:
        # Валидация данных
        user_data = UserRegistration(**data)
        
        # Проверка совпадения паролей
        if user_data.password != user_data.confirm_password:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Пароли не совпадают'})
            }
        
        # Дополнительная валидация для поставщиков
        if user_data.user_type == 'supplier':
            if not all([user_data.contact_person, user_data.supplier_business_type, user_data.description]):
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Для поставщиков обязательны: контактное лицо, тип бизнеса, описание'})
                }
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        try:
            # Проверка существования пользователя
            cursor.execute('SELECT id FROM users WHERE email = %s', (user_data.email,))
            if cursor.fetchone():
                return {
                    'statusCode': 409,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Пользователь с таким email уже существует'})
                }
            
            # Хеширование пароля
            password_hash = hash_password(user_data.password)
            
            # Создание пользователя
            cursor.execute('''
                INSERT INTO users (email, password_hash, user_type, first_name, last_name, phone)
                VALUES (%s, %s, %s, %s, %s, %s)
                RETURNING id
            ''', (
                user_data.email,
                password_hash,
                user_data.user_type,
                user_data.first_name,
                user_data.last_name,
                user_data.phone
            ))
            
            user_id = cursor.fetchone()[0]
            
            # Создание профиля в зависимости от типа пользователя
            if user_data.user_type == 'buyer':
                cursor.execute('''
                    INSERT INTO buyer_profiles (user_id, company_name, position, business_type, purchase_volume, interests)
                    VALUES (%s, %s, %s, %s, %s, %s)
                ''', (
                    user_id,
                    user_data.company_name,
                    user_data.position,
                    user_data.business_type,
                    user_data.purchase_volume,
                    user_data.interests or []
                ))
            
            elif user_data.user_type == 'supplier':
                cursor.execute('''
                    INSERT INTO supplier_profiles (user_id, company_name, contact_person, website, business_type, description)
                    VALUES (%s, %s, %s, %s, %s, %s)
                ''', (
                    user_id,
                    user_data.company_name or user_data.contact_person,  # Используем контактное лицо как fallback
                    user_data.contact_person,
                    user_data.website,
                    user_data.supplier_business_type,
                    user_data.description
                ))
            
            conn.commit()
            
            # Генерация JWT токена
            token = generate_jwt_token(user_id, user_data.email, user_data.user_type)
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'message': 'Пользователь успешно зарегистрирован',
                    'token': token,
                    'user': {
                        'id': user_id,
                        'email': user_data.email,
                        'user_type': user_data.user_type,
                        'first_name': user_data.first_name,
                        'last_name': user_data.last_name
                    }
                })
            }
            
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            cursor.close()
            conn.close()
            
    except ValidationError as e:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Данные не прошли валидацию', 'details': e.errors()})
        }

def login_user(data: dict) -> Dict[str, Any]:
    """Авторизация пользователя"""
    try:
        # Валидация данных
        login_data = UserLogin(**data)
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        try:
            # Поиск пользователя
            cursor.execute('''
                SELECT id, email, password_hash, user_type, first_name, last_name, is_active
                FROM users 
                WHERE email = %s
            ''', (login_data.email,))
            
            user = cursor.fetchone()
            if not user:
                return {
                    'statusCode': 401,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Неверный email или пароль'})
                }
            
            user_id, email, password_hash, user_type, first_name, last_name, is_active = user
            
            # Проверка активности аккаунта
            if not is_active:
                return {
                    'statusCode': 403,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Аккаунт заблокирован'})
                }
            
            # Проверка пароля
            if not verify_password(login_data.password, password_hash):
                return {
                    'statusCode': 401,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Неверный email или пароль'})
                }
            
            # Генерация JWT токена
            token = generate_jwt_token(user_id, email, user_type)
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'message': 'Успешная авторизация',
                    'token': token,
                    'user': {
                        'id': user_id,
                        'email': email,
                        'user_type': user_type,
                        'first_name': first_name,
                        'last_name': last_name
                    }
                })
            }
            
        finally:
            cursor.close()
            conn.close()
            
    except ValidationError as e:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Данные не прошли валидацию', 'details': e.errors()})
        }