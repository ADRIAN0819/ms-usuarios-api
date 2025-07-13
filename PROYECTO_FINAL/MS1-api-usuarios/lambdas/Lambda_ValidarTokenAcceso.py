import boto3
from datetime import datetime
import json
import os  # para leer variables de entorno

# Headers CORS para todas las respuestas
cors_headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
}

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
        # Verificar que el body no sea None
        if not event.get('body'):
            return {
                'statusCode': 400,
                'headers': cors_headers,
                'body': json.dumps({'error': 'Cuerpo del request vacío'})
            }
        
        # Asegurarse que el cuerpo sea JSON
        body = json.loads(event['body'])
        token = body.get('token')

        if not token:
            return {
                'statusCode': 400,
                'headers': cors_headers,
                'body': json.dumps({'error': 'Token no proporcionado'})
            }

        # Consultar DynamoDB
        dynamodb = boto3.resource('dynamodb')
        tokens_table_name = os.environ['TOKENS_TABLE']
        table = dynamodb.Table(tokens_table_name)
        response = table.get_item(Key={'token': token})

        print("Respuesta de DynamoDB:", response)

        if 'Item' not in response:
            return {
                'statusCode': 403,
                'headers': cors_headers,
                'body': json.dumps({'error': 'Token no existe'})
            }

        expires = response['Item']['expires']
        now = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

        if now > expires:
            return {
                'statusCode': 403,
                'headers': cors_headers,
                'body': json.dumps({'error': 'Token expirado'})
            }

        tenant_id = response['Item'].get('tenant_id', None)
        user_id = response['Item'].get('user_id', None)

        return {
            'statusCode': 200,
            'headers': cors_headers,
            'body': json.dumps({
                'message': 'Token válido',
                'tenant_id': tenant_id,
                'user_id': user_id
            })
        }

    except Exception as e:
        print("ERROR:", str(e))
        return {
            'statusCode': 500,
            'headers': cors_headers,
            'body': json.dumps({'error': str(e)})
        }
