#!/usr/bin/env python3
"""
Script para probar consultas avanzadas en Athena con la tabla 13
"""

import boto3
import json
import time
from typing import Dict, List, Any
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AdvancedAthenaTester:
    """Clase para probar consultas avanzadas en Athena"""
    
    def __init__(self, region='us-east-1'):
        self.region = region
        self.athena_client = boto3.client('athena', region_name=region)
        
    def execute_query(self, query: str, query_name: str, database: str = 'dev-compras-datacatalog') -> Dict[str, Any]:
        """Ejecuta una query en Athena"""
        try:
            logger.info(f"🔍 Ejecutando: {query_name}")
            
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
                            'row_count': len(rows),
                            'data_size': sum(len(str(row)) for row in rows)
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
    """Función principal para probar consultas avanzadas"""
    
    print("=" * 80)
    print("🎯 CONSULTAS AVANZADAS EN ATHENA - TABLA 13")
    print("=" * 80)
    
    tester = AdvancedAthenaTester()
    
    # Lista de consultas avanzadas para probar
    advanced_queries = [
        {
            'name': 'SELECT básico con campos específicos',
            'query': '''SELECT 
                compra_id,
                user_id,
                tenant_id,
                fecha
            FROM "dev-compras-datacatalog"."13"
            LIMIT 5''',
            'description': 'Obtener campos básicos de las primeras 5 compras'
        },
        {
            'name': 'SELECT con struct (resumen)',
            'query': '''SELECT 
                compra_id,
                user_id,
                resumen.total_productos,
                resumen.total_cantidad,
                resumen.total_precio,
                resumen.moneda
            FROM "dev-compras-datacatalog"."13"
            LIMIT 10''',
            'description': 'Acceder a campos dentro del struct resumen'
        },
        {
            'name': 'SELECT con struct (metadata)',
            'query': '''SELECT 
                compra_id,
                metadata.event_name,
                metadata.processed_at,
                metadata.stage
            FROM "dev-compras-datacatalog"."13"
            LIMIT 10''',
            'description': 'Acceder a campos dentro del struct metadata'
        },
        {
            'name': 'FILTRO por tenant específico',
            'query': '''SELECT 
                compra_id,
                user_id,
                tenant_id,
                resumen.total_precio
            FROM "dev-compras-datacatalog"."13"
            WHERE tenant_id = 'empresa_postman'
            LIMIT 10''',
            'description': 'Filtrar compras por tenant empresa_postman'
        },
        {
            'name': 'FILTRO por usuario específico',
            'query': '''SELECT 
                compra_id,
                user_id,
                fecha,
                resumen.total_precio
            FROM "dev-compras-datacatalog"."13"
            WHERE user_id = 'user_test_postman'
            LIMIT 10''',
            'description': 'Filtrar compras por usuario específico'
        },
        {
            'name': 'ORDENAR por precio descendente',
            'query': '''SELECT 
                compra_id,
                user_id,
                resumen.total_precio
            FROM "dev-compras-datacatalog"."13"
            ORDER BY resumen.total_precio DESC
            LIMIT 5''',
            'description': 'Obtener las 5 compras más caras'
        },
        {
            'name': 'AGREGACIÓN - COUNT por tenant',
            'query': '''SELECT 
                tenant_id,
                COUNT(*) as total_compras
            FROM "dev-compras-datacatalog"."13"
            GROUP BY tenant_id
            ORDER BY total_compras DESC''',
            'description': 'Contar compras por tenant'
        },
        {
            'name': 'AGREGACIÓN - SUM por usuario',
            'query': '''SELECT 
                user_id,
                COUNT(*) as total_compras,
                SUM(resumen.total_precio) as total_gastado,
                AVG(resumen.total_precio) as promedio_compra
            FROM "dev-compras-datacatalog"."13"
            GROUP BY user_id
            ORDER BY total_gastado DESC''',
            'description': 'Análisis de gastos por usuario'
        },
        {
            'name': 'FILTRO por rango de precios',
            'query': '''SELECT 
                compra_id,
                user_id,
                resumen.total_precio,
                resumen.total_productos
            FROM "dev-compras-datacatalog"."13"
            WHERE resumen.total_precio > 1000
            ORDER BY resumen.total_precio DESC
            LIMIT 10''',
            'description': 'Compras mayores a $1000'
        },
        {
            'name': 'ANÁLISIS temporal por fecha',
            'query': '''SELECT 
                SUBSTR(fecha, 1, 10) as fecha_compra,
                COUNT(*) as compras_del_dia,
                SUM(resumen.total_precio) as ventas_del_dia
            FROM "dev-compras-datacatalog"."13"
            GROUP BY SUBSTR(fecha, 1, 10)
            ORDER BY fecha_compra DESC''',
            'description': 'Análisis de ventas por día'
        }
    ]
    
    successful_queries = 0
    failed_queries = 0
    results_summary = []
    
    for i, query_info in enumerate(advanced_queries, 1):
        print(f"\n{'='*15} CONSULTA AVANZADA #{i} {'='*15}")
        print(f"📝 {query_info['name']}")
        print(f"📋 {query_info['description']}")
        print(f"💻 SQL:")
        print(f"   {query_info['query']}")
        print("-" * 70)
        
        result = tester.execute_query(
            query_info['query'], 
            query_info['name']
        )
        
        if result['success']:
            successful_queries += 1
            print(f"✅ EXITOSA - {result['row_count']} filas retornadas")
            print(f"📊 Tamaño de datos: {result['data_size']} bytes")
            
            # Mostrar algunos resultados
            if result['rows'] and len(result['rows']) > 1:  # Skip header
                print("📊 Resultados:")
                header = result['rows'][0]
                print(f"   📋 Headers: {header}")
                
                # Mostrar datos (máximo 3 filas)
                for j, row in enumerate(result['rows'][1:4], 1):
                    if row and any(cell.strip() for cell in row):  # Solo mostrar filas no vacías
                        print(f"   {j}. {row}")
                        
                if len(result['rows']) > 4:
                    print(f"   ... y {len(result['rows']) - 4} filas más")
                        
            print(f"🔗 Query ID: {result['query_execution_id']}")
            
            # Guardar para resumen
            results_summary.append({
                'query': query_info['name'],
                'success': True,
                'rows': result['row_count'],
                'query_id': result['query_execution_id']
            })
        else:
            failed_queries += 1
            print(f"❌ FALLÓ: {result['error']}")
            
            # Guardar para resumen
            results_summary.append({
                'query': query_info['name'],
                'success': False,
                'error': result['error']
            })
        
        print()
    
    print("=" * 80)
    print(f"📊 RESUMEN FINAL DE CONSULTAS AVANZADAS")
    print("=" * 80)
    print(f"✅ Consultas exitosas: {successful_queries}")
    print(f"❌ Consultas fallidas: {failed_queries}")
    print(f"📊 Total consultas: {len(advanced_queries)}")
    
    # Mostrar resumen detallado
    if successful_queries > 0:
        print(f"\n🎉 CONSULTAS EXITOSAS:")
        for result in results_summary:
            if result['success']:
                print(f"   ✅ {result['query']} - {result['rows']} filas")
    
    if failed_queries > 0:
        print(f"\n❌ CONSULTAS FALLIDAS:")
        for result in results_summary:
            if not result['success']:
                print(f"   ❌ {result['query']} - {result['error'][:100]}...")
    
    # Guardar evidencia
    evidence = {
        'test_timestamp': time.strftime('%Y-%m-%d %H:%M:%S'),
        'database': 'dev-compras-datacatalog',
        'table': '13',
        'total_queries': len(advanced_queries),
        'successful_queries': successful_queries,
        'failed_queries': failed_queries,
        'results': results_summary
    }
    
    with open('evidencia_consultas_avanzadas.json', 'w', encoding='utf-8') as f:
        json.dump(evidence, f, indent=2, ensure_ascii=False)
    
    print(f"\n📄 Evidencia guardada en: evidencia_consultas_avanzadas.json")
    print("=" * 80)

if __name__ == "__main__":
    main()
