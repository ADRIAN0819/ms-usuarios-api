# Test de Integración - Lambda Streams Actualizador de Compras

## 🧪 Pruebas del Sistema Completo

### 1. Configuración Inicial de Testing

```powershell
# Navegar al directorio
cd C:\Users\LENOVO\CloudFinalBack\CLOUD-FINAL\lambdas-streams

# Instalar dependencias de testing
pip install pytest boto3 moto
```

### 2. Test Local del Lambda

```powershell
# Ejecutar test local
cd lambdas
python actualizar_compras_stream.py
```

**Salida esperada:**
```json
{
  "statusCode": 200,
  "body": "{\"processed\": 1, \"successful\": 1, \"failed\": 0, ...}"
}
```

### 3. Test de Integración con MS3

#### 3.1 Preparar Usuario de Prueba

```bash
# 1. Crear usuario (MS1)
curl -X POST https://dchblr3rv8.execute-api.us-east-1.amazonaws.com/dev/usuarios/crear \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test_streams_user",
    "name": "test_streams@example.com",
    "password": "password123",
    "tenant_id": "test_streams_tenant"
  }'

# 2. Obtener token (MS1)
curl -X POST https://dchblr3rv8.execute-api.us-east-1.amazonaws.com/dev/usuarios/login \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test_streams_user",
    "password": "password123"
  }'
```

#### 3.2 Crear Producto de Prueba

```bash
# Crear producto (MS2) - Usar el token obtenido
curl -X POST https://d3fhew8l8b.execute-api.us-east-1.amazonaws.com/dev/productos/crear \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "codigo": "STREAM_TEST_001",
    "nombre": "Producto Test Streams",
    "descripcion": "Producto para probar streams",
    "precio": 150.00,
    "cantidad": 50,
    "categoria": "Testing"
  }'
```

#### 3.3 Registrar Compra (Debe Activar Stream)

```bash
# Registrar compra (MS3) - Esto debe activar el stream
curl -X POST https://bi3zdo4r1c.execute-api.us-east-1.amazonaws.com/dev/compras/registrar \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "productos": [
      {
        "codigo": "STREAM_TEST_001",
        "cantidad": 2
      }
    ]
  }'
```

### 4. Verificación del Procesamiento

#### 4.1 Verificar Logs del Lambda

```powershell
# Ver logs en tiempo real
serverless logs -f actualizarComprasStream --tail

# Buscar mensajes específicos
serverless logs -f actualizarComprasStream --filter "procesando evento"
```

#### 4.2 Verificar Archivo en S3

```powershell
# Listar archivos generados
aws s3 ls s3://dev-compras-backup-s3-bucket/compras/test_streams_tenant/2025/07/13/ --recursive

# Descargar archivo específico para inspección
aws s3 cp s3://dev-compras-backup-s3-bucket/compras/test_streams_tenant/2025/07/13/insert_COMPRA_ID_TIMESTAMP.json ./test_compra.json

# Ver contenido del archivo
cat test_compra.json
```

**Contenido esperado del archivo JSON:**
```json
{
  "compra_id": "uuid-de-la-compra",
  "user_id": "test_streams_user",
  "tenant_id": "test_streams_tenant",
  "fecha": "2025-07-13 10:30:00",
  "productos": [
    {
      "codigo": "STREAM_TEST_001",
      "nombre": "Producto Test Streams",
      "precio_unitario": 150.0,
      "cantidad": 2
    }
  ],
  "resumen": {
    "total_productos": 1,
    "total_cantidad": 2,
    "total_precio": 300.0,
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

### 5. Test de Modificación de Compra

#### 5.1 Simular Modificación

```python
# Script para simular modificación directa en DynamoDB
import boto3
import json
from datetime import datetime

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('dev-t_MS3_compras')

# Obtener compra existente
response = table.scan(Limit=1)
compra = response['Items'][0]

# Modificar compra (esto activará el stream)
compra['fecha'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
compra['metadata_modificacion'] = 'Test de modificación'

table.put_item(Item=compra)
```

#### 5.2 Verificar Archivo de Modificación

```powershell
# Buscar archivo de modificación
aws s3 ls s3://dev-compras-backup-s3-bucket/compras/test_streams_tenant/2025/07/13/ --recursive | grep modify

# Descargar y verificar
aws s3 cp s3://dev-compras-backup-s3-bucket/compras/test_streams_tenant/2025/07/13/modify_COMPRA_ID_TIMESTAMP.json ./test_modificacion.json
```

### 6. Test de Rendimiento

#### 6.1 Crear Múltiples Compras

```bash
# Script para crear múltiples compras
for i in {1..10}
do
  curl -X POST https://bi3zdo4r1c.execute-api.us-east-1.amazonaws.com/dev/compras/registrar \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer YOUR_TOKEN_HERE" \
    -d "{
      \"productos\": [
        {
          \"codigo\": \"STREAM_TEST_001\",
          \"cantidad\": $i
        }
      ]
    }"
  echo "Compra $i enviada"
  sleep 1
