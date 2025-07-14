# Guía de Despliegue - Lambda Streams Actualizador de Compras

## 🚀 Pasos para Desplegar

### 1. Preparación del Entorno

```powershell
# Navegar al directorio del proyecto
cd C:\Users\LENOVO\CloudFinalBack\CLOUD-FINAL\lambdas-streams

# Instalar dependencias de Node.js
npm install

# Instalar Serverless Framework globalmente (si no está instalado)
npm install -g serverless

# Verificar instalación
serverless --version
```

### 2. Configuración de AWS

```powershell
# Configurar AWS CLI (si no está configurado)
aws configure

# Verificar configuración
aws sts get-caller-identity
```

### 3. Despliegue del Servicio

```powershell
# Desplegar en desarrollo
serverless deploy

# O desplegar en producción
serverless deploy --stage prod
```

### 4. Verificación Post-Despliegue

```powershell
# Ver información del despliegue
serverless info

# Ver logs
serverless logs -f actualizarComprasStream --tail

# Probar la función
serverless invoke -f actualizarComprasStream
```

## 🔧 Configuración del MS3 para Habilitar Streams

Para conectar el Lambda al MS3 existente, necesitas modificar el `serverless.yml` del MS3:

### Modificar `PROYECTO_FINAL/MS3-api-compras/serverless.yml`

```yaml
resources:
  Resources:
    ComprasTable:
      Type: AWS::DynamoDB::Table
      Properties:
        TableName: ${self:provider.environment.COMPRAS_TABLE}
        AttributeDefinitions:
          - AttributeName: compra_id
            AttributeType: S
        KeySchema:
          - AttributeName: compra_id
            KeyType: HASH
        BillingMode: PAY_PER_REQUEST
        # AGREGAR ESTAS LÍNEAS PARA HABILITAR STREAMS
        StreamSpecification:
          StreamViewType: NEW_AND_OLD_IMAGES
        PointInTimeRecoverySpecification:
          PointInTimeRecoveryEnabled: true
```

### Re-desplegar MS3 con Streams

```powershell
# Ir al directorio del MS3
cd C:\Users\LENOVO\CloudFinalBack\CLOUD-FINAL\PROYECTO_FINAL\MS3-api-compras

# Re-desplegar para habilitar streams
serverless deploy
```

## 🔗 Conectar Lambda al Stream del MS3

### Opción 1: Usar el ARN del Stream Existente

1. Obtener el ARN del stream del MS3:
```powershell
aws dynamodb describe-table --table-name dev-t_MS3_compras --query "Table.LatestStreamArn"
```

2. Actualizar `serverless.yml` del lambda-streams:
```yaml
functions:
  actualizarComprasStream:
    handler: lambdas/actualizar_compras_stream.lambda_handler
    events:
      - stream:
          type: dynamodb
          # Reemplazar con el ARN real del stream
          arn: arn:aws:dynamodb:us-east-1:254780740814:table/dev-t_MS3_compras/stream/2025-07-13T10:30:00.000
```

### Opción 2: Usar CloudFormation Reference

```yaml
functions:
  actualizarComprasStream:
    handler: lambdas/actualizar_compras_stream.lambda_handler
    events:
      - stream:
          type: dynamodb
          arn: !ImportValue dev-ComprasTableStreamArn
```

## 📊 Pruebas del Sistema

### 1. Crear una Compra de Prueba

```powershell
# Usar Postman o curl para crear una compra
curl -X POST https://bi3zdo4r1c.execute-api.us-east-1.amazonaws.com/dev/compras/registrar \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "productos": [
      {
        "codigo": "TEST001",
        "cantidad": 1
      }
    ]
  }'
```

### 2. Verificar el Procesamiento

```powershell
# Ver logs del lambda
serverless logs -f actualizarComprasStream --tail

# Verificar archivos en S3
aws s3 ls s3://dev-compras-backup-s3-bucket/compras/ --recursive
```

### 3. Descargar y Verificar Archivo JSON

