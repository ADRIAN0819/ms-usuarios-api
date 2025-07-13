import boto3
import hashlib
import uuid
from datetime import datetime, timedelta
import json
import os  # para leer variables de entorno

# Headers CORS para todas las respuestas
cors_headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
}

def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

def lambda_handler(event, context):
    print("Evento recibido:", event)
    
    # Manejar requests OPTIONS para CORS preflight
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': cors_headers,
            'body': json.dumps({'message': 'CORS preflight'})
        }
    
    try:
        # Convertir body JSON
        body = json.loads(event['body'])
        user_id = body.get('user_id')
        password = body.get('password')
        print("Usuario:", user_id)

        if not user_id or not password:
            return {
                'statusCode': 400,
                'headers': cors_headers,
                'body': json.dumps({'error': 'Faltan user_id o password'})
            }

        hashed_password = hash_password(password)

        dynamodb = boto3.resource('dynamodb')

        # Leer nombre de tabla de usuarios desde variable de entorno
        table_name = os.environ['TABLE_NAME']
        table = dynamodb.Table(table_name)
        response = table.get_item(Key={ 'user_id': user_id })
        print("Respuesta DynamoDB:", response)

        if 'Item' not in response:
            return {
                'statusCode': 403,
                'headers': cors_headers,
                'body': json.dumps({'error': 'Usuario no existe'})
            }

        hashed_password_bd = response['Item']['password']
        if hashed_password != hashed_password_bd:
            return {
                'statusCode': 403,
                'headers': cors_headers,
                'body': json.dumps({'error': 'Password incorrecto'})
            }

        # Recuperar tenant_id del usuario
        tenant_id = response['Item'].get('tenant_id')
        if not tenant_id:
            return {
                'statusCode': 500,
                'headers': cors_headers,
                'body': json.dumps({'error': 'El usuario no tiene tenant_id'})
            }

        token = str(uuid.uuid4())
        fecha_hora_exp = datetime.now() + timedelta(minutes=60)

        # Leer nombre de tabla de tokens desde variable de entorno
        tokens_table_name = os.environ['TOKENS_TABLE']
        table_tokens = dynamodb.Table(tokens_table_name)
        table_tokens.put_item(Item={
            'token': token,
            'expires': fecha_hora_exp.strftime('%Y-%m-%d %H:%M:%S'),
            'user_id': user_id,
            'tenant_id': tenant_id  # ← agregado
        })

        return {
            'statusCode': 200,
            'headers': cors_headers,
            'body': json.dumps({
                'token': token,
                'tenant_id': tenant_id  # ← opcional pero útil
            })
        }

    except Exception as e:
        print("ERROR:", str(e))
        return {
            'statusCode': 500,
            'headers': cors_headers,
            'body': json.dumps({'error': str(e)})
        }