done
```

#### 6.2 Verificar Procesamiento en Lote

```powershell
# Ver métricas de lambda
aws cloudwatch get-metric-statistics \
  --namespace AWS/Lambda \
  --metric-name Invocations \
  --dimensions Name=FunctionName,Value=lambdas-streams-actualizador-compras-dev-actualizarComprasStream \
  --start-time 2025-07-13T00:00:00Z \
  --end-time 2025-07-13T23:59:59Z \
  --period 300 \
  --statistics Sum

# Contar archivos generados
aws s3 ls s3://dev-compras-backup-s3-bucket/compras/test_streams_tenant/2025/07/13/ --recursive | wc -l
```

### 7. Test de Errores y Recuperación

#### 7.1 Simular Error de Procesamiento

```python
# Evento malformado para testing
import json
import boto3

lambda_client = boto3.client('lambda')

# Evento inválido
malformed_event = {
    "Records": [
        {
            "eventID": "test-error",
            "eventName": "INSERT",
            "eventSource": "aws:dynamodb",
            "dynamodb": {
                "NewImage": {
                    # Datos incompletos para provocar error
                    "compra_id": {"S": "error-test"}
                }
            }
        }
    ]
}

# Invocar lambda con evento malformado
response = lambda_client.invoke(
    FunctionName='lambdas-streams-actualizador-compras-dev-actualizarComprasStream',
    Payload=json.dumps(malformed_event)
)

print(json.loads(response['Payload'].read()))
```

#### 7.2 Verificar Manejo de Errores

```powershell
# Buscar errores en logs
serverless logs -f actualizarComprasStream --filter "ERROR" --count 10

# Verificar archivos de error
aws s3 ls s3://dev-compras-backup-s3-bucket/compras/error/ --recursive
```

### 8. Test de Reportes

#### 8.1 Generar Reporte de Prueba

```bash
# Invocar función de reporte
curl -X POST [URL_DEL_REPORTE_LAMBDA] \
  -H "Content-Type: application/json" \
  -d '{
    "tenant_id": "test_streams_tenant",
    "report_type": "general"
  }'
```

### 9. Validación de Integridad

#### 9.1 Script de Validación

```python
# Script para validar integridad de datos
import boto3
import json
from datetime import datetime

def validate_stream_processing():
    # Conectar a DynamoDB
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('dev-t_MS3_compras')
    
    # Conectar a S3
    s3_client = boto3.client('s3')
    
    # Obtener compras de DynamoDB
    response = table.scan()
    dynamodb_compras = response['Items']
    
    # Obtener archivos de S3
    s3_response = s3_client.list_objects_v2(
        Bucket='dev-compras-backup-s3-bucket',
        Prefix='compras/test_streams_tenant/'
    )
    
    s3_files = s3_response.get('Contents', [])
    
    print(f"Compras en DynamoDB: {len(dynamodb_compras)}")
    print(f"Archivos en S3: {len(s3_files)}")
    
    # Validar que cada compra tenga su archivo
    for compra in dynamodb_compras:
        compra_id = compra['compra_id']
        found_file = False
        
        for file in s3_files:
            if compra_id in file['Key']:
                found_file = True
                break
        
        if not found_file:
            print(f"⚠️  Compra {compra_id} no tiene archivo en S3")
        else:
            print(f"✅ Compra {compra_id} procesada correctamente")

if __name__ == "__main__":
    validate_stream_processing()
```

### 10. Limpieza de Datos de Prueba

```powershell
# Eliminar archivos de prueba de S3
aws s3 rm s3://dev-compras-backup-s3-bucket/compras/test_streams_tenant/ --recursive

# Eliminar compras de prueba de DynamoDB
aws dynamodb scan --table-name dev-t_MS3_compras --filter-expression "tenant_id = :tenant" --expression-attribute-values '{":tenant":{"S":"test_streams_tenant"}}' --query "Items[].compra_id.S" --output text | xargs -I {} aws dynamodb delete-item --table-name dev-t_MS3_compras --key '{"compra_id":{"S":"{}"}}'

# Eliminar productos de prueba (MS2)
curl -X DELETE https://d3fhew8l8b.execute-api.us-east-1.amazonaws.com/dev/productos/eliminar \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "codigo": "STREAM_TEST_001"
  }'
```

## 📊 Resultados Esperados

### Métricas de Éxito
- **Latencia**: < 5 segundos desde compra hasta archivo en S3
- **Throughput**: Capaz de procesar 100+ compras por minuto
- **Confiabilidad**: 99.9% de compras procesadas exitosamente
- **Integridad**: Todos los datos críticos preservados

### Indicadores de Funcionamiento Correcto
- ✅ Logs sin errores críticos
- ✅ Archivos JSON bien formateados
- ✅ Estructura de carpetas correcta en S3
- ✅ Metadatos completos en archivos
- ✅ Tiempos de procesamiento aceptables

---

**Fecha de prueba**: Julio 13, 2025
**Versión del sistema**: 1.0.0
**Ambiente**: Desarrollo (dev)
