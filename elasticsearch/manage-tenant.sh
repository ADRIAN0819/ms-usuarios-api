#!/bin/bash

# Script para gestionar contenedores ElasticSearch por tenant
TENANT_ID=$1
ACTION=$2
BASE_PORT_ES=9200
BASE_PORT_TRANSPORT=9300

if [ -z "$TENANT_ID" ] || [ -z "$ACTION" ]; then
    echo "Uso: $0 <tenant_id> <create|start|stop|remove|status>"
    echo "Ejemplo: $0 empresa_nueva create"
    exit 1
fi

# Función para obtener el siguiente puerto disponible
get_next_port() {
    local base_port=$1
    local port=$base_port
    
    while netstat -ln | grep -q ":$port "; do
        ((port++))
    done
    
    echo $port
}

# Función para crear un nuevo tenant ElasticSearch
create_tenant() {
    local tenant=$1
    local es_port=$(get_next_port $BASE_PORT_ES)
    local transport_port=$(get_next_port $BASE_PORT_TRANSPORT)
    
    echo "🚀 Creando ElasticSearch para tenant: $tenant"
    echo "📡 Puerto ES: $es_port, Puerto Transport: $transport_port"
    
    # Crear contenedor ElasticSearch para el tenant
    docker run -d \
        --name "es-$tenant" \
        --network elastic-network \
        -p "$es_port:9200" \
        -p "$transport_port:9300" \
        -e "node.name=es-$tenant" \
        -e "cluster.name=$tenant-cluster" \
        -e "discovery.type=single-node" \
        -e "bootstrap.memory_lock=true" \
        -e "ES_JAVA_OPTS=-Xms512m -Xmx512m" \
        -e "xpack.security.enabled=false" \
        -e "xpack.security.enrollment.enabled=false" \
        --ulimit memlock=-1:-1 \
        -v "es-data-$tenant:/usr/share/elasticsearch/data" \
        --restart unless-stopped \
        docker.elastic.co/elasticsearch/elasticsearch:8.11.0
    
    # Esperar a que esté listo
    echo "⏳ Esperando a que ElasticSearch esté listo..."
    sleep 30
    
    # Crear índices para el tenant
    create_indices $tenant $es_port
    
    echo "✅ Tenant $tenant creado exitosamente en puerto $es_port"
}

# Función para crear índices iniciales
create_indices() {
    local tenant=$1
    local port=$2
    
    echo "📋 Creando índices para tenant $tenant..."
    
    # Índice para productos
    curl -X PUT "localhost:$port/productos-$tenant" -H 'Content-Type: application/json' -d'{
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
    
    # Índice para compras
    curl -X PUT "localhost:$port/compras-$tenant" -H 'Content-Type: application/json' -d'{
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
    
    echo "✅ Índices creados para tenant $tenant"
}

# Función para obtener el puerto de un tenant
get_tenant_port() {
    local tenant=$1
    docker port "es-$tenant" 9200/tcp 2>/dev/null | cut -d: -f2
}

# Función para mostrar estado
show_status() {
    local tenant=$1
    local container_name="es-$tenant"
    
    if docker ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -q "$container_name"; then
        echo "📊 Estado del tenant $tenant:"
        docker ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep "$container_name"
        
        local port=$(get_tenant_port $tenant)
        if [ ! -z "$port" ]; then
            echo "🔗 URL: http://localhost:$port"
            echo "🧪 Test: curl http://localhost:$port/_cluster/health"
        fi
    else
        echo "❌ Tenant $tenant no encontrado"
    fi
}

# Ejecutar acción
case $ACTION in
    "create")
        # Crear red si no existe
        docker network create elastic-network 2>/dev/null || true
        create_tenant $TENANT_ID
        ;;
    "start")
        docker start "es-$TENANT_ID"
        echo "✅ Tenant $TENANT_ID iniciado"
        ;;
    "stop")
        docker stop "es-$TENANT_ID"
        echo "⏹️ Tenant $TENANT_ID detenido"
        ;;
    "remove")
        docker stop "es-$TENANT_ID" 2>/dev/null || true
        docker rm "es-$TENANT_ID" 2>/dev/null || true
        docker volume rm "es-data-$TENANT_ID" 2>/dev/null || true
        echo "🗑️ Tenant $TENANT_ID eliminado"
        ;;
    "status")
        show_status $TENANT_ID
        ;;
    *)
        echo "❌ Acción no válida: $ACTION"
        echo "Acciones disponibles: create, start, stop, remove, status"
        exit 1
        ;;
esac
