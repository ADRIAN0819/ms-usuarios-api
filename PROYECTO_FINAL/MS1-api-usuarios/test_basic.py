#!/usr/bin/env python3
"""
Script básico de pruebas para validar las funciones lambda
"""
import json
import sys
import os

# Agregar el directorio lambdas al path
sys.path.append('lambdas')

def test_hash_function():
    """Test de la función hash"""
    try:
        from Lambda_CrearUsuario import hash_password
        result = hash_password("test123")
        print(f"✅ Hash function works: {result[:10]}...")
        return True
    except Exception as e:
        print(f"❌ Hash function failed: {e}")
        return False

def test_import_lambdas():
    """Test de importación de las lambdas"""
    try:
        import Lambda_CrearUsuario
        import Lambda_LoginUsuario
        import Lambda_ValidarTokenAcceso
        print("✅ All lambda imports successful")
        return True
    except Exception as e:
        print(f"❌ Lambda import failed: {e}")
        return False

def test_cors_headers():
    """Test de headers CORS"""
    try:
        from Lambda_CrearUsuario import cors_headers
        required_headers = ['Content-Type', 'Access-Control-Allow-Origin']
        for header in required_headers:
            if header not in cors_headers:
                raise Exception(f"Missing header: {header}")
        print("✅ CORS headers are properly configured")
        return True
    except Exception as e:
        print(f"❌ CORS headers test failed: {e}")
        return False

def test_mock_crear_usuario():
    """Test básico de crear usuario con datos mock"""
    try:
        from Lambda_CrearUsuario import lambda_handler
        
        # Evento mock para OPTIONS (CORS preflight)
        options_event = {
            'httpMethod': 'OPTIONS',
            'headers': {},
            'body': None
        }
        
        result = lambda_handler(options_event, {})
        if result['statusCode'] != 200:
            raise Exception(f"OPTIONS request failed: {result}")
        
        print("✅ OPTIONS request handling works")
        return True
    except Exception as e:
        print(f"❌ Mock crear usuario test failed: {e}")
        return False

def main():
    """Ejecutar todas las pruebas"""
    print("🧪 Ejecutando pruebas básicas del MS1-api-usuarios...")
    print("=" * 50)
    
    tests = [
        test_import_lambdas,
        test_hash_function,
        test_cors_headers,
        test_mock_crear_usuario
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        if test():
            passed += 1
        print()
    
    print("=" * 50)
    print(f"📊 Resultados: {passed}/{total} pruebas pasaron")
    
    if passed == total:
        print("🎉 ¡Todas las pruebas básicas pasaron! El código está listo para deploy.")
        return True
    else:
        print("⚠️  Algunas pruebas fallaron. Revisar antes del deploy.")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
