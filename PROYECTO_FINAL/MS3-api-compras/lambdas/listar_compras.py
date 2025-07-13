import boto3
import json
import os
import decimal
from middleware.validarTokenAcceso import validar_token

# Headers CORS para todas las respuestas
cors_headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
    'Access-Control-Allow-Methods': 'GET, OPTIONS'
}

# Custom encoder para manejar Decimals
class DecimalEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, decimal.Decimal):
            return float(o)
        return super(DecimalEncoder, self).default(o)

def lambda_handler(event, context):
    print("Evento recibido:", event)
    
    # Manejar requests OPTIONS para CORS preflight
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': cors_headers,
            'body': json.dumps({'message': 'CORS preflight'})
        }
    
    # Validar el token
    token_validacion = validar_token(event['headers'])
    if not token_validacion['ok']:
        # Agregar headers CORS a la respuesta de error
        error_response = token_validacion['respuesta']
        error_response['headers'] = cors_headers
        return error_response

    datos_token = token_validacion['datos']

    # Obtener tabla desde variable de entorno
    tabla = boto3.resource('dynamodb').Table(os.environ['COMPRAS_TABLE'])

    try:
        # Obtener compras del usuario y tenant autenticado
        resultado = tabla.scan(
            FilterExpression='user_id = :uid AND tenant_id = :tid',
            ExpressionAttributeValues={
                ':uid': datos_token['user_id'],
                ':tid': datos_token['tenant_id']
            }
        )

        return {
            'statusCode': 200,
            'headers': cors_headers,
            'body': json.dumps(resultado.get('Items', []), cls=DecimalEncoder)
        }
    
    except Exception as e:
        print("ERROR:", str(e))
        return {
            'statusCode': 500,
            'headers': cors_headers,
            'body': json.dumps({'error': str(e)})
        }
