#!/usr/bin/env python3
"""
Script para verificar automáticamente el estado de ElasticSearch en la VM
"""

import subprocess
import time
import sys
import os

def run_ssh_command(command, timeout=30):
    """Ejecutar comando SSH y retornar resultado"""
    vm_ip = "35.171.228.165"
    
    # Verificar si existe la clave SSH
    ssh_key_paths = [
        os.path.expanduser("~/.ssh/labsuser.pem"),
        os.path.expanduser("~/.ssh/vockey.pem"), 
        os.path.expanduser("~/.ssh/id_rsa")
    ]
    
    ssh_key = None
    for key_path in ssh_key_paths:
        if os.path.exists(key_path):
            ssh_key = key_path
            break
    
    if not ssh_key:
        print("❌ No se encontró clave SSH")
        return None
    
    # Construir comando SSH
    ssh_cmd = [
        "ssh", 
        "-i", ssh_key,
        "-o", "StrictHostKeyChecking=no",
        "-o", "ConnectTimeout=10",
        f"ubuntu@{vm_ip}",
        command
    ]
    
    try:
        result = subprocess.run(
            ssh_cmd, 
            capture_output=True, 
            text=True, 
            timeout=timeout
        )
        
        if result.returncode == 0:
            return result.stdout.strip()
        else:
            return f"ERROR: {result.stderr.strip()}"
            
    except subprocess.TimeoutExpired:
        return "ERROR: Timeout conectando por SSH"
    except Exception as e:
        return f"ERROR: {str(e)}"

def check_vm_status():
    """Verificar estado general de la VM"""
    print("🖥️ VERIFICANDO ESTADO DE LA VM")
    print("="*50)
    
    # Verificar conectividad SSH
    uptime = run_ssh_command("uptime")
    if uptime and not uptime.startswith("ERROR"):
        print(f"✅ SSH conectado exitosamente")
        print(f"📊 Uptime: {uptime}")
    else:
        print(f"❌ Error SSH: {uptime}")
        return False
    
    # Verificar memoria
    memory = run_ssh_command("free -h")
    if memory and not memory.startswith("ERROR"):
        print(f"💾 Memoria disponible:")
        for line in memory.split('\n')[:3]:
            print(f"   {line}")
    
    # Verificar espacio en disco
    disk = run_ssh_command("df -h /")
    if disk and not disk.startswith("ERROR"):
        print(f"💿 Espacio en disco:")
        for line in disk.split('\n')[:2]:
            print(f"   {line}")
    
    return True

def check_docker_status():
    """Verificar estado de Docker"""
    print("\n🐳 VERIFICANDO DOCKER")
    print("="*50)
    
    # Verificar si Docker está instalado
    docker_version = run_ssh_command("docker --version")
    if docker_version and not docker_version.startswith("ERROR"):
        print(f"✅ Docker instalado: {docker_version}")
    else:
        print(f"❌ Docker no instalado: {docker_version}")
        return False
    
    # Verificar si Docker está corriendo
    docker_status = run_ssh_command("sudo systemctl is-active docker")
    if docker_status == "active":
        print(f"✅ Docker service activo")
    else:
        print(f"❌ Docker service: {docker_status}")
        return False
    
    # Verificar contenedores
    containers = run_ssh_command("sudo docker ps -a")
    if containers and not containers.startswith("ERROR"):
        print(f"📋 Contenedores Docker:")
        for line in containers.split('\n')[:5]:
            print(f"   {line}")
    else:
        print(f"❌ Error listando contenedores: {containers}")
    
    return True

def check_elasticsearch_containers():
    """Verificar contenedores de ElasticSearch específicamente"""
    print("\n🔍 VERIFICANDO CONTENEDORES ELASTICSEARCH")
    print("="*50)
    
    containers = ["es-empresa-postman", "es-utec", "es-default"]
    
    for container in containers:
        # Verificar si el contenedor existe
        status = run_ssh_command(f"sudo docker inspect {container} --format '{{{{.State.Status}}}}'")
        
        if status and not status.startswith("ERROR"):
            print(f"✅ {container}: {status}")
            
            # Si está corriendo, verificar logs
            if status == "running":
                logs = run_ssh_command(f"sudo docker logs {container} 2>&1 | tail -5")
                if logs and not logs.startswith("ERROR"):
                    print(f"   📜 Últimos logs:")
                    for line in logs.split('\n')[:3]:
                        if line.strip():
                            print(f"      {line.strip()}")
        else:
            print(f"❌ {container}: No encontrado")

