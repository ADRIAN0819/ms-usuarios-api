# 🔐 MS1-api-usuarios

Microservicio de gestión de usuarios y autenticación para la arquitectura de microservicios del proyecto final.

## 📋 Descripción

Este microservicio maneja:
- ✅ Registro de usuarios
- ✅ Autenticación y login
- ✅ Validación de tokens de acceso
- ✅ Gestión de sesiones por tenant

## 🏗️ Estructura del Proyecto

```
MS1-api-usuarios/
├── lambdas/                           # Funciones Lambda
│   ├── Lambda_CrearUsuario.py         # Crear nuevos usuarios
│   ├── Lambda_LoginUsuario.py         # Autenticación de usuarios
│   └── Lambda_ValidarTokenAcceso.py   # Validación de tokens
├── serverless.yml                     # Configuración de Serverless Framework
├── swagger.yaml                       # Documentación de API
├── README.md                          # Este archivo
├── MS1-Postman-Collection.json        # Colección de Postman para testing
└── test_endpoints.ps1                 # Script de testing automatizado
```

## 🚀 Deploy

```bash
# Instalar dependencias globales
npm install -g serverless

# Configurar credenciales AWS
aws configure

# Desplegar
serverless deploy
```

## 🧪 Testing

### Opción 1: Script PowerShell
```powershell
.\test_endpoints.ps1
```

### Opción 2: Postman
1. Importar `MS1-Postman-Collection.json` en Postman
2. Configurar la variable `base_url` con tu API Gateway URL
3. Ejecutar las requests en orden

## 📡 Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/usuarios/crear` | Crear nuevo usuario |
| POST | `/usuarios/login` | Autenticar usuario |
| POST | `/usuarios/validar` | Validar token de acceso |

## 🔧 Variables de Entorno

- `JWT_SECRET`: Clave secreta para tokens
- `TABLE_NAME`: Nombre de tabla DynamoDB usuarios
- `TOKENS_TABLE`: Nombre de tabla DynamoDB tokens

## 🏷️ Tags

`serverless` `aws` `lambda` `dynamodb` `python` `api-gateway` `cors`