```powershell
# Listar archivos específicos
aws s3 ls s3://dev-compras-backup-s3-bucket/compras/empresa_postman/2025/07/13/

# Descargar archivo específico
aws s3 cp s3://dev-compras-backup-s3-bucket/compras/empresa_postman/2025/07/13/insert_COMPRA_ID_TIMESTAMP.json ./
```

## 🚨 Resolución de Problemas

### Problema 1: Stream ARN no encontrado

```powershell
# Verificar que el stream esté habilitado
aws dynamodb describe-table --table-name dev-t_MS3_compras --query "Table.StreamSpecification"

# Si no está habilitado, actualizar la tabla
aws dynamodb update-table \
  --table-name dev-t_MS3_compras \
  --stream-specification StreamEnabled=true,StreamViewType=NEW_AND_OLD_IMAGES
```

### Problema 2: Permisos IAM

```powershell
# Verificar rol actual
aws sts get-caller-identity

# Asegurar que el rol tenga permisos para:
# - DynamoDB Streams
# - S3
# - CloudWatch Logs
```

### Problema 3: Bucket S3 no existe

```powershell
# Verificar bucket
aws s3 ls s3://dev-compras-backup-s3-bucket/

# Si no existe, el despliegue debe crearlo automáticamente
serverless deploy --verbose
```

## 📈 Monitoreo y Métricas

### CloudWatch Metrics

```powershell
# Ver métricas del lambda
aws cloudwatch get-metric-statistics \
  --namespace AWS/Lambda \
  --metric-name Invocations \
  --dimensions Name=FunctionName,Value=lambdas-streams-actualizador-compras-dev-actualizarComprasStream \
  --start-time 2025-07-13T00:00:00Z \
  --end-time 2025-07-13T23:59:59Z \
  --period 3600 \
  --statistics Sum
```

### Logs Estructurados

```powershell
# Filtrar logs específicos
aws logs filter-log-events \
  --log-group-name /aws/lambda/lambdas-streams-actualizador-compras-dev-actualizarComprasStream \
  --filter-pattern "ERROR"
```

## 🔄 Proceso de Actualización

### 1. Actualizar Código

```powershell
# Después de hacer cambios al código
serverless deploy function -f actualizarComprasStream
```

### 2. Actualizar Configuración

```powershell
# Después de cambiar serverless.yml
serverless deploy
```

### 3. Rollback si es Necesario

```powershell
# Ver versiones anteriores
serverless deploy list

# Rollback a versión anterior
serverless rollback -t TIMESTAMP
```

## 🎯 Validación Final

### Checklist de Verificación

- [ ] Lambda desplegado correctamente
- [ ] Stream de DynamoDB habilitado
- [ ] Bucket S3 creado
- [ ] Permisos IAM configurados
- [ ] Prueba de compra exitosa
- [ ] Archivo JSON generado en S3
- [ ] Logs sin errores
- [ ] Métricas disponibles en CloudWatch

### Comando de Validación Completa

```powershell
# Script de validación
echo "=== Validando Lambda Streams ==="
echo "1. Verificando función..."
serverless invoke -f actualizarComprasStream
echo "2. Verificando bucket S3..."
aws s3 ls s3://dev-compras-backup-s3-bucket/
echo "3. Verificando stream..."
aws dynamodb describe-table --table-name dev-t_MS3_compras --query "Table.StreamSpecification"
echo "4. Verificando logs..."
serverless logs -f actualizarComprasStream --count 5
echo "=== Validación completada ==="
```

## 📞 Soporte

Si encuentras problemas durante el despliegue:

1. **Revisar logs**: `serverless logs -f actualizarComprasStream --tail`
2. **Verificar permisos**: Asegurar que el rol LabRole tenga todos los permisos necesarios
3. **Revisar configuración**: Verificar que todas las variables de entorno estén correctas
4. **Consultar documentación**: Revisar el README.md para detalles adicionales

---

**Fecha de actualización**: Julio 13, 2025
**Versión**: 1.0.0
**Autor**: Grupo 3 - Cloud Final