def check_network_ports():
    """Verificar puertos de red"""
    print("\n🔌 VERIFICANDO PUERTOS")
    print("="*50)
    
    # Verificar puertos abiertos
    netstat = run_ssh_command("sudo netstat -tlnp | grep -E ':(9200|9201|9202|5601|5602|5603)'")
    
    if netstat and not netstat.startswith("ERROR") and netstat.strip():
        print(f"✅ Puertos abiertos:")
        for line in netstat.split('\n'):
            if line.strip():
                print(f"   {line.strip()}")
    else:
        print(f"❌ No se encontraron puertos abiertos")
    
    # Verificar procesos Java (ElasticSearch)
    java_processes = run_ssh_command("ps aux | grep java | grep -v grep")
    if java_processes and not java_processes.startswith("ERROR") and java_processes.strip():
        print(f"☕ Procesos Java encontrados:")
        for line in java_processes.split('\n')[:3]:
            if line.strip():
                print(f"   {line.strip()[:80]}...")

def check_cloud_init_logs():
    """Verificar logs de cloud-init"""
    print("\n📜 VERIFICANDO LOGS DE CLOUD-INIT")
    print("="*50)
    
    # Verificar status de cloud-init
    cloud_init_status = run_ssh_command("sudo cloud-init status")
    if cloud_init_status and not cloud_init_status.startswith("ERROR"):
        print(f"🔄 Cloud-init status: {cloud_init_status}")
    
    # Verificar logs recientes
    logs = run_ssh_command("sudo cat /var/log/cloud-init-output.log | tail -20")
    if logs and not logs.startswith("ERROR"):
        print(f"📋 Últimos logs de cloud-init:")
        for line in logs.split('\n')[-10:]:
            if line.strip():
                print(f"   {line.strip()}")

def try_fix_elasticsearch():
    """Intentar arreglar ElasticSearch si no está corriendo"""
    print("\n🔧 INTENTANDO ARREGLAR ELASTICSEARCH")
    print("="*50)
    
    # Verificar si existe el directorio
    ls_result = run_ssh_command("ls -la /home/ubuntu/elasticsearch-cluster/")
    if ls_result and not ls_result.startswith("ERROR"):
        print(f"📁 Directorio elasticsearch-cluster existe")
        
        # Verificar docker-compose.yml
        compose_check = run_ssh_command("ls -la /home/ubuntu/elasticsearch-cluster/docker-compose.yml")
        if compose_check and not compose_check.startswith("ERROR"):
            print(f"📄 docker-compose.yml existe")
            
            # Intentar levantar los contenedores
            compose_up = run_ssh_command("cd /home/ubuntu/elasticsearch-cluster && sudo docker-compose up -d")
            if compose_up and not compose_up.startswith("ERROR"):
                print(f"🚀 Intentando levantar contenedores:")
                print(f"   {compose_up}")
            else:
                print(f"❌ Error levantando contenedores: {compose_up}")
        else:
            print(f"❌ docker-compose.yml no existe")
    else:
        print(f"❌ Directorio no existe: {ls_result}")

if __name__ == "__main__":
    print("🚀 VERIFICACIÓN AUTOMÁTICA DE ELASTICSEARCH")
    print("="*60)
    
    if not check_vm_status():
        print("\n❌ No se pudo conectar a la VM")
        sys.exit(1)
    
    if not check_docker_status():
        print("\n❌ Docker no está funcionando correctamente")
    
    check_elasticsearch_containers()
    check_network_ports()
    check_cloud_init_logs()
    try_fix_elasticsearch()
    
    print("\n🎯 RESUMEN FINAL")
    print("="*60)
    print("Si ElasticSearch no está corriendo:")
    print("1. Conectar por SSH: ssh -i ~/.ssh/labsuser.pem ubuntu@35.171.228.165")
    print("2. Verificar logs: sudo docker logs es-empresa-postman")
    print("3. Reintentar: cd /home/ubuntu/elasticsearch-cluster && sudo docker-compose up -d")
    print("4. Verificar puertos: sudo netstat -tlnp | grep 9200")
