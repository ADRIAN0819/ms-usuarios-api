# Lambda Streams - Actualizador de Compras

Este proyecto implementa un sistema de actualización de compras utilizando DynamoDB Streams y AWS Lambda, que procesa cambios en tiempo real y almacena las compras como archivos JSON en S3.

## 🏗️ Arquitectura

```
DynamoDB (Compras) -> DynamoDB Streams -> Lambda -> S3 (JSON Files)
```

## 📋 Características

- **Procesamiento en tiempo real**: Utiliza DynamoDB Streams para capturar cambios instantáneamente
- **Almacenamiento escalable**: Guarda compras como archivos JSON en S3 con estructura organizacional
- **Versionado**: Mantiene historial de cambios (INSERT, MODIFY, REMOVE)
- **Metadatos enriquecidos**: Incluye información adicional sobre el procesamiento
- **Monitoreo**: Logs detallados para debugging y monitoreo
- **Data Catalog**: AWS Glue Data Catalog configurado para análisis con Athena
- **Consultas SQL**: Queries optimizadas para análisis de negocio y tendencias

## 📊 Data Catalog y Athena

### AWS Glue Data Catalog Configurado
- **Base de datos**: `dev-compras-datacatalog`
- **Tabla**: `compras_json` 
- **Particiones**: Por tenant_id, year, month, day
- **Formato**: JSON con esquema optimizado

### Queries SQL Disponibles
1. **Consulta básica**: Compras recientes con detalles completos
2. **Análisis de productos**: Productos más vendidos por tenant
3. **Análisis temporal**: Tendencias diarias y métricas de negocio

### Verificación del Data Catalog
```bash
# Verificar configuración completa
python verify_datacatalog.py

# Ejecutar queries de prueba en Athena
# Ver archivo: athena-queries.sql
```

### Documentación Completa
- 📖 [Guía del Data Catalog](DATA_CATALOG_GUIDE.md)
- 🔍 [Queries SQL](athena-queries.sql)
- 🧪 [Script de verificación](verify_datacatalog.py)

## 🚀 Despliegue

### Prerequisitos

1. **Node.js** (>=18.0.0)
2. **Serverless Framework** (>=3.38.0)
3. **Python** (3.12)
4. **AWS CLI** configurado
5. **Permisos IAM** adecuados

### Instalación

```bash
# Navegar al directorio
cd lambdas-streams

# Instalar dependencias de Node.js
npm install

# Instalar dependencias de Python
pip install -r requirements.txt

# Instalar Serverless Framework globalmente (si no está instalado)
npm install -g serverless
```

### Configuración

1. **Configurar variables de entorno** en `serverless.yml`:
   ```yaml
   custom:
     bucketName: ${sls:stage}-compras-backup-s3-bucket
     comprasTable: ${sls:stage}-t_MS3_compras
   ```

2. **Actualizar ARN del IAM Role** en `serverless.yml`:
   ```yaml
   iam:
     role: arn:aws:iam::TU_ACCOUNT_ID:role/LabRole
   ```

### Despliegue

```bash
# Desplegar en desarrollo
serverless deploy

# Desplegar en producción
serverless deploy --stage prod

# Ver información del despliegue
serverless info
```

## 📊 Estructura de Datos

### Evento de DynamoDB Stream
```json
{
  "eventID": "unique-event-id",
  "eventName": "INSERT|MODIFY|REMOVE",
  "eventSource": "aws:dynamodb",
  "awsRegion": "us-east-1",
  "dynamodb": {
    "NewImage": {
      "compra_id": {"S": "uuid"},
      "user_id": {"S": "user_id"},
      "tenant_id": {"S": "tenant_id"},
      "fecha": {"S": "2025-07-13 10:30:00"},
      "productos": {"L": [...]}
    }
  }
}
```

### Archivo JSON en S3
```json
{
  "compra_id": "uuid",
  "user_id": "user_id",
  "tenant_id": "tenant_id",
  "fecha": "2025-07-13 10:30:00",
  "productos": [
    {
      "codigo": "PROD001",
      "nombre": "Producto Test",
      "precio_unitario": 99.99,
      "cantidad": 2
    }
  ],
  "resumen": {
    "total_productos": 1,
    "total_cantidad": 2,
    "total_precio": 199.98,
    "moneda": "USD"
  },
  "metadata": {
    "event_name": "INSERT",
    "event_source": "aws:dynamodb",
    "aws_region": "us-east-1",
    "processed_at": "2025-07-13T10:30:45.123Z",
    "processed_by": "lambda-streams-actualizador-compras",
    "stage": "dev"
  }
}
```

