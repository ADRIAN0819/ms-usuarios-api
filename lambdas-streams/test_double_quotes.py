#!/usr/bin/env python3
"""
Script para probar la consulta específica con comillas dobles
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
            logger.info(f"📝 Query: {query}")
            
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
    """Función principal para probar la consulta específica"""
    
    print("=" * 80)
    print("🎯 PROBANDO CONSULTA ESPECÍFICA CON COMILLAS DOBLES")
    print("=" * 80)
    
    tester = AthenaTester()
    
    # Lista de queries con diferentes sintaxis
    queries = [
        {
            'name': 'COUNT con comillas dobles',
            'query': 'SELECT COUNT(*) AS total_registros FROM "dev-compras-datacatalog"."13";',
            'description': 'Contar registros con comillas dobles'
        },
        {
            'name': 'COUNT sin punto y coma',
            'query': 'SELECT COUNT(*) AS total_registros FROM "dev-compras-datacatalog"."13"',
            'description': 'Contar registros sin punto y coma'
        },
        {
            'name': 'COUNT con backticks',
            'query': 'SELECT COUNT(*) AS total_registros FROM `dev-compras-datacatalog`.`13`',
            'description': 'Contar registros con backticks'
        },
        {
            'name': 'SELECT simple con comillas dobles',
            'query': 'SELECT compra_id FROM "dev-compras-datacatalog"."13" LIMIT 1',
            'description': 'SELECT simple con comillas dobles'
        },
        {
            'name': 'SELECT asterisco con comillas dobles',
            'query': 'SELECT * FROM "dev-compras-datacatalog"."13" LIMIT 1',
            'description': 'SELECT asterisco con comillas dobles'
        },
        {
            'name': 'SHOW TABLES con comillas dobles',
            'query': 'SHOW TABLES IN "dev-compras-datacatalog"',
            'description': 'SHOW TABLES con comillas dobles'
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
            
            # Mostrar resultados
            if result['rows'] and len(result['rows']) > 0:
                print("📊 Resultados:")
                for j, row in enumerate(result['rows'][:5], 1):
                    if row:
                        print(f"   {j}. {row}")
                        
            print(f"🔗 Query ID: {result['query_execution_id']}")
        else:
            failed_queries += 1
            print(f"❌ FALLÓ: {result['error']}")
        
        print()
    
    print("=" * 80)
    print(f"📊 RESUMEN DE QUERIES CON COMILLAS DOBLES")
    print("=" * 80)
    print(f"✅ Queries exitosas: {successful_queries}")
    print(f"❌ Queries fallidas: {failed_queries}")
    print(f"📊 Total queries: {len(queries)}")
    
    if successful_queries > 0:
        print(f"\n🎉 ¡Algunas queries funcionaron!")
        print(f"✅ La sintaxis con comillas dobles puede ser la clave")
    else:
        print(f"\n⚠️ Todas las queries fallaron")
        print(f"❓ AWS Academy mantiene las restricciones")
    
    print("=" * 80)

if __name__ == "__main__":
    main()
