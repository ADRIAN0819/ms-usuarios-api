"""
Lambda para actualizar productos en ElasticSearch desde DynamoDB Streams
Conecta con la tabla dev-t_MS2_productos y actualiza los contenedores ElasticSearch por tenant
"""

import json
import boto3
import os
import logging
from datetime import datetime
from typing import Dict, Any, Optional
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ElasticSearchManager:
    """Gestiona las operaciones con ElasticSearch por tenant"""
    
    def __init__(self):
        self.es_endpoints = self._parse_endpoints()
        self.session = self._create_session()
    
    def _parse_endpoints(self) -> Dict[str, str]:
        """Parse endpoints from environment variable"""
        try:
            endpoints_json = os.environ.get('ES_ENDPOINTS', '{}')
            endpoints = json.loads(endpoints_json)
            logger.info(f"📊 Endpoints ElasticSearch cargados: {list(endpoints.keys())}")
            return endpoints
        except Exception as e:
            logger.error(f"❌ Error parseando endpoints: {e}")
            return {}
    
    def _create_session(self) -> requests.Session:
        """Crea sesión HTTP con retry strategy"""
        session = requests.Session()
        retry_strategy = Retry(
            total=3,
            backoff_factor=1,
            status_forcelist=[429, 500, 502, 503, 504],
        )
        adapter = HTTPAdapter(max_retries=retry_strategy)
        session.mount("http://", adapter)
        session.mount("https://", adapter)
        return session
    
    def get_endpoint(self, tenant_id: str) -> Optional[str]:
        """Obtiene el endpoint de ElasticSearch para un tenant"""
        endpoint = self.es_endpoints.get(tenant_id, self.es_endpoints.get('default'))
        if not endpoint:
            logger.warning(f"⚠️ No se encontró endpoint para tenant: {tenant_id}")
        return endpoint
    
    def health_check(self, endpoint: str) -> bool:
        """Verifica si ElasticSearch está disponible"""
        try:
            response = self.session.get(f"{endpoint}/_cluster/health", timeout=10)
            return response.status_code == 200
        except Exception as e:
            logger.error(f"❌ Health check falló para {endpoint}: {e}")
            return False
    
    def index_product(self, endpoint: str, product_data: Dict[str, Any]) -> bool:
        """Indexa un producto en ElasticSearch"""
        try:
            product_id = product_data.get('codigo')
            if not product_id:
                logger.error("❌ Código de producto no encontrado")
                return False
            
            # Preparar datos para ElasticSearch
            es_doc = {
                "codigo": product_data.get('codigo'),
                "nombre": product_data.get('nombre', ''),
                "descripcion": product_data.get('descripcion', ''),
                "precio": float(product_data.get('precio', 0)),
                "cantidad": int(product_data.get('cantidad', 0)),
                "categoria": product_data.get('categoria', ''),
                "tenant_id": product_data.get('tenant_id', ''),
                "user_id": product_data.get('user_id', ''),
                "fechaCreacion": product_data.get('fechaCreacion', ''),
                "fechaModificacion": product_data.get('fechaModificacion', ''),
                "timestamp": datetime.utcnow().isoformat()
            }
            
            # Indexar en ElasticSearch
            url = f"{endpoint}/productos/_doc/{product_id}"
            response = self.session.put(url, json=es_doc, timeout=30)
            
            if response.status_code in [200, 201]:
                logger.info(f"✅ Producto {product_id} indexado exitosamente")
                return True
            else:
                logger.error(f"❌ Error indexando producto {product_id}: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            logger.error(f"❌ Error indexando producto: {e}")
            return False
    
    def update_product(self, endpoint: str, product_data: Dict[str, Any]) -> bool:
        """Actualiza un producto en ElasticSearch"""
        try:
            product_id = product_data.get('codigo')
            if not product_id:
                logger.error("❌ Código de producto no encontrado")
                return False
            
            # Preparar datos para actualización
            update_doc = {
                "doc": {
                    "codigo": product_data.get('codigo'),
                    "nombre": product_data.get('nombre', ''),
                    "descripcion": product_data.get('descripcion', ''),
                    "precio": float(product_data.get('precio', 0)),
                    "cantidad": int(product_data.get('cantidad', 0)),
                    "categoria": product_data.get('categoria', ''),
                    "tenant_id": product_data.get('tenant_id', ''),
                    "user_id": product_data.get('user_id', ''),
                    "fechaCreacion": product_data.get('fechaCreacion', ''),
                    "fechaModificacion": product_data.get('fechaModificacion', ''),
                    "timestamp": datetime.utcnow().isoformat()
                },
                "doc_as_upsert": True
            }
            
            # Actualizar en ElasticSearch
            url = f"{endpoint}/productos/_update/{product_id}"
            response = self.session.post(url, json=update_doc, timeout=30)
            
            if response.status_code in [200, 201]:
                logger.info(f"✅ Producto {product_id} actualizado exitosamente")
                return True
            else:
                logger.error(f"❌ Error actualizando producto {product_id}: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            logger.error(f"❌ Error actualizando producto: {e}")
            return False
    
    def delete_product(self, endpoint: str, product_id: str) -> bool:
        """Elimina un producto de ElasticSearch"""
        try:
            url = f"{endpoint}/productos/_doc/{product_id}"
            response = self.session.delete(url, timeout=30)
            
            if response.status_code in [200, 404]:  # 404 is OK if already deleted
                logger.info(f"✅ Producto {product_id} eliminado exitosamente")
                return True
            else:
                logger.error(f"❌ Error eliminando producto {product_id}: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            logger.error(f"❌ Error eliminando producto: {e}")
            return False

def process_dynamodb_record(record: Dict[str, Any], es_manager: ElasticSearchManager) -> bool:
    """Procesa un registro individual de DynamoDB Stream"""
    try:
        event_name = record.get('eventName')
        
        if event_name == 'INSERT':
            # Nuevo producto
            new_image = record.get('dynamodb', {}).get('NewImage', {})
            product_data = parse_dynamodb_item(new_image)
            
            tenant_id = product_data.get('tenant_id', 'default')
            endpoint = es_manager.get_endpoint(tenant_id)
            
            if not endpoint:
                logger.error(f"❌ No se encontró endpoint para tenant: {tenant_id}")
                return False
            
            if not es_manager.health_check(endpoint):
                logger.error(f"❌ ElasticSearch no disponible en {endpoint}")
                return False
            
            return es_manager.index_product(endpoint, product_data)
        
        elif event_name == 'MODIFY':
            # Producto modificado
            new_image = record.get('dynamodb', {}).get('NewImage', {})
            product_data = parse_dynamodb_item(new_image)
            
            tenant_id = product_data.get('tenant_id', 'default')
            endpoint = es_manager.get_endpoint(tenant_id)
            
            if not endpoint:
                logger.error(f"❌ No se encontró endpoint para tenant: {tenant_id}")
                return False
            
            if not es_manager.health_check(endpoint):
                logger.error(f"❌ ElasticSearch no disponible en {endpoint}")
                return False
            
            return es_manager.update_product(endpoint, product_data)
        
        elif event_name == 'REMOVE':
            # Producto eliminado
            old_image = record.get('dynamodb', {}).get('OldImage', {})
            product_data = parse_dynamodb_item(old_image)
            
            tenant_id = product_data.get('tenant_id', 'default')
            endpoint = es_manager.get_endpoint(tenant_id)
            
            if not endpoint:
                logger.error(f"❌ No se encontró endpoint para tenant: {tenant_id}")
                return False
            
            if not es_manager.health_check(endpoint):
                logger.error(f"❌ ElasticSearch no disponible en {endpoint}")
                return False
            
            product_id = product_data.get('codigo')
            if product_id:
                return es_manager.delete_product(endpoint, product_id)
            else:
                logger.error("❌ No se encontró código de producto para eliminar")
                return False
        
        else:
            logger.warning(f"⚠️ Evento no reconocido: {event_name}")
            return True
            
    except Exception as e:
        logger.error(f"❌ Error procesando registro DynamoDB: {e}")
        return False

def parse_dynamodb_item(item: Dict[str, Any]) -> Dict[str, Any]:
    """Parse DynamoDB item format to Python dict"""
    result = {}
    
    for key, value in item.items():
        if 'S' in value:  # String
            result[key] = value['S']
        elif 'N' in value:  # Number
            try:
                result[key] = float(value['N'])
            except ValueError:
                result[key] = value['N']
        elif 'BOOL' in value:  # Boolean
            result[key] = value['BOOL']
        elif 'NULL' in value:  # Null
            result[key] = None
        else:
            result[key] = str(value)
    
    return result

def handler(event, context):
    """
    Handler principal del Lambda
    Procesa eventos de DynamoDB Streams y actualiza ElasticSearch
    """
    logger.info("🚀 Iniciando procesamiento de DynamoDB Streams para ElasticSearch")
    
    try:
        # Inicializar manager de ElasticSearch
        es_manager = ElasticSearchManager()
        
        # Procesar registros
        records = event.get('Records', [])
        logger.info(f"📋 Procesando {len(records)} registros")
        
        successful_records = 0
        failed_records = 0
        
        for record in records:
            try:
                if process_dynamodb_record(record, es_manager):
                    successful_records += 1
                else:
                    failed_records += 1
                    
            except Exception as e:
                logger.error(f"❌ Error procesando registro: {e}")
                failed_records += 1
        
        logger.info(f"📊 Procesamiento completado: {successful_records} exitosos, {failed_records} fallos")
        
        # Retornar resultado
        return {
            'statusCode': 200,
            'body': json.dumps({
                'message': 'Procesamiento completado',
                'successful_records': successful_records,
                'failed_records': failed_records,
                'total_records': len(records)
            })
        }
        
    except Exception as e:
        logger.error(f"❌ Error en handler principal: {e}")
        return {
            'statusCode': 500,
            'body': json.dumps({
                'error': str(e),
                'message': 'Error procesando DynamoDB Streams'
            })
        }
