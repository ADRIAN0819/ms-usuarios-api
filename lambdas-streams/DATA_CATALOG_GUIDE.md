# AWS Glue Data Catalog y Athena - Guía de Implementación

## 📋 Descripción General

Este sistema implementa un **Data Catalog** completo usando AWS Glue y permite realizar consultas SQL con **Amazon Athena** sobre los datos de compras almacenados en S3.

## 🏗️ Arquitectura del Data Catalog

```
DynamoDB Streams → Lambda → S3 → Glue Data Catalog → Athena
```

### Componentes principales:

1. **AWS Glue Database**: `dev-compras-datacatalog`
2. **AWS Glue Table**: `compras_json`
3. **S3 Bucket**: `dev-compras-simple-bucket`
4. **Particiones**: Por tenant_id, year, month, day

## 🚀 Configuración e Implementación

### 1. Deploy del Data Catalog

```bash
# Desde la carpeta lambdas-streams
npx sls deploy --config serverless-simple.yml
```

Esto creará:
- ✅ Base de datos en Glue Data Catalog
- ✅ Tabla con esquema JSON optimizado
- ✅ Particiones automáticas por fecha y tenant
- ✅ Configuración de projections para mejor performance

### 2. Verificación del Data Catalog

```bash
# Ejecutar script de verificación
python verify_datacatalog.py
```

### 3. Estructura de la Tabla

La tabla `compras_json` tiene la siguiente estructura:

```sql
CREATE EXTERNAL TABLE compras_json (
    compra_id string,
    user_id string,
    tenant_id string,
    fecha string,
    productos array<struct<
        codigo: string,
        nombre: string,
        precio_unitario: double,
        cantidad: int
    >>,
    resumen struct<
        total_productos: int,
        total_cantidad: int,
        total_precio: double,
        moneda: string
    >,
    metadata struct<
        event_name: string,
        event_source: string,
        aws_region: string,
        processed_at: string,
        processed_by: string,
        stage: string
    >
)
PARTITIONED BY (
    tenant_id string,
    year string,
    month string,
    day string
)
```

## 🔍 Queries SQL para Athena

### Query 1: Consulta Básica de Compras
```sql
SELECT 
    compra_id,
    user_id,
    tenant_id,
    fecha,
    resumen.total_productos,
    resumen.total_cantidad,
    resumen.total_precio,
    resumen.moneda,
    metadata.event_name,
    metadata.processed_at,
    metadata.stage
FROM "dev-compras-datacatalog"."compras_json"
WHERE tenant_id = 'test-tenant-direct'
  AND year = '2025'
  AND month = '07'
  AND day = '13'
ORDER BY metadata.processed_at DESC
LIMIT 10;
```

**Propósito**: Obtener las compras más recientes con información detallada
**Evidencia**: Muestra compras procesadas por el Lambda con metadata completa

### Query 2: Análisis de Productos Más Vendidos
```sql
SELECT 
    tenant_id,
    producto.codigo as codigo_producto,
    producto.nombre as nombre_producto,
    COUNT(*) as total_compras,
    SUM(producto.cantidad) as total_cantidad_vendida,
    AVG(producto.precio_unitario) as precio_promedio,
    SUM(producto.precio_unitario * producto.cantidad) as total_ingresos
FROM "dev-compras-datacatalog"."compras_json"
CROSS JOIN UNNEST(productos) AS t(producto)
WHERE year = '2025'
  AND month = '07'
GROUP BY tenant_id, producto.codigo, producto.nombre
ORDER BY total_ingresos DESC
LIMIT 20;
```

**Propósito**: Analizar qué productos generan más ingresos por tenant
**Evidencia**: Demuestra capacidad de análisis de arrays complejos en JSON

