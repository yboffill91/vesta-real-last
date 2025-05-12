#!/bin/bash

# Colores para mejor visualización
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Verificando entorno de Docker ===${NC}"

# Comprobar si Docker está instalado
if command -v docker &> /dev/null; then
    echo -e "${GREEN}✓ Docker está instalado${NC}"
else
    echo -e "${RED}✗ Docker no está instalado${NC}"
    exit 1
fi

# Comprobar si Docker Compose está instalado
if command -v docker compose &> /dev/null; then
    echo -e "${GREEN}✓ Docker Compose está instalado${NC}"
else
    echo -e "${RED}✗ Docker Compose no está instalado${NC}"
    exit 1
fi

# Validar archivos de Docker Compose
echo -e "\n${YELLOW}=== Validando archivos de configuración ===${NC}"

echo -e "Validando docker-compose.yml (desarrollo)..."
docker compose -f docker-compose.yml config > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Archivo de configuración de desarrollo válido${NC}"
else
    echo -e "${RED}✗ Error en archivo de configuración de desarrollo${NC}"
    docker compose -f docker-compose.yml config
fi

echo -e "\nValidando docker-compose.prod.yml (producción)..."
docker compose -f docker-compose.prod.yml config > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Archivo de configuración de producción válido${NC}"
else
    echo -e "${RED}✗ Error en archivo de configuración de producción${NC}"
    docker compose -f docker-compose.prod.yml config
fi

echo -e "\n${YELLOW}=== Información de configuración ===${NC}"
echo -e "${GREEN}Para iniciar el entorno de DESARROLLO:${NC}"
echo -e "  docker compose up -d"
echo -e "  - Inicia: backend, base de datos MySQL y phpMyAdmin"
echo -e "  - Acceso Backend: http://localhost:8000"
echo -e "  - Acceso phpMyAdmin: http://localhost:8080"

echo -e "\n${GREEN}Para iniciar el entorno de PRODUCCIÓN:${NC}"
echo -e "  docker compose -f docker-compose.prod.yml up -d"
echo -e "  - Inicia: backend y base de datos MySQL"
echo -e "  - Acceso Backend: http://localhost:8000"

echo -e "\n${YELLOW}=== Estado de la base de datos ===${NC}"
echo -e "Para verificar el estado de la base de datos de desarrollo:"
echo -e "  docker exec vestasys-mysql-dev mysqladmin -u\$MYSQL_USER -p\$MYSQL_PASSWORD ping"

echo -e "\nPara verificar el estado de la base de datos de producción:"
echo -e "  docker exec vestasys-mysql-prod mysqladmin -u\$MYSQL_USER -p\$MYSQL_PASSWORD ping"
