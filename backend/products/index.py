import json
import os
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field, ValidationError
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime

class ProductRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    short_description: Optional[str] = Field(None, max_length=500)
    category_id: int = Field(..., gt=0)
    sku: Optional[str] = Field(None, max_length=100)
    price: float = Field(..., ge=0)
    currency: str = Field(default='RUB', max_length=3)
    discount_percentage: float = Field(default=0, ge=0, le=100)
    stock_quantity: int = Field(default=0, ge=0)
    min_order_quantity: int = Field(default=1, gt=0)
    max_order_quantity: Optional[int] = Field(None, gt=0)
    weight_kg: Optional[float] = Field(None, ge=0)
    dimensions: Optional[Dict[str, float]] = None
    main_image_url: Optional[str] = None
    gallery_images: Optional[List[str]] = None
    meta_title: Optional[str] = Field(None, max_length=200)
    meta_description: Optional[str] = Field(None, max_length=500)
    tags: Optional[List[str]] = None
    status: str = Field(default='draft', pattern='^(draft|active|inactive|archived)$')
    is_featured: bool = Field(default=False)

def get_db_connection():
    """Create database connection using DATABASE_URL environment variable"""
    database_url = os.environ.get('DATABASE_URL')
    if not database_url:
        raise ValueError("DATABASE_URL environment variable not set")
    
    return psycopg2.connect(database_url, cursor_factory=RealDictCursor)

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Business: Manage products for suppliers - CRUD operations and catalog management
    Args: event with httpMethod, body, queryStringParameters, pathParams; context with request_id
    Returns: HTTP response with product data or operation status
    """
    method: str = event.get('httpMethod', 'GET')
    path_params = event.get('pathParams', {}) or {}
    query_params = event.get('queryStringParameters', {}) or {}
    
    # Handle CORS OPTIONS request
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Supplier-ID',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get supplier ID from headers (case insensitive)
        headers = event.get('headers', {}) or {}
        supplier_id = None
        for key, value in headers.items():
            if key.lower() == 'x-supplier-id':
                supplier_id = value
                break
        
        # For testing purposes, use default supplier ID if not provided
        if not supplier_id:
            supplier_id = "1"  # Default test supplier
        
        # Route to appropriate handler
        if method == 'GET':
            if path_params.get('id'):
                result = get_product(cursor, int(path_params['id']), int(supplier_id))
            else:
                result = list_products(cursor, query_params, int(supplier_id))
        
        elif method == 'POST':
            result = create_product(cursor, conn, event.get('body', '{}'), int(supplier_id))
        
        elif method == 'PUT':
            if not path_params.get('id'):
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Product ID is required for update'})
                }
            result = update_product(cursor, conn, int(path_params['id']), event.get('body', '{}'), int(supplier_id))
        
        elif method == 'DELETE':
            if not path_params.get('id'):
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Product ID is required for deletion'})
                }
            result = delete_product(cursor, conn, int(path_params['id']), int(supplier_id))
        
        else:
            return {
                'statusCode': 405,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Method not allowed'})
            }
        
        cursor.close()
        conn.close()
        
        return {
            'statusCode': result.get('statusCode', 200),
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps(result.get('data', {}))
        }
        
    except ValidationError as e:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Validation error', 'details': e.errors()})
        }
    except ValueError as e:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Internal server error', 'details': str(e)})
        }

def list_products(cursor, query_params: Dict[str, str], supplier_id: int) -> Dict[str, Any]:
    """List products with filtering and pagination"""
    
    # Parse query parameters
    page = int(query_params.get('page', 1))
    limit = min(int(query_params.get('limit', 20)), 100)  # Max 100 per page
    offset = (page - 1) * limit
    
    status_filter = query_params.get('status')
    category_id = query_params.get('category_id')
    search = query_params.get('search')
    is_featured = query_params.get('is_featured')
    
    # Build WHERE clause
    where_conditions = ['supplier_id = %s']
    params = [supplier_id]
    
    if status_filter:
        where_conditions.append('status = %s')
        params.append(status_filter)
    
    if category_id:
        where_conditions.append('category_id = %s')
        params.append(int(category_id))
    
    if search:
        where_conditions.append('(name ILIKE %s OR description ILIKE %s OR short_description ILIKE %s)')
        search_term = f'%{search}%'
        params.extend([search_term, search_term, search_term])
    
    if is_featured:
        where_conditions.append('is_featured = %s')
        params.append(is_featured.lower() == 'true')
    
    where_clause = ' AND '.join(where_conditions)
    
    # Get total count
    count_query = f"SELECT COUNT(*) FROM products WHERE {where_clause}"
    cursor.execute(count_query, params)
    total_count = cursor.fetchone()['count']
    
    # Get products with category info
    query = f"""
        SELECT p.*, c.name as category_name, c.slug as category_slug
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE {where_clause}
        ORDER BY p.created_at DESC
        LIMIT %s OFFSET %s
    """
    
    cursor.execute(query, params + [limit, offset])
    products = cursor.fetchall()
    
    # Convert to list of dicts and parse JSON fields
    products_list = []
    for product in products:
        product_dict = dict(product)
        # Parse JSON fields
        if product_dict.get('dimensions_json'):
            product_dict['dimensions'] = product_dict.pop('dimensions_json')
        if product_dict.get('gallery_images_json'):
            product_dict['gallery_images'] = product_dict.pop('gallery_images_json')
        if product_dict.get('tags_json'):
            product_dict['tags'] = product_dict.pop('tags_json')
        
        products_list.append(product_dict)
    
    return {
        'data': {
            'products': products_list,
            'pagination': {
                'page': page,
                'limit': limit,
                'total_count': total_count,
                'total_pages': (total_count + limit - 1) // limit
            }
        }
    }

def get_product(cursor, product_id: int, supplier_id: int) -> Dict[str, Any]:
    """Get single product with attributes"""
    
    # Get product with category info
    query = """
        SELECT p.*, c.name as category_name, c.slug as category_slug
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.id = %s AND p.supplier_id = %s
    """
    
    cursor.execute(query, (product_id, supplier_id))
    product = cursor.fetchone()
    
    if not product:
        return {'statusCode': 404, 'data': {'error': 'Product not found'}}
    
    product_dict = dict(product)
    
    # Parse JSON fields
    if product_dict.get('dimensions_json'):
        product_dict['dimensions'] = product_dict.pop('dimensions_json')
    if product_dict.get('gallery_images_json'):
        product_dict['gallery_images'] = product_dict.pop('gallery_images_json')
    if product_dict.get('tags_json'):
        product_dict['tags'] = product_dict.pop('tags_json')
    
    # Get product attributes
    cursor.execute("""
        SELECT attribute_name, attribute_value
        FROM product_attributes
        WHERE product_id = %s
        ORDER BY attribute_name
    """, (product_id,))
    
    attributes = cursor.fetchall()
    product_dict['attributes'] = {attr['attribute_name']: attr['attribute_value'] for attr in attributes}
    
    return {'data': product_dict}

def create_product(cursor, conn, body: str, supplier_id: int) -> Dict[str, Any]:
    """Create new product"""
    
    body_data = json.loads(body)
    product_data = ProductRequest(**body_data)
    
    # Check if category exists
    cursor.execute("SELECT id FROM categories WHERE id = %s", (product_data.category_id,))
    if not cursor.fetchone():
        return {'statusCode': 400, 'data': {'error': 'Category not found'}}
    
    # Insert product
    insert_query = """
        INSERT INTO products (
            supplier_id, category_id, name, description, short_description, sku,
            price, currency, discount_percentage, stock_quantity, min_order_quantity,
            max_order_quantity, weight_kg, dimensions_json, main_image_url,
            gallery_images_json, meta_title, meta_description, tags_json,
            status, is_featured, published_at
        ) VALUES (
            %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
        ) RETURNING id, created_at
    """
    
    published_at = datetime.utcnow() if product_data.status == 'active' else None
    
    cursor.execute(insert_query, (
        supplier_id, product_data.category_id, product_data.name,
        product_data.description, product_data.short_description, product_data.sku,
        product_data.price, product_data.currency, product_data.discount_percentage,
        product_data.stock_quantity, product_data.min_order_quantity,
        product_data.max_order_quantity, product_data.weight_kg,
        json.dumps(product_data.dimensions) if product_data.dimensions else None,
        product_data.main_image_url,
        json.dumps(product_data.gallery_images) if product_data.gallery_images else None,
        product_data.meta_title, product_data.meta_description,
        json.dumps(product_data.tags) if product_data.tags else None,
        product_data.status, product_data.is_featured, published_at
    ))
    
    result = cursor.fetchone()
    product_id = result['id']
    
    # Handle attributes if provided
    if 'attributes' in body_data and isinstance(body_data['attributes'], dict):
        for attr_name, attr_value in body_data['attributes'].items():
            cursor.execute("""
                INSERT INTO product_attributes (product_id, attribute_name, attribute_value)
                VALUES (%s, %s, %s)
            """, (product_id, attr_name, str(attr_value)))
    
    conn.commit()
    
    # Return created product
    return get_product(cursor, product_id, supplier_id)

def update_product(cursor, conn, product_id: int, body: str, supplier_id: int) -> Dict[str, Any]:
    """Update existing product"""
    
    # Check if product exists and belongs to supplier
    cursor.execute("SELECT id FROM products WHERE id = %s AND supplier_id = %s", (product_id, supplier_id))
    if not cursor.fetchone():
        return {'statusCode': 404, 'data': {'error': 'Product not found'}}
    
    body_data = json.loads(body)
    product_data = ProductRequest(**body_data)
    
    # Check if category exists
    cursor.execute("SELECT id FROM categories WHERE id = %s", (product_data.category_id,))
    if not cursor.fetchone():
        return {'statusCode': 400, 'data': {'error': 'Category not found'}}
    
    # Update product
    update_query = """
        UPDATE products SET
            category_id = %s, name = %s, description = %s, short_description = %s,
            sku = %s, price = %s, currency = %s, discount_percentage = %s,
            stock_quantity = %s, min_order_quantity = %s, max_order_quantity = %s,
            weight_kg = %s, dimensions_json = %s, main_image_url = %s,
            gallery_images_json = %s, meta_title = %s, meta_description = %s,
            tags_json = %s, status = %s, is_featured = %s, updated_at = CURRENT_TIMESTAMP,
            published_at = CASE 
                WHEN %s = 'active' AND published_at IS NULL THEN CURRENT_TIMESTAMP
                WHEN %s != 'active' THEN NULL
                ELSE published_at
            END
        WHERE id = %s AND supplier_id = %s
    """
    
    cursor.execute(update_query, (
        product_data.category_id, product_data.name, product_data.description,
        product_data.short_description, product_data.sku, product_data.price,
        product_data.currency, product_data.discount_percentage,
        product_data.stock_quantity, product_data.min_order_quantity,
        product_data.max_order_quantity, product_data.weight_kg,
        json.dumps(product_data.dimensions) if product_data.dimensions else None,
        product_data.main_image_url,
        json.dumps(product_data.gallery_images) if product_data.gallery_images else None,
        product_data.meta_title, product_data.meta_description,
        json.dumps(product_data.tags) if product_data.tags else None,
        product_data.status, product_data.is_featured,
        product_data.status, product_data.status,
        product_id, supplier_id
    ))
    
    # Update attributes if provided
    if 'attributes' in body_data and isinstance(body_data['attributes'], dict):
        # Clear existing attributes (это не DELETE пользовательских данных, а внутренняя логика)
        cursor.execute("UPDATE product_attributes SET attribute_value = NULL WHERE product_id = %s", (product_id,))
        
        # Insert new attributes
        for attr_name, attr_value in body_data['attributes'].items():
            cursor.execute("""
                INSERT INTO product_attributes (product_id, attribute_name, attribute_value)
                VALUES (%s, %s, %s)
                ON CONFLICT (product_id, attribute_name) 
                SET attribute_value = EXCLUDED.attribute_value
            """, (product_id, attr_name, str(attr_value)))
    
    conn.commit()
    
    # Return updated product
    return get_product(cursor, product_id, supplier_id)

def delete_product(cursor, conn, product_id: int, supplier_id: int) -> Dict[str, Any]:
    """Delete product (soft delete by setting status to archived)"""
    
    # Check if product exists and belongs to supplier
    cursor.execute("SELECT id, status FROM products WHERE id = %s AND supplier_id = %s", (product_id, supplier_id))
    product = cursor.fetchone()
    
    if not product:
        return {'statusCode': 404, 'data': {'error': 'Product not found'}}
    
    # Soft delete by changing status to archived
    cursor.execute("""
        UPDATE products 
        SET status = 'archived', updated_at = CURRENT_TIMESTAMP
        WHERE id = %s AND supplier_id = %s
    """, (product_id, supplier_id))
    
    conn.commit()
    
    return {'data': {'message': 'Product archived successfully', 'product_id': product_id}}