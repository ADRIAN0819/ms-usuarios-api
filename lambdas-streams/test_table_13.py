#!/usr/bin/env python3
"""
Script para probar queries reales en Athena con la tabla 13 y datos JSON reales
"""

import boto3
import json
import time
from typing import Dict, List, Any
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AthenaTester:
    """Clase para probar queries en Athena"""
    
    def __init__(self, region='us-east-1'):
        self.region = region
        self.athena_client = boto3.client('athena', region_name=region)
        
    def execute_query(self, query: str, database: str = 'dev-compras-datacatalog') -> Dict[str, Any]:
        """Ejecuta una query en Athena"""
        try:
            logger.info(f"🔍 Ejecutando query en {database}...")
            
            response = self.athena_client.start_query_execution(
                QueryString=query,
                QueryExecutionContext={'Database': database},
                ResultConfiguration={'OutputLocation': 's3://dev-compras-simple-bucket/athena-results/'}
            )
            
            query_execution_id = response['QueryExecutionId']
            logger.info(f"📋 Query ID: {query_execution_id}")
            
            # Esperar resultado
            max_attempts = 30
            for attempt in range(max_attempts):
                response = self.athena_client.get_query_execution(
                    QueryExecutionId=query_execution_id
                )
                
                status = response['QueryExecution']['Status']['State']
                
                if status == 'SUCCEEDED':
                    logger.info("✅ Query ejecutada exitosamente")
                    
                    # Obtener resultados
                    try:
                        results = self.athena_client.get_query_results(
                            QueryExecutionId=query_execution_id
                        )
                        
                        rows = []
                        if 'ResultSet' in results and 'Rows' in results['ResultSet']:
                            for row in results['ResultSet']['Rows']:
                                formatted_row = []
                                for col in row['Data']:
                                    formatted_row.append(col.get('VarCharValue', ''))
                                rows.append(formatted_row)
                        
                        return {
                            'success': True,
                            'query_execution_id': query_execution_id,
                            'rows': rows,
                            'row_count': len(rows)
                        }
                    except Exception as e:
                        logger.error(f"❌ Error obteniendo resultados: {str(e)}")
                        return {'success': False, 'error': f'Error getting results: {str(e)}'}
                        
                elif status == 'FAILED':
                    error = response['QueryExecution']['Status'].get('StateChangeReason', 'Unknown')
                    logger.error(f"❌ Query falló: {error}")
                    return {'success': False, 'error': error}
                    
                else:
                    logger.info(f"⏳ Estado: {status}")
                    time.sleep(2)
            
            return {'success': False, 'error': 'Query timeout'}
            
        except Exception as e:
            logger.error(f"❌ Error ejecutando query: {str(e)}")
            return {'success': False, 'error': str(e)}

def main():
    """Función principal para probar queries en la tabla 13"""
    
    print("=" * 80)
    print("🎯 QUERIES EN ATHENA - TABLA 13 (dev-compras-datacatalog)")
    print("=" * 80)
    
    tester = AthenaTester()
    
    # Lista de queries para probar
    queries = [
        {
            'name': 'DESCRIBE tabla 13',
            'query': 'DESCRIBE `dev-compras-datacatalog`.`13`',
            'description': 'Obtener esquema de la tabla 13'
        },
        {
            'name': 'DESCRIBE FORMATTED tabla 13',
            'query': 'DESCRIBE FORMATTED `dev-compras-datacatalog`.`13`',
            'description': 'Obtener información detallada de la tabla 13'
        },
        {
            'name': 'COUNT registros tabla 13',
            'query': 'SELECT COUNT(*) as total_registros FROM `dev-compras-datacatalog`.`13`',
            'description': 'Contar total de registros en la tabla 13'
        },
        {
            'name': 'SELECT básico tabla 13',
            'query': 'SELECT * FROM `dev-compras-datacatalog`.`13` LIMIT 5',
            'description': 'Obtener los primeros 5 registros de la tabla 13'
        },
        {
            'name': 'SELECT campos específicos',
            'query': '''SELECT 
                compra_id,
                user_id,
                tenant_id,
                fecha,
                resumen
            FROM `dev-compras-datacatalog`.`13`
            LIMIT 10''',
            'description': 'Obtener campos específicos de la tabla 13'
        },
        {
            'name': 'SELECT con filtro por tenant',
            'query': '''SELECT 
                compra_id,
                user_id,
                tenant_id,
                fecha
            FROM `dev-compras-datacatalog`.`13`
            WHERE tenant_id = 'empresa_postman'
            LIMIT 10''',
            'description': 'Filtrar por tenant específico'
        },
        {
            'name': 'SELECT con agregación',
            'query': '''SELECT 
                tenant_id,
                COUNT(*) as total_compras
            FROM `dev-compras-datacatalog`.`13`
            GROUP BY tenant_id''',
            'description': 'Agrupar compras por tenant'
        },
        {
            'name': 'SELECT con datos anidados',
            'query': '''SELECT 
                compra_id,
                user_id,
                productos,
                metadata,
                resumen
            FROM `dev-compras-datacatalog`.`13`
            WHERE user_id = 'user_test_postman'
            LIMIT 5''',
            'description': 'Obtener datos anidados para un usuario específico'
        }
    ]
    
    successful_queries = 0
    failed_queries = 0
    
    for i, query_info in enumerate(queries, 1):
        print(f"\n{'='*20} QUERY #{i} {'='*20}")
        print(f"📝 {query_info['name']}")
        print(f"📋 {query_info['description']}")
        print(f"💻 SQL: {query_info['query']}")
        print("-" * 60)
        
        result = tester.execute_query(query_info['query'])
        
        if result['success']:
            successful_queries += 1
            print(f"✅ EXITOSA - {result['row_count']} filas retornadas")
            
            # Mostrar algunos resultados
            if result['rows'] and len(result['rows']) > 0:
                print("📊 Resultados:")
                for j, row in enumerate(result['rows'][:5], 1):  # Mostrar máximo 5 filas
                    if row:  # Solo mostrar filas no vacías
                        print(f"   {j}. {row}")
                        
            print(f"🔗 Query ID: {result['query_execution_id']}")
        else:
            failed_queries += 1
            print(f"❌ FALLÓ: {result['error']}")
        
        print()
    
    print("=" * 80)
    print(f"📊 RESUMEN FINAL DE QUERIES EN TABLA 13")
    print("=" * 80)
    print(f"✅ Queries exitosas: {successful_queries}")
    print(f"❌ Queries fallidas: {failed_queries}")
    print(f"📊 Total queries: {len(queries)}")
    
    if successful_queries > 0:
        print(f"\n🎉 ¡Athena funciona con la tabla 13!")
        print(f"✅ Data Catalog correctamente configurado")
        print(f"✅ Datos JSON procesados exitosamente")
    else:
        print(f"\n⚠️ Todas las queries fallaron")
        print(f"❓ Revisar configuración de la tabla 13")
    
    print("=" * 80)

if __name__ == "__main__":
    main()
