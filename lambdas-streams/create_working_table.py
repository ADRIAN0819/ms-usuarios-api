#!/usr/bin/env python3
"""
Script para crear una nueva tabla Glue que apunte a todos los archivos JSON
"""

import boto3
import json
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create_new_glue_table():
    """Crea una nueva tabla Glue que apunte a todos los archivos JSON"""
    
    print("=" * 80)
    print("🔧 CREANDO NUEVA TABLA GLUE PARA TODOS LOS ARCHIVOS JSON")
    print("=" * 80)
    
    glue_client = boto3.client('glue', region_name='us-east-1')
    
    # Configuración de la nueva tabla
    new_table_name = 'compras_all_json'
    
    table_input = {
        'Name': new_table_name,
        'StorageDescriptor': {
            'Columns': [
                {'Name': 'compra_id', 'Type': 'string'},
                {'Name': 'user_id', 'Type': 'string'},
                {'Name': 'tenant_id', 'Type': 'string'},
                {'Name': 'fecha', 'Type': 'string'},
                {'Name': 'productos', 'Type': 'array<struct<codigo:string,nombre:string,precio_unitario:double,cantidad:int>>'},
                {'Name': 'metadata', 'Type': 'struct<event_name:string,event_source:string,aws_region:string,processed_at:string,processed_by:string,stage:string>'},
                {'Name': 'resumen', 'Type': 'struct<total_productos:int,total_cantidad:int,total_precio:double,moneda:string>'}
            ],
            'Location': 's3://dev-compras-simple-bucket/compras/',  # Apunta a toda la carpeta
            'InputFormat': 'org.apache.hadoop.mapred.TextInputFormat',
            'OutputFormat': 'org.apache.hadoop.hive.ql.io.HiveIgnoreKeyTextOutputFormat',
            'SerdeInfo': {
                'SerializationLibrary': 'org.openx.data.jsonserde.JsonSerDe',
                'Parameters': {
                    'paths': 'compra_id,fecha,metadata,productos,resumen,tenant_id,user_id'
                }
            }
        },
        'TableType': 'EXTERNAL_TABLE'
    }
    
    try:
        # Crear la tabla
        glue_client.create_table(
            DatabaseName='dev-compras-datacatalog',
            TableInput=table_input
        )
        
        print(f"✅ Tabla '{new_table_name}' creada exitosamente")
        print(f"📁 Ubicación: s3://dev-compras-simple-bucket/compras/")
        print(f"📊 Columnas: {len(table_input['StorageDescriptor']['Columns'])}")
        
        return new_table_name
        
    except Exception as e:
        if 'AlreadyExistsException' in str(e):
            print(f"⚠️ La tabla '{new_table_name}' ya existe")
            return new_table_name
        else:
            print(f"❌ Error creando tabla: {str(e)}")
            return None

def test_new_table_queries(table_name):
    """Prueba queries en la nueva tabla"""
    
    print(f"\n🎯 PROBANDO QUERIES EN LA NUEVA TABLA: {table_name}")
    print("=" * 80)
    
    athena_client = boto3.client('athena', region_name='us-east-1')
    
    # Queries de prueba
    test_queries = [
        {
            'name': 'COUNT total',
            'query': f'SELECT COUNT(*) as total_registros FROM "dev-compras-datacatalog"."{table_name}"'
        },
        {
            'name': 'COUNT con WHERE',
            'query': f'SELECT COUNT(*) FROM "dev-compras-datacatalog"."{table_name}" WHERE tenant_id = \'empresa_postman\''
        },
        {
            'name': 'SELECT básico',
            'query': f'SELECT compra_id, user_id, tenant_id FROM "dev-compras-datacatalog"."{table_name}" LIMIT 5'
        },
        {
            'name': 'SELECT con struct',
            'query': f'SELECT compra_id, resumen.total_precio FROM "dev-compras-datacatalog"."{table_name}" LIMIT 5'
        },
        {
            'name': 'GROUP BY tenant',
            'query': f'SELECT tenant_id, COUNT(*) as total FROM "dev-compras-datacatalog"."{table_name}" GROUP BY tenant_id'
        }
    ]
    
    successful_queries = 0
    
    for query_info in test_queries:
        print(f"\n🔍 Probando: {query_info['name']}")
        print(f"💻 Query: {query_info['query']}")
        
        try:
            response = athena_client.start_query_execution(
                QueryString=query_info['query'],
                QueryExecutionContext={'Database': 'dev-compras-datacatalog'},
                ResultConfiguration={'OutputLocation': 's3://dev-compras-simple-bucket/athena-results/'}
            )
            
            query_execution_id = response['QueryExecutionId']
            
            # Esperar resultado
            import time
            max_attempts = 30
            for attempt in range(max_attempts):
                response = athena_client.get_query_execution(
                    QueryExecutionId=query_execution_id
                )
                
                status = response['QueryExecution']['Status']['State']
                
                if status == 'SUCCEEDED':
                    print("✅ EXITOSA")
                    successful_queries += 1
                    
                    # Obtener algunos resultados
                    results = athena_client.get_query_results(
                        QueryExecutionId=query_execution_id
                    )
                    
                    if 'ResultSet' in results and 'Rows' in results['ResultSet']:
                        rows = results['ResultSet']['Rows']
                        if len(rows) > 1:  # Skip header
                            print(f"📊 Resultados:")
                            for i, row in enumerate(rows[1:4], 1):  # Mostrar máximo 3 filas
                                row_data = [col.get('VarCharValue', '') for col in row['Data']]
                                print(f"   {i}. {row_data}")
                    
                    break
                elif status == 'FAILED':
                    error = response['QueryExecution']['Status'].get('StateChangeReason', 'Unknown')
                    print(f"❌ FALLÓ: {error}")
                    break
                else:
                    time.sleep(1)
            
        except Exception as e:
            print(f"❌ ERROR: {str(e)}")
    
    print(f"\n📊 RESUMEN: {successful_queries}/{len(test_queries)} queries exitosas")
    
    return successful_queries

def main():
    """Función principal"""
    
    # Crear nueva tabla
    table_name = create_new_glue_table()
    
    if table_name:
        # Probar queries
        successful_queries = test_new_table_queries(table_name)
        
        if successful_queries > 0:
            print(f"\n🎉 SOLUCIÓN ENCONTRADA:")
            print(f"✅ La tabla '{table_name}' funciona correctamente")
            print(f"✅ {successful_queries} queries ejecutadas exitosamente")
            print(f"✅ Ahora puedes usar queries avanzadas con esta tabla")
        else:
            print(f"\n⚠️ PROBLEMA PERSISTENTE:")
            print(f"❌ Las queries aún fallan en la nueva tabla")
            print(f"🔍 Revisar configuración del SerDe")
    else:
        print(f"\n❌ No se pudo crear la nueva tabla")

if __name__ == "__main__":
    main()
