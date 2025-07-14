#!/usr/bin/env python3
"""
Script para ejecutar consultas útiles en la tabla CSV de TechShop
"""

import boto3
import time
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def execute_athena_query(athena_client, query, query_name):
    """Ejecuta una consulta en Athena"""
    try:
        print(f"\n🔍 Ejecutando: {query_name}")
        print(f"💻 Query: {query}")
        
        response = athena_client.start_query_execution(
            QueryString=query,
            QueryExecutionContext={'Database': 'dev-compras-datacatalog'},
            ResultConfiguration={'OutputLocation': 's3://dev-compras-simple-bucket/athena-results/'}
        )
        
        query_execution_id = response['QueryExecutionId']
        print(f"📋 Query ID: {query_execution_id}")
        
        # Esperar resultado
        max_attempts = 30
        for attempt in range(max_attempts):
            response = athena_client.get_query_execution(
                QueryExecutionId=query_execution_id
            )
            
            status = response['QueryExecution']['Status']['State']
            
            if status == 'SUCCEEDED':
                print("✅ Query ejecutada exitosamente")
                
                # Obtener resultados
                results = athena_client.get_query_results(
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
                
            elif status == 'FAILED':
                error = response['QueryExecution']['Status'].get('StateChangeReason', 'Unknown')
                print(f"❌ Query falló: {error}")
                return {'success': False, 'error': error}
                
            else:
                print(f"⏳ Estado: {status}")
                time.sleep(2)
        
        return {'success': False, 'error': 'Query timeout'}
        
    except Exception as e:
        print(f"❌ Error ejecutando query: {str(e)}")
        return {'success': False, 'error': str(e)}

def main():
    """Función principal para ejecutar consultas útiles"""
    
    print("=" * 80)
    print("🏪 CONSULTAS ÚTILES PARA TECHSHOP")
    print("=" * 80)
    
    athena_client = boto3.client('athena', region_name='us-east-1')
    
    # Consultas útiles para TechShop
    useful_queries = [
        {
            'name': 'TOP USUARIOS POR COMPRAS',
            'query': '''
                SELECT 
                    user_id,
                    COUNT(*) as total_compras,
                    SUM(total_precio) as total_gastado,
                    AVG(total_precio) as promedio_compra
                FROM "dev-compras-datacatalog"."compras_csv_final"
                GROUP BY user_id
                ORDER BY total_compras DESC
                LIMIT 5;
            '''
        },
        {
            'name': 'RESUMEN DE VENTAS DIARIAS',
            'query': '''
                SELECT 
                    SUBSTR(fecha, 1, 10) as fecha_compra,
                    COUNT(*) as total_compras_dia,
                    SUM(total_precio) as ventas_del_dia,
                    SUM(total_productos) as productos_vendidos,
                    ROUND(AVG(total_precio), 2) as ticket_promedio
                FROM "dev-compras-datacatalog"."compras_csv_final"
                GROUP BY SUBSTR(fecha, 1, 10)
                ORDER BY fecha_compra DESC;
            '''
        },
        {
            'name': 'COMPRAS MAYORES A $500',
            'query': '''
                SELECT 
                    compra_id,
                    user_id,
                    tenant_id,
                    total_precio
                FROM "dev-compras-datacatalog"."compras_csv_final"
                WHERE total_precio > 500
                ORDER BY total_precio DESC
                LIMIT 10;
            '''
        }
    ]
    
    successful_queries = 0
    
    for i, query_info in enumerate(useful_queries, 1):
        print(f"\n{'='*20} CONSULTA ÚTIL #{i} {'='*20}")
        
        result = execute_athena_query(athena_client, query_info['query'], query_info['name'])
        
        if result['success']:
            successful_queries += 1
            print(f"📊 RESULTADOS PARA {query_info['name']}:")
            print("-" * 60)
            
            # Mostrar resultados
            for j, row in enumerate(result['rows'][:6], 1):
                if j == 1:  # Header
                    print(f"   📋 {' | '.join(row)}")
                    print(f"   {'-' * 60}")
                elif j > 1 and row and any(row):  # Data rows
                    print(f"   📊 {' | '.join(row)}")
            
            print(f"🔗 Query ID: {result['query_execution_id']}")
        else:
            print(f"❌ Error: {result['error']}")
    
    print("\n" + "=" * 80)
    print(f"🎉 ANÁLISIS TECHSHOP COMPLETADO")
    print("=" * 80)
    print(f"✅ Consultas exitosas: {successful_queries}/3")
    print(f"📊 CSV procesado con datos de compras")
    print(f"📋 Tabla funcional: compras_csv_final")
    
    if successful_queries >= 1:
        print(f"🎯 ¡Al menos una consulta útil funciona para TechShop!")
    else:
        print(f"⚠️ Todas las consultas fallaron")

if __name__ == "__main__":
    main()