## 🗂️ Estructura de Archivos en S3

```
compras/
├── {tenant_id}/
│   ├── {año}/
│   │   ├── {mes}/
│   │   │   ├── {día}/
│   │   │   │   ├── insert_{compra_id}_{timestamp}.json
│   │   │   │   ├── modify_{compra_id}_{timestamp}.json
│   │   │   │   └── remove_{compra_id}_{timestamp}.json
```

### Ejemplo de estructura:
```
compras/
├── empresa_postman/
│   ├── 2025/
│   │   ├── 07/
│   │   │   ├── 13/
│   │   │   │   ├── insert_abc123_20250713_103045.json
│   │   │   │   └── modify_abc123_20250713_103145.json
```

## 🔧 Funciones Lambda

### 1. `actualizarComprasStream`
- **Trigger**: DynamoDB Stream
- **Función**: Procesa cambios en la tabla de compras
- **Salida**: Archivos JSON en S3

### 2. `generarReporteCompras` (Adicional)
- **Trigger**: HTTP/Manual
- **Función**: Genera reportes bajo demanda
- **Salida**: Estadísticas y reportes

## 📝 Comandos Útiles

```bash
# Ver logs en tiempo real
serverless logs -f actualizarComprasStream --tail

# Invocar función manualmente
serverless invoke -f actualizarComprasStream

# Ver métricas
serverless metrics

# Eliminar el stack
serverless remove
```

## 🧪 Testing

### Test Local
```bash
# Ejecutar test del lambda
cd lambdas
python actualizar_compras_stream.py
```

### Test con Evento Real
```bash
# Crear un evento de prueba
serverless invoke -f actualizarComprasStream --data '{"Records": [...]}'
```

## 📊 Monitoreo

### CloudWatch Logs
- Grupo de logs: `/aws/lambda/lambdas-streams-actualizador-compras-dev-actualizarComprasStream`
- Métricas: Invocaciones, errores, duración

### Métricas Personalizadas
- Compras procesadas exitosamente
- Compras fallidas
- Tiempo de procesamiento
- Tamaño de archivos generados

## 🔍 Troubleshooting

### Problemas Comunes

1. **Error de permisos IAM**
   ```
   Solución: Verificar que el rol LabRole tenga permisos para DynamoDB Streams y S3
   ```

2. **Stream no habilitado**
   ```
   Solución: Verificar que el stream esté habilitado en la tabla DynamoDB
   ```

3. **Bucket S3 no encontrado**
   ```
   Solución: Verificar que el bucket se haya creado correctamente
   ```

### Debugging

1. **Verificar logs**:
   ```bash
   serverless logs -f actualizarComprasStream --tail
   ```

2. **Inspeccionar eventos**:
   ```bash
   aws dynamodb describe-table --table-name dev-t_MS3_compras
   ```

3. **Verificar archivos en S3**:
   ```bash
   aws s3 ls s3://dev-compras-backup-s3-bucket/compras/ --recursive
   ```

## 🔧 Configuración Avanzada

### Ajuste de Rendimiento
- **Batch Size**: Ajustar `batchSize` en `serverless.yml`
- **Timeout**: Configurar `timeout` apropiado
- **Memory**: Ajustar `memorySize` según necesidades

### Configuración de Streams
- **Starting Position**: `TRIM_HORIZON` vs `LATEST`
- **Batching Window**: Optimizar para latencia vs throughput
- **Retry Policy**: Configurar reintentos automáticos

## 📚 Referencias

- [DynamoDB Streams](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Streams.html)
- [AWS Lambda](https://docs.aws.amazon.com/lambda/)
- [Serverless Framework](https://www.serverless.com/framework/docs/)
- [S3 Best Practices](https://docs.aws.amazon.com/s3/latest/userguide/optimizing-performance.html)

## 👥 Contribuidores

- **Grupo 3 - Cloud Final**
- **Última actualización**: Julio 2025
- **Versión**: 1.0.0

## 📄 Licencia

MIT License - Ver archivo [LICENSE](LICENSE) para más detalles.
