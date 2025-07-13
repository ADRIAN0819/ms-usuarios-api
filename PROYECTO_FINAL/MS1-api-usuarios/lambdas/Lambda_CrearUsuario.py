import boto3
import hashlib
import json
import os  # para acceder a variables de entorno

# Headers CORS para todas las respuestas
cors_headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
}

def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

def lambda_handler(event, context):
    print(event)
    
    # Manejar requests OPTIONS para CORS preflight
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': cors_headers,
            'body': json.dumps({'message': 'CORS preflight'})
        }
    
    try:
        # Verificar que el body no sea None
        if not event.get('body'):
            return {
                'statusCode': 400,
                'headers': cors_headers,
                'body': json.dumps({'error': 'Cuerpo del request vacío'})
            }
        
        body = json.loads(event['body'])
        user_id = body.get('user_id')
        password = body.get('password')
        name = body.get('name')
        tenant_id = body.get('tenant_id')

        if not user_id or not password or not tenant_id:
            return {
                'statusCode': 400,
                'headers': cors_headers,
                'body': json.dumps({'error': 'user_id, password y tenant_id son requeridos'})
            }

        hashed_password = hash_password(password)

        # Obtener el nombre de la tabla desde la variable de entorno
        table_name = os.environ['TABLE_NAME']
        dynamodb = boto3.resource('dynamodb')
        table = dynamodb.Table(table_name)

        item = {
            'user_id': user_id,
            'password': hashed_password,
            'tenant_id': tenant_id  # NUEVO
        }

        if name:
            item['name'] = name

        table.put_item(Item=item)

        return {
            'statusCode': 200,
            'headers': cors_headers,
            'body': json.dumps({
                'message': 'Usuario registrado correctamente',
                'user_id': user_id,
                'tenant_id': tenant_id  # NUEVO
            })
        }

    except Exception as e:
        print("ERROR:", str(e))
        return {
            'statusCode': 500,
            'headers': cors_headers,
            'body': json.dumps({'error': str(e)})
        }
