#!/usr/bin/env python3
"""
Script para explorar la estructura completa del bucket S3
"""

import boto3
import json
import logging
from typing import Dict, List, Any

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def explore_s3_bucket():
    """Explora la estructura completa del bucket S3"""
    
    print("=" * 80)
    print("🔍 EXPLORANDO ESTRUCTURA COMPLETA DEL BUCKET S3")
    print("=" * 80)
    
    s3_client = boto3.client('s3', region_name='us-east-1')
    bucket_name = 'dev-compras-simple-bucket'
    
    try:
        # Listar todos los objetos del bucket
        response = s3_client.list_objects_v2(Bucket=bucket_name)
        
        if 'Contents' not in response:
            print("❌ El bucket está vacío")
            return
        
        objects = response['Contents']
        print(f"📊 Total objetos encontrados: {len(objects)}")
        print()
        
        # Organizar por estructura de carpetas
        folders = {}
        json_files = []
        other_files = []
        
        for obj in objects:
            key = obj['Key']
            size = obj['Size']
            modified = obj['LastModified']
            
            # Identificar carpetas
            if '/' in key:
                folder = key.split('/')[0]
                if folder not in folders:
                    folders[folder] = []
                folders[folder].append({
                    'key': key,
                    'size': size,
                    'modified': modified
                })
            
            # Identificar archivos JSON
            if key.endswith('.json'):
                json_files.append({
                    'key': key,
                    'size': size,
                    'modified': modified
                })
            else:
                other_files.append({
                    'key': key,
                    'size': size,
                    'modified': modified
                })
        
        # Mostrar estructura de carpetas
        print("📁 ESTRUCTURA DE CARPETAS:")
        print("-" * 40)
        for folder, files in folders.items():
            print(f"📂 {folder}/ ({len(files)} archivos)")
            for file in files[:5]:  # Mostrar primeros 5
                print(f"   📄 {file['key']} ({file['size']} bytes)")
            if len(files) > 5:
                print(f"   ... y {len(files) - 5} archivos más")
            print()
        
        # Mostrar archivos JSON
        print("📄 ARCHIVOS JSON ENCONTRADOS:")
        print("-" * 40)
        if json_files:
            for file in json_files[:10]:  # Mostrar primeros 10
                print(f"📄 {file['key']}")
                print(f"   📊 Tamaño: {file['size']} bytes")
                print(f"   📅 Modificado: {file['modified']}")
                print()
        else:
            print("❌ No se encontraron archivos JSON")
        
        # Mostrar otros archivos
        print("📄 OTROS ARCHIVOS:")
        print("-" * 40)
        for file in other_files[:5]:  # Mostrar primeros 5
            print(f"📄 {file['key']} ({file['size']} bytes)")
        
        # Ahora vamos a leer algunos archivos JSON para diagnosticar
        if json_files:
            print("\n" + "=" * 80)
            print("🔍 DIAGNÓSTICO DE ARCHIVOS JSON")
            print("=" * 80)
            
            for i, file in enumerate(json_files[:3], 1):  # Revisar primeros 3
                print(f"\n📄 ARCHIVO #{i}: {file['key']}")
                print("-" * 60)
                
                try:
                    # Leer contenido
                    response = s3_client.get_object(Bucket=bucket_name, Key=file['key'])
                    content = response['Body'].read().decode('utf-8')
                    
                    print(f"📊 Tamaño: {len(content)} bytes")
                    print(f"🔍 Primeros 200 caracteres:")
                    print(f"   {repr(content[:200])}")
                    print(f"🔍 Últimos 200 caracteres:")
                    print(f"   {repr(content[-200:])}")
                    
                    # Validar JSON
                    try:
                        json_data = json.loads(content)
                        print("✅ JSON válido")
                        print(f"📊 Tipo: {type(json_data).__name__}")
                        
                        if isinstance(json_data, dict):
                            print("🔑 Claves principales:")
                            for key in list(json_data.keys())[:5]:
                                print(f"   - {key}")
                        
                    except json.JSONDecodeError as e:
                        print("❌ JSON inválido")
                        print(f"🚨 Error: {str(e)}")
                        print(f"📍 Línea: {e.lineno}, Columna: {e.colno}")
                        
                        # Mostrar línea problemática
                        lines = content.split('\n')
                        if e.lineno <= len(lines):
                            problem_line = lines[e.lineno - 1]
                            print(f"🔍 Línea problemática: {repr(problem_line)}")
                
                except Exception as e:
                    print(f"❌ Error leyendo archivo: {str(e)}")
        
    except Exception as e:
        print(f"❌ Error explorando bucket: {str(e)}")

if __name__ == "__main__":
    explore_s3_bucket()
