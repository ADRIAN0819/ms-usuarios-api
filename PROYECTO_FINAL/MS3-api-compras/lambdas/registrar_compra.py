import boto3
import json
import uuid
import os
from datetime import datetime
from middleware.validarTokenAcceso import validar_token

# Headers CORS para todas las respuestas
cors_headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
}

dynamodb = boto3.resource('dynamodb')
productos_table = dynamodb.Table(os.environ['PRODUCTOS_TABLE'])
compras_table = dynamodb.Table(os.environ['COMPRAS_TABLE'])

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
        # Validar token
        token_validacion = validar_token(event['headers'])
        if not token_validacion['ok']:
            # Agregar headers CORS a la respuesta de error
            error_response = token_validacion['respuesta']
            error_response['headers'] = cors_headers
            return error_response

        datos_token = token_validacion['datos']
        body = json.loads(event['body'])
        productos = body.get('productos', [])

        if not productos:
            return {
                'statusCode': 400,
                'headers': cors_headers,
                'body': json.dumps({'error': 'Debes incluir productos en la compra'})
            }

        productos_confirmados = []

        for p in productos:
            codigo = p.get('codigo')
            cantidad = p.get('cantidad', 1)

            if not codigo or cantidad <= 0:
                return {
                    'statusCode': 400,
                    'headers': cors_headers,
                    'body': json.dumps({'error': f'Producto inválido: {p}'})
                }

            resultado = productos_table.get_item(Key={'codigo': codigo})
            item = resultado.get('Item')

            if not item:
                return {
                    'statusCode': 404,
                    'headers': cors_headers,
                    'body': json.dumps({'error': f'Producto {codigo} no encontrado'})
                }

            if item.get('cantidad', 0) < cantidad:
                return {
                    'statusCode': 400,
                    'headers': cors_headers,
                    'body': json.dumps({'error': f'Stock insuficiente para {codigo}'})
                }

            # Descontar stock
            productos_table.update_item(
                Key={'codigo': codigo},
                UpdateExpression='SET cantidad = cantidad - :c',
                ConditionExpression='cantidad >= :c',
                ExpressionAttributeValues={':c': cantidad}
            )

            productos_confirmados.append({
                'codigo': codigo,
                'nombre': item['nombre'],
                'precio_unitario': item['precio'],
                'cantidad': cantidad
            })

        compra = {
            'compra_id': str(uuid.uuid4()),
            'user_id': datos_token['user_id'],
            'tenant_id': datos_token['tenant_id'],  # ← NUEVO: se asocia compra al tenant
            'productos': productos_confirmados,
            'fecha': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        }

        compras_table.put_item(Item=compra)

        return {
            'statusCode': 200,
            'headers': cors_headers,
            'body': json.dumps({'mensaje': 'Compra registrada', 'compra_id': compra['compra_id']})
        }
    
    except Exception as e:
        print("ERROR:", str(e))
        return {
            'statusCode': 500,
            'headers': cors_headers,
            'body': json.dumps({'error': str(e)})
        }
