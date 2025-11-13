'''
Business: CRUD API for managing verified users and generating certificates
Args: event with httpMethod, body, queryStringParameters
Returns: HTTP response with user data or list of users
'''

import json
import os
from typing import Dict, Any, List
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime
import secrets

def generate_unique_id() -> str:
    """Generate a unique verification ID"""
    return f"VU-{secrets.token_hex(6).upper()}"

def get_db_connection():
    """Create database connection using simple query protocol"""
    database_url = os.environ.get('DATABASE_URL')
    return psycopg2.connect(database_url)

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        if method == 'GET':
            params = event.get('queryStringParameters') or {}
            unique_id = params.get('id')
            
            if unique_id:
                cursor.execute(
                    "SELECT * FROM verified_users WHERE unique_id = %s",
                    (unique_id,)
                )
                user = cursor.fetchone()
                
                if not user:
                    return {
                        'statusCode': 404,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'User not found'}),
                        'isBase64Encoded': False
                    }
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps(dict(user), default=str),
                    'isBase64Encoded': False
                }
            else:
                cursor.execute("SELECT * FROM verified_users ORDER BY created_at DESC")
                users = cursor.fetchall()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps([dict(user) for user in users], default=str),
                    'isBase64Encoded': False
                }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            
            unique_id = generate_unique_id()
            username = body_data.get('username')
            phone = body_data.get('phone')
            user_id = body_data.get('user_id')
            social_networks = json.dumps(body_data.get('social_networks', []))
            status = body_data.get('status', 'active')
            category = body_data.get('category', 'general')
            
            cursor.execute(
                """
                INSERT INTO verified_users (unique_id, username, phone, user_id, social_networks, status, category)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                RETURNING *
                """,
                (unique_id, username, phone, user_id, social_networks, status, category)
            )
            
            new_user = cursor.fetchone()
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(dict(new_user), default=str),
                'isBase64Encoded': False
            }
        
        elif method == 'DELETE':
            params = event.get('queryStringParameters') or {}
            unique_id = params.get('id')
            
            if not unique_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Missing id parameter'}),
                    'isBase64Encoded': False
                }
            
            cursor.execute("DELETE FROM verified_users WHERE unique_id = %s RETURNING *", (unique_id,))
            deleted_user = cursor.fetchone()
            conn.commit()
            
            if not deleted_user:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'User not found'}),
                    'isBase64Encoded': False
                }
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'message': 'User deleted successfully'}),
                'isBase64Encoded': False
            }
        
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    finally:
        cursor.close()
        conn.close()
