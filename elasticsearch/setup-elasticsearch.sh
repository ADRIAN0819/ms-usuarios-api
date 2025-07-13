#!/bin/bash

# Script para configurar ElasticSearch Multi-Tenant
echo "🚀 Configurando ElasticSearch Multi-Tenant..."

# 1. Crear directorio de trabajo
mkdir -p /home/ubuntu/elasticsearch-multi-tenant
cd /home/ubuntu/elasticsearch-multi-tenant

# 2. Instalar Docker si no está instalado
if ! command -v docker &> /dev/null; then
    echo "📦 Instalando Docker..."
    sudo apt update
    sudo apt install -y docker.io docker-compose
    sudo systemctl start docker
    sudo systemctl enable docker
    sudo usermod -aG docker ubuntu
fi

# 3. Configurar límites del sistema para ElasticSearch
echo "⚙️ Configurando límites del sistema..."
echo 'vm.max_map_count=262144' | sudo tee -a /etc/sysctl.conf
sudo sysctl -p

# 4. Crear el docker-compose.yml
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  # ElasticSearch para tenant empresa_postman
  elasticsearch-empresa-postman:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.11.0
    container_name: es-empresa-postman
    environment:
      - node.name=es-empresa-postman
      - cluster.name=empresa-postman-cluster
      - discovery.type=single-node
      - bootstrap.memory_lock=true
      - "ES_JAVA_OPTS=-Xms1g -Xmx1g"
      - xpack.security.enabled=false
      - xpack.security.enrollment.enabled=false
    ulimits:
      memlock:
        soft: -1
        hard: -1
    volumes:
      - es-data-empresa-postman:/usr/share/elasticsearch/data
    ports:
      - "9200:9200"
      - "9300:9300"
    networks:
      - elastic-network
    restart: unless-stopped

  # ElasticSearch para tenant empresa_test
  elasticsearch-empresa-test:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.11.0
    container_name: es-empresa-test
    environment:
      - node.name=es-empresa-test
      - cluster.name=empresa-test-cluster
      - discovery.type=single-node
      - bootstrap.memory_lock=true
      - "ES_JAVA_OPTS=-Xms1g -Xmx1g"
      - xpack.security.enabled=false
      - xpack.security.enrollment.enabled=false
    ulimits:
      memlock:
        soft: -1
        hard: -1
    volumes:
      - es-data-empresa-test:/usr/share/elasticsearch/data
    ports:
      - "9201:9200"
      - "9301:9300"
    networks:
      - elastic-network
    restart: unless-stopped

  # Kibana para visualización
  kibana:
    image: docker.elastic.co/kibana/kibana:8.11.0
    container_name: kibana
    ports:
      - "5601:5601"
    environment:
      - ELASTICSEARCH_HOSTS=http://elasticsearch-empresa-postman:9200
    networks:
      - elastic-network
    depends_on:
      - elasticsearch-empresa-postman
    restart: unless-stopped

volumes:
  es-data-empresa-postman:
    driver: local
  es-data-empresa-test:
    driver: local

networks:
  elastic-network:
    driver: bridge
EOF

# 5. Iniciar los contenedores
echo "🔥 Iniciando contenedores ElasticSearch..."
docker-compose up -d

# 6. Esperar a que ElasticSearch esté listo
echo "⏳ Esperando a que ElasticSearch esté listo..."
sleep 60

# 7. Verificar estado
echo "✅ Verificando estado de los contenedores..."
docker-compose ps

# 8. Crear índices iniciales para cada tenant
echo "📋 Creando índices iniciales..."

# Índice para productos del tenant empresa_postman
curl -X PUT "localhost:9200/productos-empresa-postman" -H 'Content-Type: application/json' -d'
{
  "mappings": {
    "properties": {
      "codigo": { "type": "keyword" },
      "nombre": { "type": "text", "analyzer": "standard" },
      "descripcion": { "type": "text", "analyzer": "standard" },
      "precio": { "type": "double" },
      "cantidad": { "type": "integer" },
      "categoria": { "type": "keyword" },
      "tenant_id": { "type": "keyword" },
      "fecha_creacion": { "type": "date" }
    }
  }
}'

# Índice para compras del tenant empresa_postman
curl -X PUT "localhost:9200/compras-empresa-postman" -H 'Content-Type: application/json' -d'
{
  "mappings": {
    "properties": {
      "compra_id": { "type": "keyword" },
      "user_id": { "type": "keyword" },
      "productos": { "type": "nested" },
      "total": { "type": "double" },
      "fecha": { "type": "date" },
      "tenant_id": { "type": "keyword" }
    }
  }
}'

# Índice para productos del tenant empresa_test
curl -X PUT "localhost:9201/productos-empresa-test" -H 'Content-Type: application/json' -d'
{
  "mappings": {
    "properties": {
      "codigo": { "type": "keyword" },
      "nombre": { "type": "text", "analyzer": "standard" },
      "descripcion": { "type": "text", "analyzer": "standard" },
      "precio": { "type": "double" },
      "cantidad": { "type": "integer" },
      "categoria": { "type": "keyword" },
      "tenant_id": { "type": "keyword" },
      "fecha_creacion": { "type": "date" }
    }
  }
}'

echo "🎉 ¡Configuración completada!"
echo "📊 ElasticSearch URLs:"
echo "  - Tenant empresa_postman: http://localhost:9200"
echo "  - Tenant empresa_test: http://localhost:9201"
echo "  - Kibana: http://localhost:5601"
echo ""
echo "🧪 Comandos de prueba:"
echo "curl http://localhost:9200/_cluster/health"
echo "curl http://localhost:9201/_cluster/health"
