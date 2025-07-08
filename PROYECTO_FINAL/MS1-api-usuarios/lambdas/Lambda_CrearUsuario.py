import boto3
import hashlib
import json
import os  # para acceder a variables de entorno

def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

def lambda_handler(event, context):
    try:
        body = json.loads(event['body'])
        user_id = body.get('user_id')
        password = body.get('password')
        name = body.get('name')
        tenant_id = body.get('tenant_id')  # NUEVO

        if not user_id or not password or not tenant_id:
            return {
                'statusCode': 400,
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
            'body': json.dumps({'error': str(e)})
        }
