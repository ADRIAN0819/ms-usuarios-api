import boto3
import json
import os
from datetime import datetime
from decimal import Decimal
from typing import Dict, List, Any, Optional
import logging

# Configuración de logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Clientes AWS
s3_client = boto3.client('s3')
dynamodb_client = boto3.client('dynamodb')

# Variables de entorno
BUCKET_NAME = os.environ.get('BUCKET_NAME', 'dev-compras-backup-s3-bucket')
STAGE = os.environ.get('STAGE', 'dev')

class DecimalEncoder(json.JSONEncoder):
    """Encoder personalizado para manejar objetos Decimal de DynamoDB"""
    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)
        return super(DecimalEncoder, self).default(obj)

def format_compra_data(record: Dict[str, Any]) -> Dict[str, Any]:
    """
    Formatea los datos de la compra para almacenamiento en S3
    
    Args:
        record: Record de DynamoDB Stream
        
    Returns:
        Dict con datos formateados de la compra
    """
    try:
        # Obtener imagen nueva o antigua según el tipo de evento
        if 'NewImage' in record['dynamodb']:
            image_data = record['dynamodb']['NewImage']
        elif 'OldImage' in record['dynamodb']:
            image_data = record['dynamodb']['OldImage']
        else:
            logger.warning(f"No se encontró imagen en el record: {record}")
            return None

        # Convertir formato DynamoDB a formato Python
        compra_data = {
            'compra_id': image_data.get('compra_id', {}).get('S', ''),
            'user_id': image_data.get('user_id', {}).get('S', ''),
            'tenant_id': image_data.get('tenant_id', {}).get('S', ''),
            'fecha': image_data.get('fecha', {}).get('S', ''),
            'productos': [],
            'metadata': {
                'event_name': record['eventName'],
                'event_source': record['eventSource'],
                'aws_region': record['awsRegion'],
                'processed_at': datetime.now().isoformat(),
                'processed_by': 'lambda-streams-actualizador-compras',
                'stage': STAGE
            }
        }

        # Procesar productos si existen
        if 'productos' in image_data and 'L' in image_data['productos']:
            for producto_item in image_data['productos']['L']:
                if 'M' in producto_item:
                    producto_data = producto_item['M']
                    producto = {
                        'codigo': producto_data.get('codigo', {}).get('S', ''),
                        'nombre': producto_data.get('nombre', {}).get('S', ''),
                        'precio_unitario': float(producto_data.get('precio_unitario', {}).get('N', '0')),
                        'cantidad': int(producto_data.get('cantidad', {}).get('N', '0'))
                    }
                    compra_data['productos'].append(producto)

        # Calcular totales
        total_cantidad = sum(p['cantidad'] for p in compra_data['productos'])
        total_precio = sum(p['precio_unitario'] * p['cantidad'] for p in compra_data['productos'])
        
        compra_data['resumen'] = {
            'total_productos': len(compra_data['productos']),
            'total_cantidad': total_cantidad,
            'total_precio': round(total_precio, 2),
            'moneda': 'USD'
        }

        return compra_data

    except Exception as e:
        logger.error(f"Error formateando datos de compra: {str(e)}")
        logger.error(f"Record problemático: {json.dumps(record, indent=2)}")
        return None

