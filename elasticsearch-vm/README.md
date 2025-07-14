# 🔍 SISTEMA ELASTICSEARCH MULTI-TENANT CON LAMBDA

## 📋 **DESCRIPCIÓN**
Sistema completo de ElasticSearch multi-tenant implementado con **Serverless Framework** que sincroniza productos desde DynamoDB Streams hacia contenedores ElasticSearch dedicados por tenant.

**Estado**: ✅ **OPERACIONAL** - Sistema completamente funcional y desplegado

## 🌐 **INFORMACIÓN DEL SISTEMA ACTUAL**

### **Instancia EC2 Activa**
- **Instance ID**: `i-064c00d9c69e9193a`
- **IP Pública**: `35.171.228.165`
- **Tipo**: t3.medium Ubuntu 22.04

### **Lambda Desplegado**
- **ARN**: `arn:aws:lambda:us-east-1:254780740814:function:elasticsearch-vm-system-dev-actualizarProductosElasticsearch`
- **Runtime**: Python 3.11
- **Estado**: Activo y procesando DynamoDB Streams

### **DynamoDB Stream**
- **ARN**: `arn:aws:dynamodb:us-east-1:254780740814:table/dev-t_MS2_productos/stream/2025-07-13T11:24:21.156`
- **Estado**: Conectado y sincronizando

## 🏗️ **ARQUITECTURA**

```
┌─────────────────────┐    ┌──────────────────────┐    ┌─────────────────────┐
│   DynamoDB MS2      │───▶│ Lambda Actualizar    │───▶│   EC2 VM Ubuntu     │
│ dev-t_MS2_productos │    │   Productos ES       │    │   + Docker Compose  │
│     (Streams)       │    │                      │    │                     │
└─────────────────────┘    └──────────────────────┘    └─────────────────────┘
                                                                 │
                                                                 ▼
                                                ┌─────────────────────────────┐
                                                │ ElasticSearch Containers:   │
                                                │ • empresa_postman → :9200   │
                                                │ • utec → :9201              │
                                                │ • default → :9202           │
                                                │                             │
                                                │ Kibana Dashboards:          │
                                                │ • empresa_postman → :5601   │
                                                │ • utec → :5602              │
                                                │ • default → :5603           │
                                                └─────────────────────────────┘
```

## 🚀 **CARACTERÍSTICAS**

### ✅ **ElasticSearch Multi-Tenant**
- **1 contenedor ElasticSearch por tenant** con volúmenes persistentes
- **Puertos dedicados** por tenant (9200, 9201, 9202)
- **Clusters independientes** para aislamiento completo
- **APIs REST** habilitadas para cada tenant

### ✅ **Sincronización Automática**
- **DynamoDB Streams** de la tabla `dev-t_MS2_productos`
- **Lambda procesamiento** en tiempo real
- **Operaciones CRUD** completas (INSERT, MODIFY, REMOVE)
- **Manejo de errores** y reintentos

### ✅ **Visualización**
- **Kibana dedicado** por tenant
- **Dashboards independientes** para cada tenant
- **Análisis de productos** en tiempo real

## 📁 **ESTRUCTURA DEL PROYECTO**

```
elasticsearch-vm/
├── serverless.yml                           # Configuración Serverless Framework ✅
├── docker-compose.yml                       # Orquestación de contenedores ✅
├── requirements.txt                         # Dependencias Python ✅
├── package.json                            # Dependencias Node.js ✅
├── lambdas/
│   └── actualizar_productos_elasticsearch.py # Lambda principal ✅
├── README.md                               # Esta documentación ✅
├── INFORME_LAMBDA_ACTUALIZARPRODUCTOS.md   # Documentación técnica ✅
└── INFORME_LAMBDA_ACTUALIZARPRODUCTOS.txt  # Documentación para informe ✅
```

## ✅ **VALIDACIÓN DEL SISTEMA**

### **Tests Realizados**
- ✅ Creación de productos sincronizada
- ✅ Modificación de productos sincronizada
- ✅ Eliminación de productos sincronizada
- ✅ Aislamiento por tenant verificado
- ✅ APIs ElasticSearch respondiendo
- ✅ Kibana dashboards accesibles

