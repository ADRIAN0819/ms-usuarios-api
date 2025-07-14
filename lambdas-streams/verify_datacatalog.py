#!/usr/bin/env python3
"""
Script para configurar y verificar AWS Glue Data Catalog y ejecutar queries de Athena
Requiere: boto3, AWS CLI configurado con permisos de Glue y Athena
"""

import boto3
import json
import time
from datetime import datetime
from typing import Dict, List, Any
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AthenaGlueManager:
    """Clase para gestionar AWS Glue Data Catalog y Athena"""
    
    def __init__(self, region='us-east-1'):
        self.region = region
        self.glue_client = boto3.client('glue', region_name=region)
        self.athena_client = boto3.client('athena', region_name=region)
        self.s3_client = boto3.client('s3', region_name=region)
        
    def check_glue_database(self, database_name: str) -> bool:
        """Verifica si existe la base de datos en Glue"""
        try:
            response = self.glue_client.get_database(Name=database_name)
            logger.info(f"✅ Base de datos encontrada: {database_name}")
            logger.info(f"📁 Descripción: {response['Database'].get('Description', 'N/A')}")
            return True
        except self.glue_client.exceptions.EntityNotFoundException:
            logger.error(f"❌ Base de datos no encontrada: {database_name}")
            return False
        except Exception as e:
            logger.error(f"❌ Error verificando base de datos: {str(e)}")
            return False
    
    def check_glue_table(self, database_name: str, table_name: str) -> bool:
        """Verifica si existe la tabla en Glue"""
        try:
            response = self.glue_client.get_table(
                DatabaseName=database_name,
                Name=table_name
            )
            
            table_info = response['Table']
            logger.info(f"✅ Tabla encontrada: {database_name}.{table_name}")
            logger.info(f"📊 Ubicación: {table_info['StorageDescriptor']['Location']}")
            logger.info(f"📋 Columnas: {len(table_info['StorageDescriptor']['Columns'])}")
            logger.info(f"🔑 Particiones: {len(table_info.get('PartitionKeys', []))}")
            
            return True
        except self.glue_client.exceptions.EntityNotFoundException:
            logger.error(f"❌ Tabla no encontrada: {database_name}.{table_name}")
            return False
        except Exception as e:
            logger.error(f"❌ Error verificando tabla: {str(e)}")
            return False
    
    def list_glue_databases(self) -> List[str]:
        """Lista todas las bases de datos en Glue"""
        try:
            response = self.glue_client.get_databases()
            databases = [db['Name'] for db in response['DatabaseList']]
            
            logger.info(f"📚 Bases de datos en Glue Data Catalog ({len(databases)}):")
            for db in databases:
                logger.info(f"  - {db}")
            
            return databases
        except Exception as e:
            logger.error(f"❌ Error listando bases de datos: {str(e)}")
            return []
    
    def list_glue_tables(self, database_name: str) -> List[str]:
        """Lista todas las tablas en una base de datos de Glue"""
        try:
            response = self.glue_client.get_tables(DatabaseName=database_name)
            tables = [table['Name'] for table in response['TableList']]
            
            logger.info(f"📋 Tablas en {database_name} ({len(tables)}):")
            for table in tables:
                logger.info(f"  - {table}")
            
            return tables
        except Exception as e:
            logger.error(f"❌ Error listando tablas: {str(e)}")
            return []
    
    def execute_athena_query(self, query: str, database_name: str, output_location: str) -> Dict[str, Any]:
        """Ejecuta una query en Athena"""
        try:
            logger.info(f"🔍 Ejecutando query en Athena...")
            logger.info(f"📝 Query: {query[:100]}...")
            
            response = self.athena_client.start_query_execution(
                QueryString=query,
                QueryExecutionContext={'Database': database_name},
                ResultConfiguration={'OutputLocation': output_location}
            )
            
            query_execution_id = response['QueryExecutionId']
            logger.info(f"📋 Query ID: {query_execution_id}")
            
            # Esperar a que termine la query
            while True:
                response = self.athena_client.get_query_execution(
                    QueryExecutionId=query_execution_id
                )
                
                status = response['QueryExecution']['Status']['State']
                
                if status == 'SUCCEEDED':
                    logger.info("✅ Query ejecutada exitosamente")
                    break
                elif status == 'FAILED':
                    error_reason = response['QueryExecution']['Status'].get('StateChangeReason', 'Unknown')
                    logger.error(f"❌ Query falló: {error_reason}")
                    return {'success': False, 'error': error_reason}
                elif status == 'CANCELLED':
                    logger.error("❌ Query cancelada")
                    return {'success': False, 'error': 'Query cancelled'}
                else:
                    logger.info(f"⏳ Estado: {status}, esperando...")
                    time.sleep(2)
            
            # Obtener resultados
            results = self.athena_client.get_query_results(
                QueryExecutionId=query_execution_id
            )
            
            return {
                'success': True,
                'query_execution_id': query_execution_id,
                'results': results,
                'row_count': len(results['ResultSet']['Rows'])
            }
            
        except Exception as e:
            logger.error(f"❌ Error ejecutando query: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def verify_data_catalog_setup(self, database_name: str, table_name: str) -> bool:
        """Verifica que el Data Catalog esté configurado correctamente"""
        logger.info("🔍 Verificando configuración del Data Catalog...")
        
        # Verificar base de datos
        if not self.check_glue_database(database_name):
            logger.error("❌ La base de datos no está configurada")
            return False
        
        # Verificar tabla
        if not self.check_glue_table(database_name, table_name):
            logger.error("❌ La tabla no está configurada")
            return False
        
        logger.info("✅ Data Catalog configurado correctamente")
        return True
    
    def generate_test_queries(self, database_name: str, table_name: str) -> List[str]:
        """Genera queries de prueba para validar el Data Catalog"""
        return [
            # Query 1: Verificar estructura de la tabla
            f"DESCRIBE `{database_name}`.`{table_name}`",
            
            # Query 2: Contar registros por partición
            f"""
            SELECT 
                tenant_id,
                year,
                month,
                day,
                COUNT(*) as total_records
            FROM `{database_name}`.`{table_name}`
            GROUP BY tenant_id, year, month, day
            ORDER BY year DESC, month DESC, day DESC
            LIMIT 10
            """,
            
            # Query 3: Verificar datos de muestra
            f"""
            SELECT 
                compra_id,
                user_id,
                tenant_id,
                fecha,
                resumen.total_precio,
                metadata.event_name,
                metadata.processed_at
            FROM `{database_name}`.`{table_name}`
            WHERE tenant_id = 'test-tenant-direct'
            ORDER BY metadata.processed_at DESC
            LIMIT 5
            """
        ]

def main():
    """Función principal para verificar el Data Catalog"""
    
    # Configuración
    DATABASE_NAME = "dev-compras-datacatalog"
    TABLE_NAME = "compras_json"
    BUCKET_NAME = "dev-compras-simple-bucket"
    OUTPUT_LOCATION = f"s3://{BUCKET_NAME}/athena-results/"
    
    # Inicializar manager
    manager = AthenaGlueManager()
    
    print("=" * 60)
    print("🚀 VERIFICACIÓN DEL DATA CATALOG Y ATHENA")
    print("=" * 60)
    
    # 1. Listar todas las bases de datos
    print("\n1️⃣ Listando bases de datos en Glue...")
    databases = manager.list_glue_databases()
    
    # 2. Verificar configuración específica
    print(f"\n2️⃣ Verificando configuración para {DATABASE_NAME}...")
    if manager.verify_data_catalog_setup(DATABASE_NAME, TABLE_NAME):
        
        # 3. Listar tablas en la base de datos
        print(f"\n3️⃣ Listando tablas en {DATABASE_NAME}...")
        tables = manager.list_glue_tables(DATABASE_NAME)
        
        # 4. Ejecutar queries de prueba
        print(f"\n4️⃣ Ejecutando queries de prueba en Athena...")
        test_queries = manager.generate_test_queries(DATABASE_NAME, TABLE_NAME)
        
        for i, query in enumerate(test_queries, 1):
            print(f"\n📝 Query {i}:")
            print("-" * 40)
            result = manager.execute_athena_query(query, DATABASE_NAME, OUTPUT_LOCATION)
            
            if result['success']:
                print(f"✅ Query {i} exitosa - {result['row_count']} filas")
            else:
                print(f"❌ Query {i} falló: {result['error']}")
    
    else:
        print("❌ El Data Catalog no está configurado correctamente")
        print("💡 Ejecuta 'npx sls deploy --config serverless-simple.yml' para configurarlo")
    
    print("\n" + "=" * 60)
    print("🏁 VERIFICACIÓN COMPLETADA")
    print("=" * 60)

if __name__ == "__main__":
    main()
