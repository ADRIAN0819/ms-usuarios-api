#!/usr/bin/env python3
"""
Script de pruebas end-to-end para el MS1-api-usuarios desplegado
"""
import requests
import json
import time

BASE_URL = "https://dchblr3rv8.execute-api.us-east-1.amazonaws.com/dev"

def test_crear_usuario():
    """Test crear usuario"""
    print("🧪 Probando crear usuario...")
    
    url = f"{BASE_URL}/usuarios/crear"
    data = {
        "user_id": "test_user_grupo3",
        "password": "password123",
        "name": "Usuario Test Grupo 3",
        "tenant_id": "grupo3"
    }
    
    try:
        response = requests.post(url, json=data, timeout=10)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            print("✅ Usuario creado exitosamente")
            return True
        else:
            print("❌ Error al crear usuario")
            return False
    except Exception as e:
        print(f"❌ Error en request: {e}")
        return False

def test_login_usuario():
    """Test login usuario"""
    print("\n🧪 Probando login usuario...")
    
    url = f"{BASE_URL}/usuarios/login"
    data = {
        "user_id": "test_user_grupo3",
        "password": "password123"
    }
    
    try:
        response = requests.post(url, json=data, timeout=10)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            response_data = response.json()
            token = response_data.get('token')
            if token:
                print("✅ Login exitoso, token obtenido")
                return token
            else:
                print("❌ Login exitoso pero no se obtuvo token")
                return None
        else:
            print("❌ Error en login")
            return None
    except Exception as e:
        print(f"❌ Error en request: {e}")
        return None

def test_validar_token(token):
    """Test validar token"""
    print("\n🧪 Probando validar token...")
    
    url = f"{BASE_URL}/usuarios/validar"
    data = {
        "token": token
    }
    
    try:
        response = requests.post(url, json=data, timeout=10)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            print("✅ Token válido")
            return True
        else:
            print("❌ Token inválido")
            return False
    except Exception as e:
        print(f"❌ Error en request: {e}")
        return False

def test_cors():
    """Test CORS preflight"""
    print("\n🧪 Probando CORS...")
    
    url = f"{BASE_URL}/usuarios/crear"
    headers = {
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
    }
    
    try:
        response = requests.options(url, headers=headers, timeout=10)
        print(f"OPTIONS Status Code: {response.status_code}")
        print(f"CORS Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            print("✅ CORS configurado correctamente")
            return True
        else:
            print("❌ Error en CORS")
            return False
    except Exception as e:
        print(f"❌ Error en CORS test: {e}")
        return False

def main():
    """Ejecutar todas las pruebas end-to-end"""
    print("🚀 Iniciando pruebas end-to-end del MS1-api-usuarios")
    print("=" * 60)
    print(f"Base URL: {BASE_URL}")
    print("=" * 60)
    
    # Test 1: CORS
    cors_ok = test_cors()
    
    # Test 2: Crear usuario
    crear_ok = test_crear_usuario()
    
    # Test 3: Login (solo si crear funcionó)
    token = None
    if crear_ok:
        token = test_login_usuario()
    
    # Test 4: Validar token (solo si login funcionó)
    validar_ok = False
    if token:
        validar_ok = test_validar_token(token)
    
    # Resumen
    print("\n" + "=" * 60)
    print("📊 RESUMEN DE PRUEBAS:")
    print(f"✅ CORS: {'✓' if cors_ok else '✗'}")
    print(f"✅ Crear Usuario: {'✓' if crear_ok else '✗'}")
    print(f"✅ Login Usuario: {'✓' if token else '✗'}")
    print(f"✅ Validar Token: {'✓' if validar_ok else '✗'}")
    
    total_tests = 4
    passed_tests = sum([cors_ok, crear_ok, bool(token), validar_ok])
    
    print(f"\n🎯 Resultado Final: {passed_tests}/{total_tests} pruebas pasaron")
    
    if passed_tests == total_tests:
        print("🎉 ¡TODAS LAS PRUEBAS PASARON! El MS1-api-usuarios está funcionando perfectamente.")
        print("🔗 API Base URL:", BASE_URL)
        print("📚 Endpoints disponibles:")
        print(f"   • POST {BASE_URL}/usuarios/crear")
        print(f"   • POST {BASE_URL}/usuarios/login")
        print(f"   • POST {BASE_URL}/usuarios/validar")
    else:
        print("⚠️ Algunas pruebas fallaron. Revisar logs.")
    
    return passed_tests == total_tests

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
