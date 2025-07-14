-- ============================================
-- QUERIES SQL PARA ATHENA - CATÁLOGO DE DATOS
-- Base de datos: dev-compras-datacatalog
-- Tabla: compras_json
-- ESTRUCTURA REAL BASADA EN ARCHIVOS JSON
-- ============================================

-- QUERY 1: Consulta básica de todas las compras con información detallada
-- Muestra las compras más recientes con detalles de productos y totales
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
FROM `dev-compras-datacatalog`.`compras_json`
WHERE tenant_id = 'empresa_postman'
  AND year = '2025'
  AND month = '07'
  AND day = '13'
ORDER BY metadata.processed_at DESC
LIMIT 10;

-- ============================================
-- QUERY 2: Análisis de productos más vendidos por tenant
-- Agrupa por producto y muestra estadísticas de ventas
-- SIMPLIFICADA: Sin UNNEST para evitar errores
SELECT 
    tenant_id,
    compra_id,
    user_id,
    fecha,
    resumen.total_productos,
    resumen.total_cantidad,
    resumen.total_precio,
    metadata.event_name
FROM `dev-compras-datacatalog`.`compras_json`
WHERE year = '2025'
  AND month = '07'
  AND day = '13'
ORDER BY resumen.total_precio DESC
LIMIT 20;

-- ============================================
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
