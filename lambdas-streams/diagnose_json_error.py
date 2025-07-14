#!/usr/bin/env python3
"""
Script para diagnosticar y corregir el error de JSON malformado en S3
"""

import boto3
import json
import logging
from typing import Dict, List, Any

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class S3JSONDiagnostic:
    """Clase para diagnosticar problemas de JSON en S3"""
    
    def __init__(self, region='us-east-1'):
        self.region = region
        self.s3_client = boto3.client('s3', region_name=region)
        
    def list_json_files(self, bucket: str, prefix: str = '') -> List[str]:
        """Lista archivos JSON en S3"""
        try:
            response = self.s3_client.list_objects_v2(
                Bucket=bucket,
                Prefix=prefix
            )
            
            files = []
            if 'Contents' in response:
                for obj in response['Contents']:
                    if obj['Key'].endswith('.json'):
                        files.append(obj['Key'])
            
            return files
            
        except Exception as e:
            logger.error(f"❌ Error listando archivos: {str(e)}")
            return []
    
    def read_json_file(self, bucket: str, key: str) -> Dict[str, Any]:
        """Lee un archivo JSON de S3"""
        try:
            response = self.s3_client.get_object(Bucket=bucket, Key=key)
            content = response['Body'].read().decode('utf-8')
            
            return {
                'success': True,
                'content': content,
                'size': len(content),
                'key': key
            }
            
        except Exception as e:
            logger.error(f"❌ Error leyendo archivo {key}: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'key': key
            }
    
    def validate_json_content(self, content: str) -> Dict[str, Any]:
        """Valida si el contenido es JSON válido"""
        try:
            # Intentar parsear como JSON
            json_data = json.loads(content)
            
            return {
                'valid': True,
                'parsed_data': json_data,
                'type': type(json_data).__name__
            }
            
        except json.JSONDecodeError as e:
            return {
                'valid': False,
                'error': str(e),
                'error_line': e.lineno,
                'error_column': e.colno
            }
    
    def fix_json_content(self, content: str) -> str:
        """Intenta corregir problemas comunes de JSON"""
        
        # Eliminar caracteres de control
        content = content.strip()
        
        # Verificar si termina con }
        if not content.endswith('}'):
            if content.endswith(','):
                content = content[:-1] + '}'
            else:
                content += '}'
        
        # Verificar si empieza con {
        if not content.startswith('{'):
            content = '{' + content
        
        # Reemplazar comillas simples por dobles en las claves
        import re
        content = re.sub(r"'([^']+)':", r'"\1":', content)
        
        return content

def main():
    """Función principal para diagnosticar problemas de JSON"""
    
    print("=" * 80)
    print("🔍 DIAGNÓSTICO DE ARCHIVOS JSON EN S3")
    print("=" * 80)
    
    diagnostic = S3JSONDiagnostic()
    
    bucket_name = 'dev-compras-simple-bucket'
    prefix = 'compras-data/'
    
    print(f"📁 Bucket: {bucket_name}")
    print(f"📂 Prefix: {prefix}")
    print()
    
    # Listar archivos JSON
    json_files = diagnostic.list_json_files(bucket_name, prefix)
    
    if not json_files:
        print("❌ No se encontraron archivos JSON")
        return
    
    print(f"📄 Archivos JSON encontrados: {len(json_files)}")
    
    valid_files = 0
    invalid_files = 0
    
    for i, file_key in enumerate(json_files[:10], 1):  # Revisar primeros 10 archivos
        print(f"\n{'='*20} ARCHIVO #{i} {'='*20}")
        print(f"📄 Archivo: {file_key}")
        print("-" * 60)
        
        # Leer archivo
        file_data = diagnostic.read_json_file(bucket_name, file_key)
        
        if not file_data['success']:
            print(f"❌ Error leyendo archivo: {file_data['error']}")
            invalid_files += 1
            continue
        
        content = file_data['content']
        print(f"📊 Tamaño: {file_data['size']} bytes")
        
        # Mostrar primeros y últimos caracteres
        print(f"🔍 Primeros 100 caracteres:")
        print(f"   {repr(content[:100])}")
        print(f"🔍 Últimos 100 caracteres:")
        print(f"   {repr(content[-100:])}")
        
        # Validar JSON
        validation = diagnostic.validate_json_content(content)
        
        if validation['valid']:
            print("✅ JSON válido")
            print(f"📊 Tipo: {validation['type']}")
            valid_files += 1
            
            # Mostrar estructura si es dict
            if isinstance(validation['parsed_data'], dict):
                print("🔑 Claves principales:")
                for key in list(validation['parsed_data'].keys())[:5]:
                    print(f"   - {key}")
        else:
            print("❌ JSON inválido")
            print(f"🚨 Error: {validation['error']}")
            if 'error_line' in validation:
                print(f"📍 Línea: {validation['error_line']}, Columna: {validation['error_column']}")
            invalid_files += 1
            
            # Intentar corregir
            print("\n🔧 Intentando corrección...")
            fixed_content = diagnostic.fix_json_content(content)
            
            # Validar contenido corregido
            fixed_validation = diagnostic.validate_json_content(fixed_content)
            
            if fixed_validation['valid']:
                print("✅ Corrección exitosa")
                print(f"📊 Contenido corregido es válido")
                
                # Mostrar diferencias
                print("🔄 Cambios realizados:")
                if len(content) != len(fixed_content):
                    print(f"   - Tamaño: {len(content)} → {len(fixed_content)} bytes")
                if content != fixed_content:
                    print("   - Contenido modificado")
            else:
                print("❌ Corrección falló")
                print(f"🚨 Error persistente: {fixed_validation['error']}")
    
    print("\n" + "=" * 80)
    print(f"📊 RESUMEN DEL DIAGNÓSTICO")
    print("=" * 80)
    print(f"📄 Total archivos revisados: {min(len(json_files), 10)}")
    print(f"✅ Archivos válidos: {valid_files}")
    print(f"❌ Archivos inválidos: {invalid_files}")
    print(f"📊 Total archivos en S3: {len(json_files)}")
    
    if invalid_files > 0:
        print(f"\n🚨 PROBLEMA DETECTADO:")
        print(f"❌ {invalid_files} archivos tienen JSON malformado")
        print(f"💡 Esto causa el error HIVE_CURSOR_ERROR en Athena")
        print(f"🔧 Solución: Corregir el Lambda para generar JSON válido")
    else:
        print(f"\n✅ ARCHIVOS JSON VÁLIDOS:")
        print(f"🎉 Todos los archivos tienen formato JSON correcto")
        print(f"❓ El error puede ser de configuración de la tabla Glue")
    
    print("=" * 80)

if __name__ == "__main__":
    main()