### **Último Test Exitoso**
- **Producto**: `ES_TEST_1752467277`
- **Tenant**: `empresa_postman`
- **Fecha**: 2025-07-13
- **Resultado**: ✅ Sincronización completa DynamoDB → ElasticSearch

## 🔧 **CONFIGURACIÓN TÉCNICA**

### **ElasticSearch 8.14.0**
- **Memoria**: 1GB por contenedor
- **Seguridad**: Deshabilitada para desarrollo
- **Índices**: Configurados para productos con mappings en español
- **Volúmenes**: Persistentes por tenant

### **VM Ubuntu 22.04**
- **Tipo**: t3.medium
- **Docker**: Última versión estable
- **Docker Compose**: Orquestación de contenedores
- **Puertos**: 9200-9210 (ES) y 5601-5610 (Kibana)

### **Lambda Python 3.11**
- **Memoria**: 512MB
- **Timeout**: 15 minutos
- **Triggers**: DynamoDB Streams
- **Batch Size**: 10 registros

## 🎯 **ENDPOINTS OPERACIONALES**

### **ElasticSearch APIs (ACTIVOS)**
- **empresa_postman**: `http://35.171.228.165:9200` ✅
- **utec**: `http://35.171.228.165:9201` ✅
- **default**: `http://35.171.228.165:9202` ✅

### **Kibana Dashboards (ACTIVOS)**
- **empresa_postman**: `http://35.171.228.165:5601` ✅
- **utec**: `http://35.171.228.165:5602` ✅
- **default**: `http://35.171.228.165:5603` ✅

### **Health Check URLs**
```bash
# Verificar estado de ElasticSearch
curl http://35.171.228.165:9200/_cluster/health
curl http://35.171.228.165:9201/_cluster/health
curl http://35.171.228.165:9202/_cluster/health
```

## 📊 **MAPPING DE PRODUCTOS**

```json
{
  "mappings": {
    "properties": {
      "codigo": { "type": "keyword" },
      "nombre": { "type": "text", "analyzer": "spanish" },
      "descripcion": { "type": "text", "analyzer": "spanish" },
      "precio": { "type": "double" },
      "cantidad": { "type": "integer" },
      "categoria": { "type": "keyword" },
      "tenant_id": { "type": "keyword" },
      "user_id": { "type": "keyword" },
      "fechaCreacion": { "type": "date" },
      "fechaModificacion": { "type": "date" },
      "timestamp": { "type": "date" }
    }
  }
}
```

## 🔐 **SEGURIDAD**

### **Security Groups**
- **Security Group ID**: `sg-062e46fbd3dba0b11`
- **SSH**: Puerto 22 (para administración)
- **ElasticSearch**: Puertos 9200-9210
- **Kibana**: Puertos 5601-5610

### **IAM Permissions**
- **DynamoDB Streams**: Lectura de eventos
- **EC2**: Descripción de instancias
- **CloudWatch**: Logs del Lambda

## 🚀 **COMANDOS ÚTILES**

### **Verificar Estado del Sistema**
```bash
# Conectar a la VM
ssh -i tu-key.pem ubuntu@35.171.228.165

# Verificar contenedores Docker
sudo docker ps

# Verificar logs de contenedores
sudo docker logs elasticsearch-empresa_postman
sudo docker logs elasticsearch-utec
sudo docker logs elasticsearch-default

# Restart contenedores si es necesario
sudo docker-compose restart
```

### **Testing de APIs**
```bash
# Test básico ElasticSearch
curl -X GET "http://35.171.228.165:9200/_cluster/health?pretty"

# Buscar productos por tenant
curl -X GET "http://35.171.228.165:9200/productos/_search?q=tenant_id:empresa_postman"
```

## 🛠️ **OPERACIONES SOPORTADAS**

### **DynamoDB → ElasticSearch**
- **INSERT** → Index producto nuevo
- **MODIFY** → Update producto existente
- **REMOVE** → Delete producto

### **APIs REST ElasticSearch**
- **GET** `/productos/_search` - Buscar productos
- **POST** `/productos/_doc/{id}` - Crear producto
- **PUT** `/productos/_doc/{id}` - Actualizar producto
- **DELETE** `/productos/_doc/{id}` - Eliminar producto