### Query 3: Análisis Temporal - Tendencias Diarias
```sql
SELECT 
    tenant_id,
    year,
    month,
    day,
    DATE(CONCAT(year, '-', LPAD(month, 2, '0'), '-', LPAD(day, 2, '0'))) as fecha_compra,
    COUNT(*) as total_compras_dia,
    COUNT(DISTINCT user_id) as usuarios_unicos,
    SUM(resumen.total_cantidad) as total_productos_vendidos,
    SUM(resumen.total_precio) as total_ingresos_dia,
    AVG(resumen.total_precio) as precio_promedio_compra,
    MAX(resumen.total_precio) as compra_maxima,
    MIN(resumen.total_precio) as compra_minima
FROM "dev-compras-datacatalog"."compras_json"
WHERE year = '2025'
  AND month = '07'
GROUP BY tenant_id, year, month, day
ORDER BY fecha_compra DESC, total_ingresos_dia DESC
LIMIT 30;
```

**Propósito**: Análisis de tendencias temporales y métricas de negocio
**Evidencia**: Utiliza particiones para optimizar consultas por fecha

## 📊 Cómo Ejecutar las Queries

### Opción 1: AWS Console
1. Ir a Amazon Athena en AWS Console
2. Seleccionar base de datos: `dev-compras-datacatalog`
3. Copiar y ejecutar las queries del archivo `athena-queries.sql`

### Opción 2: Script de Verificación
```bash
python verify_datacatalog.py
```

### Opción 3: AWS CLI
```bash
aws athena start-query-execution \
    --query-string "SELECT * FROM dev-compras-datacatalog.compras_json LIMIT 10" \
    --query-execution-context Database=dev-compras-datacatalog \
    --result-configuration OutputLocation=s3://dev-compras-simple-bucket/athena-results/
```

## 🎯 Beneficios del Data Catalog

### 1. **Optimización de Consultas**
- Particionado automático por fecha y tenant
- Projection mapping para mejor performance
- Esquema predefinido para validación

### 2. **Análisis de Negocio**
- Tendencias de ventas por período
- Análisis de productos más vendidos
- Métricas de usuarios activos
- Análisis de eventos del stream

### 3. **Monitoreo y Observabilidad**
- Trazabilidad completa de eventos
- Análisis de performance del procesamiento
- Detección de patrones anómalos

## 📁 Estructura de Archivos S3

```
s3://dev-compras-simple-bucket/
├── compras/
│   ├── test-tenant-direct/
│   │   └── 2025/
│   │       └── 07/
│   │           └── 13/
│   │               ├── insert_compra-123_20250713_143022.json
│   │               ├── modify_compra-456_20250713_143045.json
│   │               └── remove_compra-789_20250713_143067.json
│   └── prod-tenant/
│       └── 2025/
│           └── 07/
│               └── 13/
└── athena-results/
    └── query-results/
```

## 🔧 Troubleshooting

### Problema: "Table not found"
**Solución**: Verificar que el deploy se haya completado correctamente
```bash
python verify_datacatalog.py
```

### Problema: "No data found in partitions"
**Solución**: Generar datos de prueba con el Lambda
```bash
python test_lambda_direct.py
```

### Problema: "Access denied to S3"
**Solución**: Verificar permisos del LabRole en IAM

## 📈 Métricas de Evidencia

Al ejecutar las queries, obtendrás evidencia de:

1. **Funcionalidad del Data Catalog**: Consultas exitosas sobre datos JSON
2. **Procesamiento de Streams**: Metadata de eventos INSERT/MODIFY/REMOVE
3. **Análisis de Negocio**: Estadísticas de ventas, productos, usuarios
4. **Optimización**: Uso eficiente de particiones y projections

## 🔄 Próximos Pasos

1. **Ejecutar deploy**: `npx sls deploy --config serverless-simple.yml`
2. **Generar datos**: Ejecutar tests para crear compras de prueba
3. **Verificar catalog**: `python verify_datacatalog.py`
4. **Ejecutar queries**: Usar las 3 queries principales en Athena
5. **Documentar resultados**: Capturar screenshots de las queries ejecutadas

¡El Data Catalog está listo para proporcionar insights valiosos sobre tus datos de compras! 🚀
