# 🔍 ANÁLISIS COMPARATIVO DE CONFIGURACIONES YML

## ✅ COMPARACIÓN MS1 vs MS2 vs MS3

### 📋 CONFIGURACIONES CORRECTAS (✅):

#### **Organización**:

- MS1: ✅ `adrianurbinamendoza`
- MS2: ✅ `adrianurbinamendoza`
- MS3: ✅ `adrianurbinamendoza`

#### **IAM Role**:

- MS1: ✅ `arn:aws:iam::254780740814:role/LabRole`
- MS2: ✅ `arn:aws:iam::254780740814:role/LabRole`
- MS3: ✅ `arn:aws:iam::254780740814:role/LabRole`

#### **Configuración Básica**:

- MS1: ✅ `memorySize: 1024, timeout: 30`
- MS2: ✅ `memorySize: 1024, timeout: 30`
- MS3: ✅ `memorySize: 1024, timeout: 30`

#### **Tablas Referenciadas**:

- MS1: ✅ Crea sus propias tablas
- MS2: ✅ Referencia correcta a `TOKENS_TABLE: ${sls:stage}-t_MS1_tokens_acceso`
- MS3: ✅ Referencias correctas a ambas tablas:
  - `TOKENS_TABLE: ${sls:stage}-t_MS1_tokens_acceso`
  - `PRODUCTOS_TABLE: ${sls:stage}-t_MS2_productos`

### ⚠️ DIFERENCIAS IDENTIFICADAS:

#### **1. Runtime**:

- MS1: ✅ `python3.12`
- MS2: ⚠️ `nodejs16.x` (correcto para Node.js)
- MS3: ✅ `python3.12`

#### **2. CORS Configuration**:

- MS1: ✅ **DETALLADO** (origins, headers, methods específicos)
- MS2: ⚠️ **SIMPLE** (`cors: true`)
- MS3: ⚠️ **SIMPLE** (`cors: true`)

#### **3. Integration Type**:

- MS1: ✅ `integration: lambda-proxy`
- MS2: ❌ **FALTANTE**
- MS3: ❌ **FALTANTE**

#### **4. OPTIONS Methods**:

- MS1: ✅ **EXPLÍCITOS** (endpoints OPTIONS definidos)
- MS2: ❌ **FALTANTES**
- MS3: ❌ **FALTANTES**

### 🚨 PROBLEMAS CRÍTICOS A CORREGIR:

#### **MS2 (Node.js) - NECESITA ACTUALIZACIÓN:**

1. **CORS detallado** como MS1
2. **Integration lambda-proxy**
3. **Endpoints OPTIONS** explícitos
4. **Actualizar runtime** a nodejs18.x o más reciente

#### **MS3 (Python) - NECESITA ACTUALIZACIÓN:**

1. **CORS detallado** como MS1
2. **Integration lambda-proxy**
3. **Endpoints OPTIONS** explícitos

### 📝 CONFIGURACIONES RECOMENDADAS:

#### **Para MS2:**

```yaml
events:
  - http:
      path: productos/crear
      method: post
      cors:
        origins:
          - "*"
        headers:
          - Content-Type
          - X-Amz-Date
          - Authorization
          - X-Api-Key
          - X-Amz-Security-Token
        methods:
          - POST
          - OPTIONS
      integration: lambda-proxy
  - http:
      path: productos/crear
      method: options
      cors:
        origins:
          - "*"
        headers:
          - Content-Type
          - X-Amz-Date
          - Authorization
          - X-Api-Key
          - X-Amz-Security-Token
        methods:
          - POST
          - OPTIONS
      integration: lambda-proxy
```

#### **Para MS3:**

```yaml
events:
  - http:
      path: compras/registrar
      method: post
      cors:
        origins:
          - "*"
        headers:
          - Content-Type
          - X-Amz-Date
          - Authorization
          - X-Api-Key
          - X-Amz-Security-Token
        methods:
          - POST
          - OPTIONS
      integration: lambda-proxy
  - http:
      path: compras/registrar
      method: options
      cors:
        origins:
          - "*"
        headers:
          - Content-Type
          - X-Amz-Date
          - Authorization
          - X-Api-Key
          - X-Amz-Security-Token
        methods:
          - POST
          - OPTIONS
      integration: lambda-proxy
```

### 🎯 RESUMEN:

- **MS1**: ✅ **PERFECTO** - Configuración completa y detallada
- **MS2**: ⚠️ **NECESITA MEJORAS** - CORS, integration, OPTIONS
- **MS3**: ⚠️ **NECESITA MEJORAS** - CORS, integration, OPTIONS

### 🔧 ACCIÓN REQUERIDA:

1. Actualizar MS2 y MS3 con configuraciones CORS detalladas
2. Agregar integration: lambda-proxy
3. Agregar endpoints OPTIONS explícitos
4. Considerar actualizar Node.js runtime en MS2
