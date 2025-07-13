# Guía para implementar ElasticSearch Multi-Tenant en AWS

## 📋 Pasos para EC2 + Docker

### 1. Crear EC2 Instance
```bash
# Tipo de instancia recomendado: t3.medium o superior
# Sistema operativo: Ubuntu 22.04 LTS
# Almacenamiento: 50GB gp3
# Security Groups: Abrir puertos 9200, 9201, 5601
```

### 2. Conectar a la instancia y ejecutar setup
```bash
# Conectar por SSH
ssh -i tu-key.pem ubuntu@tu-ec2-ip

# Copiar el archivo setup-elasticsearch.sh a la instancia
scp -i tu-key.pem setup-elasticsearch.sh ubuntu@tu-ec2-ip:/home/ubuntu/

# Ejecutar el setup
chmod +x setup-elasticsearch.sh
./setup-elasticsearch.sh
```

### 3. Configurar Security Groups
```bash
# Puertos a abrir:
# 9200 - ElasticSearch tenant empresa_postman
# 9201 - ElasticSearch tenant empresa_test  
# 5601 - Kibana
# 22   - SSH
```

## 🔧 Configuración Alternativa: Amazon OpenSearch Service

### Ventajas de OpenSearch Service:
- Totalmente administrado
- Escalabilidad automática
- Backups automáticos
- Monitoreo integrado

### Configuración:
```bash
# 1. Crear dominio OpenSearch por tenant
# 2. Configurar VPC y subnets
# 3. Configurar políticas de acceso
# 4. Configurar índices por tenant
```

## 🚀 APIs REST habilitadas

### ElasticSearch APIs disponibles:
- `GET /_cluster/health` - Estado del cluster
- `GET /productos-{tenant}/_search` - Buscar productos
- `POST /productos-{tenant}/_doc` - Indexar producto
- `GET /compras-{tenant}/_search` - Buscar compras
- `POST /compras-{tenant}/_doc` - Indexar compra

### Ejemplo de uso:
```bash
# Buscar productos por tenant
curl -X GET "http://tu-ec2-ip:9200/productos-empresa-postman/_search" \
  -H 'Content-Type: application/json' \
  -d '{"query": {"match_all": {}}}'

# Buscar con filtro
curl -X GET "http://tu-ec2-ip:9200/productos-empresa-postman/_search" \
  -H 'Content-Type: application/json' \
  -d '{"query": {"match": {"nombre": "laptop"}}}'
```

## 📊 Monitoreo

### Kibana Dashboard:
- URL: http://tu-ec2-ip:5601
- Crear visualizaciones por tenant
- Monitorear métricas de búsqueda

### Métricas importantes:
- Número de documentos por índice
- Tiempo de respuesta de queries
- Uso de memoria y CPU
- Espacio en disco

## 🔒 Seguridad

### Consideraciones:
- Usar VPC privada
- Configurar autenticación si es necesario
- Limitar acceso por IP
- Usar HTTPS en producción

## 📈 Escalabilidad

### Para crecer:
- Añadir más nodos al cluster
- Usar sharding por tenant
- Implementar balanceador de carga
- Configurar replicas para alta disponibilidad
