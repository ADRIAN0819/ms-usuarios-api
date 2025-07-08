import os
import json
import boto3
from datetime import datetime

dynamodb = boto3.resource('dynamodb')

def validar_token(headers):
    raw_token = headers.get('x-auth-token') or headers.get('authorization') or headers.get('Authorization')
    token = raw_token.replace('Bearer ', '') if raw_token else None

    if not token:
        return {
            'ok': False,
            'respuesta': {
                'statusCode': 401,
                'body': json.dumps({'mensaje': 'Token no proporcionado'})
            }
        }

    try:
        table_name = os.environ['TOKENS_TABLE']
        table = dynamodb.Table(table_name)

        res = table.get_item(Key={'token': token})

        if 'Item' not in res:
            return {
                'ok': False,
                'respuesta': {
                    'statusCode': 403,
                    'body': json.dumps({'mensaje': 'Token no existe'})
                }
            }

        item = res['Item']
        now = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        if now > item['expires']:
            return {
                'ok': False,
                'respuesta': {
                    'statusCode': 403,
                    'body': json.dumps({'mensaje': 'Token expirado'})
                }
            }

        return {
            'ok': True,
            'datos': item
        }

    except Exception as e:
        return {
            'ok': False,
            'respuesta': {
                'statusCode': 500,
                'body': json.dumps({'mensaje': 'Error al validar token', 'detalle': str(e)})
            }
        }

