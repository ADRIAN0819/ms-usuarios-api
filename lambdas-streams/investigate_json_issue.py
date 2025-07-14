#!/usr/bin/env python3
"""
Script para investigar el problema específico del JSON malformado
"""

import boto3
import json
import re
from typing import Dict, List, Any

def analyze_json_files_in_detail():
    """Analiza archivos JSON en detalle para encontrar el problema"""
    
    print("=" * 80)
    print("🔍 ANÁLISIS DETALLADO DE ARCHIVOS JSON")
    print("=" * 80)
    
    s3_client = boto3.client('s3', region_name='us-east-1')
    bucket_name = 'dev-compras-simple-bucket'
    
    # Obtener lista de archivos JSON
    response = s3_client.list_objects_v2(Bucket=bucket_name, Prefix='compras/')
    
    if 'Contents' not in response:
        print("❌ No se encontraron archivos")
        return
    
    json_files = [obj['Key'] for obj in response['Contents'] if obj['Key'].endswith('.json')]
    
    print(f"📄 Archivos JSON encontrados: {len(json_files)}")
    
    problematic_files = []
    valid_files = []
    
    for i, file_key in enumerate(json_files[:15], 1):  # Analizar primeros 15 archivos
        print(f"\n📄 ARCHIVO #{i}: {file_key}")
        print("-" * 60)
        
        try:
            # Leer archivo
            response = s3_client.get_object(Bucket=bucket_name, Key=file_key)
            content = response['Body'].read().decode('utf-8')
            
            print(f"📊 Tamaño: {len(content)} bytes")
            
            # Análisis detallado del contenido
            print(f"🔍 Primeros 50 caracteres: {repr(content[:50])}")
            print(f"🔍 Últimos 50 caracteres: {repr(content[-50:])}")
            
            # Verificar caracteres problemáticos
            problematic_chars = []
            for j, char in enumerate(content):
                if ord(char) < 32 and char not in ['\n', '\r', '\t']:
                    problematic_chars.append((j, char, ord(char)))
            
            if problematic_chars:
                print(f"⚠️ Caracteres problemáticos encontrados: {len(problematic_chars)}")
                for pos, char, code in problematic_chars[:5]:
                    print(f"   Posición {pos}: {repr(char)} (código {code})")
            
            # Verificar estructura JSON
            lines = content.split('\n')
            print(f"📏 Líneas: {len(lines)}")
            
            # Verificar si es JSON válido
            try:
                json_data = json.loads(content)
                print("✅ JSON válido")
                valid_files.append(file_key)
                
                # Verificar estructura
                if isinstance(json_data, dict):
                    print(f"🔑 Claves: {list(json_data.keys())}")
                    
                    # Verificar si tiene la estructura esperada
                    expected_keys = ['compra_id', 'user_id', 'tenant_id', 'fecha', 'productos', 'metadata', 'resumen']
                    missing_keys = [key for key in expected_keys if key not in json_data]
                    if missing_keys:
                        print(f"⚠️ Claves faltantes: {missing_keys}")
                    
            except json.JSONDecodeError as e:
                print(f"❌ JSON inválido: {str(e)}")
                print(f"📍 Línea: {e.lineno}, Columna: {e.colno}")
                
                # Mostrar línea problemática
                if e.lineno <= len(lines):
                    problem_line = lines[e.lineno - 1]
                    print(f"🔍 Línea problemática: {repr(problem_line)}")
                    
                    # Mostrar contexto
                    start = max(0, e.lineno - 3)
                    end = min(len(lines), e.lineno + 2)
                    print(f"📋 Contexto (líneas {start+1}-{end}):")
                    for idx in range(start, end):
                        marker = ">>> " if idx == e.lineno - 1 else "    "
                        print(f"{marker}{idx+1}: {repr(lines[idx])}")
                
                problematic_files.append(file_key)
                
        except Exception as e:
            print(f"❌ Error leyendo archivo: {str(e)}")
            problematic_files.append(file_key)
    
    print("\n" + "=" * 80)
    print("📊 RESUMEN DEL ANÁLISIS")
    print("=" * 80)
    print(f"📄 Total archivos analizados: {min(len(json_files), 15)}")
    print(f"✅ Archivos válidos: {len(valid_files)}")
    print(f"❌ Archivos problemáticos: {len(problematic_files)}")
    
    if problematic_files:
        print(f"\n❌ ARCHIVOS PROBLEMÁTICOS:")
        for file in problematic_files:
            print(f"   - {file}")
    
    if valid_files:
        print(f"\n✅ ARCHIVOS VÁLIDOS:")
        for file in valid_files[:5]:
            print(f"   - {file}")
    
    # Proponer solución
    print(f"\n💡 POSIBLES SOLUCIONES:")
    if len(problematic_files) > 0:
        print("1. Corregir archivos JSON malformados")
        print("2. Regenerar archivos usando el Lambda")
        print("3. Usar un SerDe más tolerante")
        print("4. Filtrar archivos válidos para crear nueva tabla")
    else:
        print("1. Verificar configuración de la tabla Glue")
        print("2. Probar con un SerDe diferente")
        print("3. Revisar particiones de la tabla")

def test_simple_count_variations():
    """Prueba variaciones simples de COUNT para identificar el problema"""
    
    print("\n" + "=" * 80)
    print("🧪 PROBANDO VARIACIONES DE COUNT")
    print("=" * 80)
    
    athena_client = boto3.client('athena', region_name='us-east-1')
    
    count_queries = [
        {
            'name': 'COUNT simple',
            'query': 'SELECT COUNT(*) FROM "dev-compras-datacatalog"."13"'
        },
        {
            'name': 'COUNT con WHERE básico',
            'query': 'SELECT COUNT(*) FROM "dev-compras-datacatalog"."13" WHERE compra_id IS NOT NULL'
        },
        {
            'name': 'COUNT con LIMIT',
            'query': 'SELECT COUNT(*) FROM (SELECT * FROM "dev-compras-datacatalog"."13" LIMIT 10)'
        }
    ]
    
    for query_info in count_queries:
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
            max_attempts = 20
            for attempt in range(max_attempts):
                response = athena_client.get_query_execution(
                    QueryExecutionId=query_execution_id
                )
                
                status = response['QueryExecution']['Status']['State']
                
                if status == 'SUCCEEDED':
                    print("✅ EXITOSA")
                    break
                elif status == 'FAILED':
                    error = response['QueryExecution']['Status'].get('StateChangeReason', 'Unknown')
                    print(f"❌ FALLÓ: {error}")
                    break
                else:
                    time.sleep(1)
            
        except Exception as e:
            print(f"❌ ERROR: {str(e)}")

def main():
    """Función principal"""
    
    # Análisis detallado
    analyze_json_files_in_detail()
    
    # Pruebas simples
    test_simple_count_variations()
    
    print("\n" + "=" * 80)
    print("🎯 CONCLUSIONES")
    print("=" * 80)
    print("🔍 El problema parece estar en:")
    print("1. Archivos JSON con formato incorrecto")
    print("2. Caracteres de control en los archivos")
    print("3. Configuración del SerDe JSON")
    print("4. Problema con la tabla Glue")
    print("\n💡 Recomendación: Regenerar archivos JSON y recrear tabla")

if __name__ == "__main__":
    main()
