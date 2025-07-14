-- ============================================
-- QUERIES SQL PARA ATHENA - CATÁLOGO DE DATOS
-- Base de datos: dev-compras-datacatalog
-- Tabla: 13 (TABLA REAL CON DATOS JSON)
-- ESTRUCTURA REAL BASADA EN ARCHIVOS JSON DE DYNAMODB STREAMS
-- ============================================

-- QUERY 1: DESCRIBE tabla 13 - Obtener esquema completo
-- Esta query SÍ FUNCIONA y muestra la estructura de 7 columnas
DESCRIBE `dev-compras-datacatalog`.`13`;

-- QUERY 2: DESCRIBE FORMATTED tabla 13 - Información detallada
-- Esta query SÍ FUNCIONA y muestra 42 filas de metadatos
DESCRIBE FORMATTED `dev-compras-datacatalog`.`13`;

-- QUERY 3: Consulta básica de compras (EJEMPLO - NO FUNCIONA EN AWS ACADEMY)
-- Esta query muestra cómo se haría la consulta si no hubiera restricciones
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
FROM `dev-compras-datacatalog`.`13`
WHERE tenant_id = 'empresa_postman'
ORDER BY fecha DESC
LIMIT 10;

-- ============================================
-- QUERIES SQL ADICIONALES PARA ANÁLISIS (EJEMPLOS)
-- Estas queries mostrarían cómo analizar los datos si no hubiera restricciones
-- ============================================

-- QUERY 4: Filtro por usuario específico
SELECT 
    compra_id,
    user_id,
    tenant_id,
    fecha,
    resumen.total_precio
FROM `dev-compras-datacatalog`.`13`
WHERE user_id = 'user_test_postman'
ORDER BY fecha DESC
LIMIT 5;

-- QUERY 5: Análisis de productos más vendidos
SELECT 
    producto.codigo,
    producto.nombre,
    producto.precio_unitario,
    SUM(producto.cantidad) as total_vendido,
    COUNT(*) as veces_comprado
FROM `dev-compras-datacatalog`.`13`
CROSS JOIN UNNEST(productos) AS t(producto)
GROUP BY producto.codigo, producto.nombre, producto.precio_unitario
ORDER BY total_vendido DESC
LIMIT 10;

-- QUERY 6: Resumen de ventas por tenant
SELECT 
    tenant_id,
    COUNT(*) as total_compras,
    SUM(resumen.total_cantidad) as total_productos_vendidos,
    SUM(resumen.total_precio) as total_ventas,
    AVG(resumen.total_precio) as promedio_por_compra
FROM `dev-compras-datacatalog`.`13`
GROUP BY tenant_id
ORDER BY total_ventas DESC;

-- ============================================
-- EVIDENCIA DE QUERIES EJECUTADAS EXITOSAMENTE
-- ============================================

-- ✅ QUERY EXITOSA #1: DESCRIBE tabla 13
-- Resultado: 7 columnas detectadas
-- Ejecutada el: 2025-07-13 20:30:00
-- Query ID: 99e57b3e-506a-4d75-bd7b-4a6f7e381a94

-- ✅ QUERY EXITOSA #2: DESCRIBE FORMATTED tabla 13  
-- Resultado: 42 filas de información detallada
-- Ejecutada el: 2025-07-13 20:31:00
-- Query ID: 6eb0e91a-333c-4b21-bfc6-16c1ac8ee61c

-- ✅ QUERY EXITOSA #3: SHOW DATABASES
-- Resultado: 4 bases de datos encontradas (default, dev-compras-datacatalog, universidad, veterinaria)
-- Ejecutada anteriormente con éxito

-- ============================================
-- ESTRUCTURA REAL DE LA TABLA 13 DETECTADA
-- ============================================

/*
COLUMNAS DETECTADAS:
1. compra_id           → string              
2. user_id             → string              
3. tenant_id           → string              
4. fecha               → string              
5. productos           → array<struct<codigo:string,nombre:string,precio_unitario:double,cantidad:int>>
6. metadata            → struct<event_name:string,event_source:string,aws_region:string,processed_at:string,processed_by:string,stage:string>
7. resumen             → struct<total_productos:int,total_cantidad:int,total_precio:double,moneda:string>

DATOS JSON REALES EN S3:
- 3 archivos JSON confirmados
- Estructura anidada con arrays y structs
- Datos de compras de empresa_postman
- Usuarios: user_test_postman, user_test3_postman
- Productos diversos con precios y cantidades
*/
-- QUERY 3: Análisis temporal de compras - Tendencias diarias
-- Muestra estadísticas diarias de compras para análisis de tendencias
-- SIMPLIFICADA: Agregaciones básicas sin funciones complejas
SELECT 
    tenant_id,
    year,
    month,
    day,
    COUNT(*) as total_compras_dia,
    COUNT(DISTINCT user_id) as usuarios_unicos,
    SUM(resumen.total_cantidad) as total_productos_vendidos,
    SUM(resumen.total_precio) as total_ingresos_dia,
    AVG(resumen.total_precio) as precio_promedio_compra
FROM `dev-compras-datacatalog`.`compras_json`
WHERE year = '2025'
  AND month = '07'
  AND day = '13'
GROUP BY tenant_id, year, month, day
ORDER BY total_ingresos_dia DESC
LIMIT 30;

-- ============================================
-- QUERIES ADICIONALES PARA ANÁLISIS AVANZADO
-- ============================================

-- QUERY 4: Análisis de usuarios más activos por tenant
SELECT 
    tenant_id,
    user_id,
    COUNT(*) as total_compras,
    SUM(resumen.total_precio) as total_gastado,
    AVG(resumen.total_precio) as promedio_por_compra,
    MIN(metadata.processed_at) as primera_compra,
    MAX(metadata.processed_at) as ultima_compra
FROM `dev-compras-datacatalog`.`compras_json`
WHERE year = '2025'
GROUP BY tenant_id, user_id
HAVING COUNT(*) > 1
ORDER BY total_gastado DESC
LIMIT 15;

-- QUERY 5: Análisis de eventos de DynamoDB Streams
-- Muestra la distribución de eventos (INSERT, MODIFY, REMOVE)
SELECT 
    tenant_id,
    metadata.event_name,
    COUNT(*) as total_eventos,
    DATE(metadata.processed_at) as fecha_procesamiento,
    COUNT(DISTINCT compra_id) as compras_afectadas
FROM `dev-compras-datacatalog`.`compras_json`
WHERE year = '2025'
  AND month = '07'
GROUP BY tenant_id, metadata.event_name, DATE(metadata.processed_at)
ORDER BY fecha_procesamiento DESC, total_eventos DESC;

-- QUERY 6: Análisis de performance del procesamiento
-- Muestra estadísticas del procesamiento de los streams
SELECT 
    metadata.stage,
    metadata.processed_by,
    DATE(metadata.processed_at) as fecha,
    HOUR(TIMESTAMP(metadata.processed_at)) as hora,
    COUNT(*) as records_procesados,
    COUNT(DISTINCT tenant_id) as tenants_activos,
    AVG(resumen.total_precio) as precio_promedio
FROM `dev-compras-datacatalog`.`compras_json`
WHERE year = '2025'
  AND month = '07'
GROUP BY metadata.stage, metadata.processed_by, DATE(metadata.processed_at), HOUR(TIMESTAMP(metadata.processed_at))
ORDER BY fecha DESC, hora DESC;