## 📈 **MONITOREO**

### **CloudWatch Logs**
- **Log Group**: `/aws/lambda/elasticsearch-vm-system-dev-actualizarProductosElasticsearch`
- Logs detallados del Lambda
- Métricas de procesamiento
- Errores y excepciones

### **URLs de Monitoreo**
- **ElasticSearch Health**: `http://35.171.228.165:9200/_cluster/health`
- **Kibana Status**: `http://35.171.228.165:5601/api/status`
- **Container Stats**: `docker stats` en la VM

## 🔧 **CONFIGURACIÓN TÉCNICA ACTUAL**

### **ElasticSearch 8.14.0**
- **Memoria**: 1GB por contenedor
- **Seguridad**: Deshabilitada para desarrollo
- **Índices**: `productos` configurado para cada tenant
- **Volúmenes**: Persistentes por tenant

### **Docker Compose**
```yaml
# Configuración activa en producción
version: '3.8'
services:
  elasticsearch-empresa_postman:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.14.0
    ports: ["9200:9200"]
    environment:
      - cluster.name=elasticsearch-empresa_postman
      - discovery.type=single-node
      - xpack.security.enabled=false
    volumes:
      - es_data_empresa_postman:/usr/share/elasticsearch/data
```

### **Lambda Configuración**
- **Runtime**: Python 3.11
- **Memoria**: 512MB
- **Timeout**: 15 minutos
- **Triggers**: DynamoDB Streams
- **Batch Size**: 10 registros
- **Environment Variables**: Configuradas para todos los endpoints ElasticSearch

## 🔄 **FLUJO DE DATOS OPERACIONAL**

1. **Producto creado/modificado** en MS2 (DynamoDB `dev-t_MS2_productos`)
2. **DynamoDB Stream** genera evento automáticamente
3. **Lambda `elasticsearch-vm-system-dev-actualizarProductosElasticsearch`** procesa evento
4. **ElasticSearch indexa** producto en tenant correspondiente (puerto específico)
5. **Kibana visualiza** datos actualizados en tiempo real

## 📋 **LOGS Y DEBUGGING**

### **Logs del Lambda**
```bash
# Ver logs en tiempo real
aws logs tail /aws/lambda/elasticsearch-vm-system-dev-actualizarProductosElasticsearch --follow
```

### **Logs de Docker**
```bash
# En la VM (35.171.228.165)
sudo docker logs -f elasticsearch-empresa_postman
sudo docker logs -f elasticsearch-utec
sudo docker logs -f elasticsearch-default
```

### **Logs Estructurados**
```python
# Formato de logs del Lambda
logger.info(f"✅ Producto {product_id} indexado exitosamente en {endpoint}")
logger.error(f"❌ Error indexando producto {product_id}: {error}")
logger.warning(f"⚠️ ElasticSearch no disponible en {endpoint}")
```

## 🎯 **CASOS DE USO VALIDADOS**

### **Búsqueda de Productos**
- ✅ Full-text search en nombres y descripciones
- ✅ Filtros por categoría, precio, stock
- ✅ Búsqueda por tenant específico

### **Analytics en Tiempo Real**
- ✅ Análisis de inventario por tenant
- ✅ Tendencias de productos
- ✅ Métricas de rendimiento

### **Sincronización Multi-Sistema**
- ✅ Consistencia entre DynamoDB y ElasticSearch
- ✅ Recuperación automática de fallos
- ✅ Procesamiento por lotes

---

## 📝 **DOCUMENTACIÓN ADICIONAL**

- **Informe Técnico**: `INFORME_LAMBDA_ACTUALIZARPRODUCTOS.md`
- **Versión TXT**: `INFORME_LAMBDA_ACTUALIZARPRODUCTOS.txt`
- **Configuración**: `serverless.yml` y `docker-compose.yml`

## 🚨 **ESTADO ACTUAL**

✅ **SISTEMA COMPLETAMENTE OPERACIONAL**
- VM ejecutándose: `i-064c00d9c69e9193a`
- Lambda procesando: DynamoDB Streams → ElasticSearch
- 3 contenedores ElasticSearch activos
- 3 dashboards Kibana disponibles
- Sincronización CRUD validada