def generate_s3_key(compra_data: Dict[str, Any], event_name: str) -> str:
    """
    Genera la clave S3 para almacenar el archivo de compra
    
    Args:
        compra_data: Datos de la compra
        event_name: Tipo de evento (INSERT, MODIFY, REMOVE)
        
    Returns:
        String con la clave S3
    """
    try:
        # Obtener fecha de la compra o usar fecha actual
        fecha_compra = compra_data.get('fecha', datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
        
        # Extraer año, mes, día de la fecha
        if ' ' in fecha_compra:
            fecha_part = fecha_compra.split(' ')[0]
        else:
            fecha_part = fecha_compra
            
        fecha_obj = datetime.strptime(fecha_part, '%Y-%m-%d')
        año = fecha_obj.year
        mes = fecha_obj.month
        día = fecha_obj.day
        
        tenant_id = compra_data.get('tenant_id', 'unknown')
        compra_id = compra_data.get('compra_id', 'unknown')
        
        # Timestamp para versioning
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        
        # Estructura: compras/{tenant_id}/{año}/{mes}/{día}/{evento}_{compra_id}_{timestamp}.json
        s3_key = f"compras/{tenant_id}/{año}/{mes:02d}/{día:02d}/{event_name.lower()}_{compra_id}_{timestamp}.json"
        
        return s3_key
        
    except Exception as e:
        logger.error(f"Error generando clave S3: {str(e)}")
        # Fallback key
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        return f"compras/error/{event_name.lower()}_{timestamp}.json"

def save_to_s3(compra_data: Dict[str, Any], s3_key: str) -> bool:
    """
    Guarda los datos de la compra en S3
    
    Args:
        compra_data: Datos de la compra
        s3_key: Clave S3 donde guardar
        
    Returns:
        Bool indicando si se guardó exitosamente
    """
    try:
        # Convertir a JSON con encoder personalizado
        json_data = json.dumps(compra_data, cls=DecimalEncoder, indent=2, ensure_ascii=False)
        
        # Metadatos para el objeto S3
        metadata = {
            'compra-id': compra_data.get('compra_id', '')[:1024],  # Límite de metadata
            'tenant-id': compra_data.get('tenant_id', '')[:1024],
            'user-id': compra_data.get('user_id', '')[:1024],
            'event-type': compra_data.get('metadata', {}).get('event_name', '')[:1024],
            'processed-at': compra_data.get('metadata', {}).get('processed_at', '')[:1024],
            'stage': STAGE
        }
        
        # Subir a S3
        s3_client.put_object(
            Bucket=BUCKET_NAME,
            Key=s3_key,
            Body=json_data.encode('utf-8'),
            ContentType='application/json',
            Metadata=metadata,
            ServerSideEncryption='AES256'
        )
        
        logger.info(f"Compra guardada exitosamente en S3: s3://{BUCKET_NAME}/{s3_key}")
        return True
        
    except Exception as e:
        logger.error(f"Error guardando en S3: {str(e)}")
        logger.error(f"Bucket: {BUCKET_NAME}, Key: {s3_key}")
        return False

def process_stream_record(record: Dict[str, Any]) -> Dict[str, Any]:
    """
    Procesa un record individual del DynamoDB Stream
    
    Args:
        record: Record del stream
        
    Returns:
        Dict con resultado del procesamiento
    """
    try:
        event_name = record['eventName']
        
        logger.info(f"Procesando evento: {event_name}")
        
        # Formatear datos de la compra
        compra_data = format_compra_data(record)
        
        if not compra_data:
            return {
                'success': False,
                'error': 'No se pudo formatear los datos de la compra',
                'event_name': event_name
            }
        
        # Generar clave S3
        s3_key = generate_s3_key(compra_data, event_name)
        
        # Guardar en S3
        success = save_to_s3(compra_data, s3_key)
        
        if success:
            return {
                'success': True,
                'compra_id': compra_data.get('compra_id'),
                'tenant_id': compra_data.get('tenant_id'),
                's3_key': s3_key,
                'event_name': event_name
            }
        else:
            return {
                'success': False,
                'error': 'Error guardando en S3',
                'compra_id': compra_data.get('compra_id'),
                'event_name': event_name
            }
            
    except Exception as e:
        logger.error(f"Error procesando record: {str(e)}")
        return {
            'success': False,
            'error': str(e),
            'event_name': record.get('eventName', 'unknown')
        }

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Handler principal del Lambda para procesar DynamoDB Streams
    
    Args:
        event: Evento de DynamoDB Stream
        context: Contexto de Lambda
        
    Returns:
        Dict con resultado del procesamiento
    """
    logger.info("=== INICIANDO PROCESAMIENTO DE DYNAMODB STREAM ===")
    logger.info(f"Número de records recibidos: {len(event.get('Records', []))}")
    
    results = {
        'processed': 0,
        'successful': 0,
        'failed': 0,
        'details': []
    }
    
    try:
        # Procesar cada record del stream
        for record in event.get('Records', []):
            results['processed'] += 1
            
            # Procesar record individual
            result = process_stream_record(record)
            
            if result['success']:
                results['successful'] += 1
                logger.info(f"✅ Record procesado exitosamente: {result.get('compra_id', 'unknown')}")
            else:
                results['failed'] += 1
                logger.error(f"❌ Error procesando record: {result.get('error', 'unknown')}")
            
            results['details'].append(result)
        
        # Log de resumen
        logger.info(f"=== RESUMEN DEL PROCESAMIENTO ===")
        logger.info(f"Procesados: {results['processed']}")
        logger.info(f"Exitosos: {results['successful']}")
        logger.info(f"Fallidos: {results['failed']}")
        
        # Agregar información adicional
        results['bucket'] = BUCKET_NAME
        results['stage'] = STAGE
        results['processed_at'] = datetime.now().isoformat()
        results['lambda_request_id'] = context.aws_request_id if context else 'local'
        
        return {
            'statusCode': 200,
            'body': json.dumps(results, cls=DecimalEncoder)
        }
        
    except Exception as e:
        logger.error(f"Error crítico en lambda_handler: {str(e)}")
        
        error_result = {
            'statusCode': 500,
            'error': str(e),
            'processed': results['processed'],
            'successful': results['successful'],
            'failed': results['failed'],
            'processed_at': datetime.now().isoformat()
        }
        
        return error_result

# Función para testing local
def test_local():
    """
    Función para testing local del Lambda
    """
    # Evento de prueba simulando un INSERT en DynamoDB
    test_event = {
        'Records': [
            {
                'eventID': 'test-event-id',
                'eventName': 'INSERT',
                'eventVersion': '1.1',
                'eventSource': 'aws:dynamodb',
                'awsRegion': 'us-east-1',
                'dynamodb': {
                    'StreamViewType': 'NEW_AND_OLD_IMAGES',
                    'SequenceNumber': '123456789',
                    'SizeBytes': 1024,
                    'NewImage': {
                        'compra_id': {'S': 'test-compra-123'},
                        'user_id': {'S': 'test_user'},
                        'tenant_id': {'S': 'test_tenant'},
                        'fecha': {'S': '2025-07-13 10:30:00'},
                        'productos': {
                            'L': [
                                {
                                    'M': {
                                        'codigo': {'S': 'PROD001'},
                                        'nombre': {'S': 'Producto Test'},
                                        'precio_unitario': {'N': '99.99'},
                                        'cantidad': {'N': '2'}
                                    }
                                }
                            ]
                        }
                    }
                }
            }
        ]
    }
    
    # Simular contexto
    class MockContext:
        aws_request_id = 'test-request-id'
    
    context = MockContext()
    
    # Ejecutar handler
    result = lambda_handler(test_event, context)
    print(json.dumps(result, indent=2, cls=DecimalEncoder))

if __name__ == "__main__":
    test_local()
