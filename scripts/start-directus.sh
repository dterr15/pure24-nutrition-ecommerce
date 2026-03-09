#!/bin/bash

# Script para iniciar Directus con Docker Compose
# Uso: bash scripts/start-directus.sh

set -e

echo "🚀 Iniciando Directus..."
echo "================================"

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar que Docker está corriendo
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker no está corriendo. Por favor inicia Docker.${NC}"
    exit 1
fi

echo -e "${YELLOW}✓ Docker está disponible${NC}"

# Verificar que .env existe
if [ ! -f .env ]; then
    echo -e "${RED}❌ Archivo .env no encontrado${NC}"
    exit 1
fi

echo -e "${YELLOW}✓ Archivo .env encontrado${NC}"

# Cargar variables del .env
export $(cat .env | grep -v '^#' | xargs)

# Verificar que tenemos las credenciales de Directus
if [ -z "$DIRECTUS_ADMIN_EMAIL" ] || [ -z "$DIRECTUS_ADMIN_PASSWORD" ]; then
    echo -e "${RED}❌ DIRECTUS_ADMIN_EMAIL o DIRECTUS_ADMIN_PASSWORD no están configurados${NC}"
    exit 1
fi

echo -e "${YELLOW}✓ Credenciales de Directus encontradas${NC}"

# Iniciar contenedores
echo ""
echo "📦 Iniciando contenedores Docker..."
docker-compose up -d

# Esperar a que Directus esté listo
echo ""
echo "⏳ Esperando a que Directus esté listo..."
sleep 5

# Test de conexión
HEALTH_CHECK=$(curl -s -w "%{http_code}" -o /dev/null http://localhost:8055/server/health)

if [ "$HEALTH_CHECK" = "200" ]; then
    echo -e "${GREEN}✅ Directus está corriendo correctamente${NC}"
else
    echo -e "${YELLOW}⏳ Directus se está inicializando... (intenta en 10 segundos más)${NC}"
    sleep 10
fi

echo ""
echo "================================"
echo -e "${GREEN}🎉 DIRECTUS INICIADO EXITOSAMENTE${NC}"
echo "================================"
echo ""
echo "📊 Información:"
echo "   URL: http://localhost:8055"
echo "   Email: $DIRECTUS_ADMIN_EMAIL"
echo "   Password: (desde tu .env)"
echo ""
echo "🔗 API:"
echo "   REST API: http://localhost:8055/graphql"
echo "   GraphQL API: http://localhost:8055/graphql"
echo ""
echo "💾 Database:"
echo "   Host: localhost:5432"
echo "   User: directus"
echo "   Database: directus"
echo ""
echo "📝 Próximos pasos:"
echo "   1. Abre http://localhost:8055 en tu navegador"
echo "   2. Inicia sesión con tus credenciales"
echo "   3. Genera un API Token en Configuración > Tokens API"
echo "   4. Copia el token al .env (DIRECTUS_API_TOKEN)"
echo ""
echo "❌ Para detener:"
echo "   docker-compose down"
echo ""
echo "📋 Para ver logs:"
echo "   docker-compose logs -f directus"
