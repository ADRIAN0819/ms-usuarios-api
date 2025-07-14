#!/usr/bin/env python3
"""
VERIFICACIÓN SIMPLE DE SINCRONIZACIÓN
"""
import subprocess
import time
import json

def run_curl(url, method="GET", data=None, headers=None):
    """Ejecutar comando curl"""
    cmd = ["curl", "-s"]
    
    if method == "POST":
        cmd.extend(["-X", "POST"])
    elif method == "PUT":
        cmd.extend(["-X", "PUT"])
    elif method == "DELETE":
        cmd.extend(["-X", "DELETE"])
    
    if headers:
        for header in headers:
            cmd.extend(["-H", header])
    
    if data:
        cmd.extend(["-d", data])
    
    cmd.append(url)
    
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
        return result.stdout
    except Exception as e:
        return f"Error: {e}"

def main():
    print("🔍 VERIFICACIÓN SIMPLE DE SINCRONIZACIÓN")
    print("=" * 50)
    
    # Verificar el producto que ya creamos
    codigo_test = "ES_TEST_1752467277"
    
    print(f"📋 Verificando producto: {codigo_test}")
    
    # 1. Buscar en ElasticSearch
    es_url = f"http://35.171.228.165:9200/productos/_search?q=codigo:{codigo_test}"
    
    print("\n🔍 Buscando en ElasticSearch...")
    result = run_curl(es_url)
    
    try:
        data = json.loads(result)
        hits = data.get("hits", {}).get("hits", [])
        
        if hits:
            product = hits[0]["_source"]
            print("✅ PRODUCTO ENCONTRADO EN ELASTICSEARCH!")
            print(f"📊 Datos del producto:")
            print(f"   - Código: {product.get('codigo')}")
            print(f"   - Nombre: {product.get('nombre')}")
            print(f"   - Precio: {product.get('precio')}")
            print(f"   - Cantidad: {product.get('cantidad')}")
            print(f"   - Tenant: {product.get('tenant_id')}")
            print(f"   - Usuario: {product.get('user_id')}")
            print(f"   - Fecha: {product.get('fechaCreacion')}")
            
            print("\n🎉 SINCRONIZACIÓN FUNCIONANDO CORRECTAMENTE!")
            print("✅ MS2 → DynamoDB → Lambda → ElasticSearch")
            
        else:
            print("❌ Producto no encontrado en ElasticSearch")
            print("📊 Respuesta completa:")
            print(result)
            
    except json.JSONDecodeError:
        print("❌ Error parseando respuesta JSON")
        print("📊 Respuesta raw:")
        print(result)
    
    # 2. Verificar en otros tenants
    print(f"\n🔍 Verificando en otros tenants...")
    
    tenants = [
        ("utec", "9201"),
        ("default", "9202")
    ]
    
    for tenant, port in tenants:
        url = f"http://35.171.228.165:{port}/productos/_search?q=codigo:{codigo_test}"
        result = run_curl(url)
        
        try:
            data = json.loads(result)
            hits = data.get("hits", {}).get("hits", [])
            
            if hits:
                print(f"⚠️  Producto encontrado en tenant {tenant} (inesperado)")
            else:
                print(f"✅ Producto NO encontrado en tenant {tenant} (correcto)")
                
        except:
            print(f"❌ Error verificando tenant {tenant}")
    
    # 3. Mostrar comandos para testing manual
    print(f"\n📋 COMANDOS PARA TESTING MANUAL:")
    print("=" * 50)
    
    print("🔍 BUSCAR PRODUCTO:")
    print(f"curl 'http://35.171.228.165:9200/productos/_search?q=codigo:{codigo_test}'")
    
    print("\n📦 CREAR NUEVO PRODUCTO (necesitas token):")
    print("curl -X POST https://d3fhew8l8b.execute-api.us-east-1.amazonaws.com/dev/productos/crear \\")
    print("  -H 'Content-Type: application/json' \\")
    print("  -H 'Authorization: Bearer YOUR_TOKEN' \\")
    print("  -d '{")
    print('    "codigo": "MANUAL_TEST_001",')
    print('    "nombre": "Producto Test Manual",')
    print('    "precio": 99.99,')
    print('    "cantidad": 10')
    print("  }'")
    
    print("\n✏️  MODIFICAR PRODUCTO:")
    print("curl -X PUT https://d3fhew8l8b.execute-api.us-east-1.amazonaws.com/dev/productos/modificar \\")
    print("  -H 'Content-Type: application/json' \\")
    print("  -H 'Authorization: Bearer YOUR_TOKEN' \\")
    print("  -d '{")
    print(f'    "codigo": "{codigo_test}",')
    print('    "nombre": "Producto MODIFICADO",')
    print('    "precio": 299.99')
    print("  }'")
    
    print("\n🗑️  ELIMINAR PRODUCTO:")
    print("curl -X DELETE https://d3fhew8l8b.execute-api.us-east-1.amazonaws.com/dev/productos/eliminar \\")
    print("  -H 'Content-Type: application/json' \\")
    print("  -H 'Authorization: Bearer YOUR_TOKEN' \\")
    print("  -d '{")
    print(f'    "codigo": "{codigo_test}"')
    print("  }'")
    
    print("\n📊 VERIFICAR DESPUÉS DE CADA OPERACIÓN:")
    print(f"curl 'http://35.171.228.165:9200/productos/_search?q=codigo:CODIGO_PRODUCTO'")
    
    print("\n🔍 VER TODOS LOS PRODUCTOS:")
    print("curl 'http://35.171.228.165:9200/productos/_search?size=20'")

if __name__ == "__main__":
    main()
