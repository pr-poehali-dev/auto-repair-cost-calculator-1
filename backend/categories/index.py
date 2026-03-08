import json
import os
from typing import Dict, Any, List
import psycopg2
from psycopg2.extras import RealDictCursor

def get_db_connection():
    """Create database connection using DATABASE_URL environment variable"""
    database_url = os.environ.get('DATABASE_URL')
    if not database_url:
        raise ValueError("DATABASE_URL environment variable not set")
    
    return psycopg2.connect(database_url, cursor_factory=RealDictCursor)

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Business: Get categories list for product classification and filtering
    Args: event with httpMethod, queryStringParameters; context with request_id
    Returns: HTTP response with categories data
    """
    method: str = event.get('httpMethod', 'GET')
    
    # Handle CORS OPTIONS request
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method != 'GET':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        query_params = event.get('queryStringParameters', {})
        include_counts = query_params.get('include_counts', 'false').lower() == 'true'
        
        if include_counts:
            # Get categories with product counts
            query = """
                SELECT c.*, COUNT(p.id) as product_count
                FROM categories c
                LEFT JOIN products p ON c.id = p.category_id AND p.status = 'active'
                GROUP BY c.id, c.name, c.description, c.slug, c.parent_id, c.created_at, c.updated_at
                ORDER BY c.name
            """
        else:
            # Get categories without counts (faster)
            query = """
                SELECT * FROM categories
                ORDER BY name
            """
        
        cursor.execute(query)
        categories = cursor.fetchall()
        
        # Convert to list of dicts
        categories_list = [dict(category) for category in categories]
        
        # Build hierarchical structure if needed
        parent_id = query_params.get('parent_id')
        if parent_id:
            if parent_id == 'null':
                # Get only root categories
                categories_list = [cat for cat in categories_list if cat['parent_id'] is None]
            else:
                # Get categories with specific parent
                categories_list = [cat for cat in categories_list if cat['parent_id'] == int(parent_id)]
        
        cursor.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'categories': categories_list,
                'total_count': len(categories_list)
            })
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Internal server error', 'details': str(e)})
        }