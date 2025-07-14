#!/usr/bin/env python3
"""
Script para verificar y corregir la configuración de la tabla Glue
"""

import boto3
import json
import logging
from typing import Dict, List, Any

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def check_glue_table_configuration():
    """Verifica la configuración de la tabla Glue"""
    
    print("=" * 80)
    print("🔍 VERIFICANDO CONFIGURACIÓN DE TABLA GLUE")
    print("=" * 80)
    
    glue_client = boto3.client('glue', region_name='us-east-1')
    
    try:
        # Obtener información de la tabla
        response = glue_client.get_table(
            DatabaseName='dev-compras-datacatalog',
            Name='13'
        )
        
        table_info = response['Table']
        
        print(f"📋 Tabla: {table_info['Name']}")
        print(f"💾 Base de datos: {table_info['DatabaseName']}")
        print(f"📁 Ubicación: {table_info['StorageDescriptor']['Location']}")
        print(f"🔧 Input Format: {table_info['StorageDescriptor']['InputFormat']}")
        print(f"🔧 Output Format: {table_info['StorageDescriptor']['OutputFormat']}")
        print(f"🔧 SerDe: {table_info['StorageDescriptor']['SerdeInfo']['SerializationLibrary']}")
        
        # Verificar ubicación
        s3_location = table_info['StorageDescriptor']['Location']
        print(f"\n📍 UBICACIÓN ACTUAL: {s3_location}")
        
        # Verificar si la ubicación es correcta
        if 'compras-data' in s3_location:
            print("❌ PROBLEMA DETECTADO: La tabla apunta a 'compras-data' pero los archivos están en 'compras'")
            correct_location = s3_location.replace('compras-data', 'compras')
            print(f"✅ UBICACIÓN CORRECTA: {correct_location}")
            
            # Preguntar si queremos corregir
            print("\n🔧 CORRECCIÓN AUTOMÁTICA:")
            print("Actualizando la ubicación de la tabla...")
            
            # Actualizar la tabla
            updated_storage = table_info['StorageDescriptor']
            updated_storage['Location'] = correct_location
            
            # Remover campos que no se pueden actualizar
            table_input = {
                'Name': table_info['Name'],
                'StorageDescriptor': updated_storage
            }
            
            # Copiar otros campos necesarios
            if 'PartitionKeys' in table_info:
                table_input['PartitionKeys'] = table_info['PartitionKeys']
            if 'TableType' in table_info:
                table_input['TableType'] = table_info['TableType']
            
            try:
                glue_client.update_table(
                    DatabaseName='dev-compras-datacatalog',
                    TableInput=table_input
                )
                print("✅ Tabla actualizada exitosamente")
                print(f"📁 Nueva ubicación: {correct_location}")
                
            except Exception as e:
                print(f"❌ Error actualizando tabla: {str(e)}")
                
        else:
            print("✅ La ubicación parece correcta")
        
        # Mostrar columnas
        print(f"\n📊 COLUMNAS DE LA TABLA:")
        print("-" * 40)
        for col in table_info['StorageDescriptor']['Columns']:
            print(f"   {col['Name']:20} | {col['Type']}")
        
        # Mostrar particiones si existen
        if 'PartitionKeys' in table_info and table_info['PartitionKeys']:
            print(f"\n🔑 PARTICIONES:")
            print("-" * 40)
            for part in table_info['PartitionKeys']:
                print(f"   {part['Name']:20} | {part['Type']}")
        
        # Mostrar propiedades SerDe
        if 'Parameters' in table_info['StorageDescriptor']['SerdeInfo']:
            print(f"\n🔧 PROPIEDADES SERDE:")
            print("-" * 40)
            for key, value in table_info['StorageDescriptor']['SerdeInfo']['Parameters'].items():
                print(f"   {key}: {value}")
        
    except Exception as e:
        print(f"❌ Error verificando tabla: {str(e)}")

def test_athena_after_fix():
    """Prueba una consulta simple en Athena después de la corrección"""
    
    print("\n" + "=" * 80)
    print("🎯 PROBANDO CONSULTA DESPUÉS DE LA CORRECCIÓN")
    print("=" * 80)
    
    athena_client = boto3.client('athena', region_name='us-east-1')
    
    # Query simple para probar
    query = 'SELECT COUNT(*) AS total_registros FROM "dev-compras-datacatalog"."13"'
    
    try:
        response = athena_client.start_query_execution(
            QueryString=query,
            QueryExecutionContext={'Database': 'dev-compras-datacatalog'},
            ResultConfiguration={'OutputLocation': 's3://dev-compras-simple-bucket/athena-results/'}
        )
        
        query_execution_id = response['QueryExecutionId']
        print(f"📋 Query ID: {query_execution_id}")
        print(f"💻 Query: {query}")
        
        # Esperar resultado
        import time
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
                
                if 'ResultSet' in results and 'Rows' in results['ResultSet']:
                    rows = results['ResultSet']['Rows']
                    if len(rows) > 1:  # Skip header
                        result_value = rows[1]['Data'][0].get('VarCharValue', '0')
                        print(f"📊 Resultado: {result_value} registros")
                    else:
                        print("📊 Sin resultados")
                
                return True
                
            elif status == 'FAILED':
                error = response['QueryExecution']['Status'].get('StateChangeReason', 'Unknown')
                print(f"❌ Query falló: {error}")
                return False
                
            else:
                print(f"⏳ Estado: {status}")
                time.sleep(2)
        
        print("❌ Query timeout")
        return False
        
    except Exception as e:
        print(f"❌ Error ejecutando query: {str(e)}")
        return False

def main():
    """Función principal"""
    
    # Verificar configuración
    check_glue_table_configuration()
    
    # Probar consulta
    success = test_athena_after_fix()
    
    if success:
        print("\n🎉 PROBLEMA SOLUCIONADO:")
        print("✅ La tabla Glue ahora apunta a la ubicación correcta")
        print("✅ Las consultas de Athena deberían funcionar")
    else:
        print("\n⚠️ PROBLEMA PERSISTENTE:")
        print("❌ La consulta aún falla después de la corrección")
        print("🔍 Revisar logs para más detalles")

if __name__ == "__main__":
    main()
