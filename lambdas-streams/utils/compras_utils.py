import boto3
import json
from datetime import datetime
from typing import Dict, Any, Optional
import logging

# Configuración de logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

class ComprasS3Manager:
    """
    Clase para gestionar las operaciones con S3 relacionadas a compras
    """
    
    def __init__(self, bucket_name: str):
        self.bucket_name = bucket_name
        self.s3_client = boto3.client('s3')
        
    def list_compras_by_tenant(self, tenant_id: str, start_date: Optional[str] = None, end_date: Optional[str] = None) -> list:
        """
        Lista todas las compras de un tenant específico
        
        Args:
            tenant_id: ID del tenant
            start_date: Fecha de inicio (formato YYYY-MM-DD)
            end_date: Fecha de fin (formato YYYY-MM-DD)
            
        Returns:
            Lista de compras
        """
        try:
            prefix = f"compras/{tenant_id}/"
            
            if start_date:
                # Convertir fecha a formato de prefijo
                start_obj = datetime.strptime(start_date, '%Y-%m-%d')
                prefix += f"{start_obj.year}/{start_obj.month:02d}/"
            
            response = self.s3_client.list_objects_v2(
                Bucket=self.bucket_name,
                Prefix=prefix
            )
            
            compras = []
            
            if 'Contents' in response:
                for obj in response['Contents']:
                    # Filtrar por fecha si se especifica
                    if end_date:
                        # Extraer fecha del objeto
                        key_parts = obj['Key'].split('/')
                        if len(key_parts) >= 4:
                            try:
                                año = int(key_parts[2])
                                mes = int(key_parts[3])
                                día = int(key_parts[4])
                                
                                obj_date = datetime(año, mes, día)
                                end_obj = datetime.strptime(end_date, '%Y-%m-%d')
                                
                                if obj_date > end_obj:
                                    continue
                            except:
                                pass
                    
                    # Leer contenido del archivo
                    content = self.s3_client.get_object(
                        Bucket=self.bucket_name,
                        Key=obj['Key']
                    )
                    
                    compra_data = json.loads(content['Body'].read().decode('utf-8'))
                    compras.append(compra_data)
            
            return compras
            
        except Exception as e:
            logger.error(f"Error listando compras: {str(e)}")
            return []
    
    def get_compra_by_id(self, compra_id: str) -> Optional[Dict[str, Any]]:
        """
        Obtiene una compra específica por su ID
        
        Args:
            compra_id: ID de la compra
            
        Returns:
            Datos de la compra o None si no se encuentra
        """
        try:
            # Buscar en todo el bucket usando prefijo
            response = self.s3_client.list_objects_v2(
                Bucket=self.bucket_name,
                Prefix=f"compras/"
            )
            
            if 'Contents' in response:
                for obj in response['Contents']:
                    if compra_id in obj['Key']:
                        content = self.s3_client.get_object(
                            Bucket=self.bucket_name,
                            Key=obj['Key']
                        )
                        
                        compra_data = json.loads(content['Body'].read().decode('utf-8'))
                        
                        if compra_data.get('compra_id') == compra_id:
                            return compra_data
            
            return None
            
        except Exception as e:
            logger.error(f"Error obteniendo compra {compra_id}: {str(e)}")
            return None
    
    def get_compras_stats(self, tenant_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Obtiene estadísticas de compras
        
        Args:
            tenant_id: ID del tenant (opcional)
            
        Returns:
            Dict con estadísticas
        """
        try:
            prefix = f"compras/{tenant_id}/" if tenant_id else "compras/"
            
            response = self.s3_client.list_objects_v2(
                Bucket=self.bucket_name,
                Prefix=prefix
            )
            
            stats = {
                'total_compras': 0,
                'total_monto': 0.0,
                'compras_por_tenant': {},
                'compras_por_mes': {},
                'eventos_por_tipo': {
                    'INSERT': 0,
                    'MODIFY': 0,
                    'REMOVE': 0
                }
            }
            
            if 'Contents' in response:
                for obj in response['Contents']:
                    try:
                        content = self.s3_client.get_object(
                            Bucket=self.bucket_name,
                            Key=obj['Key']
                        )
                        
                        compra_data = json.loads(content['Body'].read().decode('utf-8'))
                        
                        # Contadores generales
                        stats['total_compras'] += 1
                        stats['total_monto'] += compra_data.get('resumen', {}).get('total_precio', 0)
                        
                        # Por tenant
                        tenant = compra_data.get('tenant_id', 'unknown')
                        stats['compras_por_tenant'][tenant] = stats['compras_por_tenant'].get(tenant, 0) + 1
                        
                        # Por mes
                        fecha = compra_data.get('fecha', '')
                        if fecha:
                            mes_key = fecha[:7]  # YYYY-MM
                            stats['compras_por_mes'][mes_key] = stats['compras_por_mes'].get(mes_key, 0) + 1
                        
                        # Por tipo de evento
                        evento = compra_data.get('metadata', {}).get('event_name', 'unknown')
                        if evento in stats['eventos_por_tipo']:
                            stats['eventos_por_tipo'][evento] += 1
                        
                    except Exception as e:
                        logger.warning(f"Error procesando objeto {obj['Key']}: {str(e)}")
                        continue
            
            return stats
            
        except Exception as e:
            logger.error(f"Error obteniendo estadísticas: {str(e)}")
            return {}

class ComprasStreamMonitor:
    """
    Clase para monitorear el estado del stream de compras
    """
    
    def __init__(self, table_name: str):
        self.table_name = table_name
        self.dynamodb_client = boto3.client('dynamodb')
        self.streams_client = boto3.client('dynamodbstreams')
        
    def get_stream_status(self) -> Dict[str, Any]:
        """
        Obtiene el estado del stream de DynamoDB
        
        Returns:
            Dict con información del stream
        """
        try:
            # Obtener información de la tabla
            table_response = self.dynamodb_client.describe_table(
                TableName=self.table_name
            )
            
            table_info = table_response['Table']
            stream_info = table_info.get('StreamSpecification', {})
            
            status = {
                'table_name': self.table_name,
                'stream_enabled': stream_info.get('StreamEnabled', False),
                'stream_view_type': stream_info.get('StreamViewType', 'None'),
                'table_status': table_info.get('TableStatus', 'unknown'),
                'item_count': table_info.get('ItemCount', 0),
                'table_size_bytes': table_info.get('TableSizeBytes', 0)
            }
            
            # Si el stream está habilitado, obtener más detalles
            if stream_info.get('StreamEnabled'):
                latest_stream_arn = table_info.get('LatestStreamArn')
                if latest_stream_arn:
                    stream_response = self.streams_client.describe_stream(
                        StreamArn=latest_stream_arn
                    )
                    
                    stream_data = stream_response['StreamDescription']
                    
                    status.update({
                        'stream_arn': latest_stream_arn,
                        'stream_status': stream_data.get('StreamStatus', 'unknown'),
                        'stream_creation_time': stream_data.get('CreationRequestDateTime', '').isoformat() if stream_data.get('CreationRequestDateTime') else '',
                        'shard_count': len(stream_data.get('Shards', []))
                    })
            
            return status
            
        except Exception as e:
            logger.error(f"Error obteniendo estado del stream: {str(e)}")
            return {'error': str(e)}
    
    def get_recent_stream_records(self, limit: int = 10) -> list:
        """
        Obtiene los registros más recientes del stream
        
        Args:
            limit: Número máximo de registros a obtener
            
        Returns:
            Lista de registros recientes
        """
        try:
            # Obtener el ARN del stream
            table_response = self.dynamodb_client.describe_table(
                TableName=self.table_name
            )
            
            latest_stream_arn = table_response['Table'].get('LatestStreamArn')
            
            if not latest_stream_arn:
                return []
            
            # Obtener shards del stream
            stream_response = self.streams_client.describe_stream(
                StreamArn=latest_stream_arn
            )
            
            shards = stream_response['StreamDescription'].get('Shards', [])
            
            records = []
            
            for shard in shards[-2:]:  # Últimos 2 shards
                shard_id = shard['ShardId']
                
                # Obtener iterador del shard
                iterator_response = self.streams_client.get_shard_iterator(
                    StreamArn=latest_stream_arn,
                    ShardId=shard_id,
                    ShardIteratorType='LATEST'
                )
                
                shard_iterator = iterator_response['ShardIterator']
                
                # Obtener registros
                records_response = self.streams_client.get_records(
                    ShardIterator=shard_iterator,
                    Limit=limit
                )
                
                shard_records = records_response.get('Records', [])
                records.extend(shard_records)
                
                if len(records) >= limit:
                    break
            
            return records[:limit]
            
        except Exception as e:
            logger.error(f"Error obteniendo registros del stream: {str(e)}")
            return []

# Función de utilidad para generar reportes
def generate_compras_report(bucket_name: str, tenant_id: Optional[str] = None) -> Dict[str, Any]:
    """
    Genera un reporte completo de compras
    
    Args:
        bucket_name: Nombre del bucket S3
        tenant_id: ID del tenant (opcional)
        
    Returns:
        Dict con reporte completo
    """
    manager = ComprasS3Manager(bucket_name)
    
    report = {
        'generated_at': datetime.now().isoformat(),
        'bucket': bucket_name,
        'tenant_id': tenant_id,
        'statistics': manager.get_compras_stats(tenant_id)
    }
    
    # Agregar compras recientes
    if tenant_id:
        recent_compras = manager.list_compras_by_tenant(tenant_id)
        report['recent_compras'] = recent_compras[-10:]  # Últimas 10
    
    return report
