#!/bin/bash

# ============================================================================
# SCRIPT: migrate-to-enhanced.sh
# PURPOSE: Safely upgrade docker-compose to enhanced version with Redis
# ============================================================================

set -e

echo "🚀 PURE 24 NUTRITION - Docker Compose Upgrade"
echo "=============================================="
echo ""
echo "⚠️  Este script va a:"
echo "  1. Detener los contenedores actuales"
echo "  2. Actualizar a PostgreSQL con pgvector"
echo "  3. Agregar Redis para caching"
echo "  4. Reiniciar todos los servicios"
echo ""
echo "✅ TUS DATOS SERÁN PRESERVADOS (volúmenes no se borran)"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_step() {
    echo -e "${GREEN}→${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    print_error "docker-compose no encontrado. Por favor instálalo primero."
    exit 1
fi

# Check if docker is running
if ! docker ps &> /dev/null; then
    print_error "Docker no está corriendo. Por favor inicia Docker."
    exit 1
fi

read -p "¿Estás seguro de continuar? (s/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    print_warning "Operación cancelada"
    exit 0
fi

echo ""
print_step "Paso 1: Deteniendo contenedores actuales..."
docker-compose down --remove-orphans
echo "✓ Contenedores detenidos"

echo ""
print_step "Paso 2: Verificando volúmenes (datos seguros)..."
VOLUMES=$(docker volume ls -q | grep -E "postgres_data|directus|redis" || true)
if [ -n "$VOLUMES" ]; then
    echo "✓ Volúmenes encontrados:"
    echo "$VOLUMES" | sed 's/^/  - /'
else
    print_warning "No se encontraron volúmenes (primera ejecución)"
fi

echo ""
print_step "Paso 3: Iniciando nuevos contenedores..."
docker-compose up -d --wait

echo ""
print_step "Paso 4: Verificando salud de servicios..."

# Wait for PostgreSQL
echo -n "Esperando PostgreSQL..."
for i in {1..30}; do
    if docker-compose exec postgres pg_isready -U directus > /dev/null 2>&1; then
        echo -e " ${GREEN}✓${NC}"
        break
    fi
    echo -n "."
    sleep 2
done

# Wait for Directus
echo -n "Esperando Directus..."
for i in {1..30}; do
    if curl -s http://localhost:8055/server/health | grep -q "ok"; then
        echo -e " ${GREEN}✓${NC}"
        break
    fi
    echo -n "."
    sleep 2
done

# Wait for Redis
echo -n "Esperando Redis..."
for i in {1..30}; do
    if docker-compose exec redis redis-cli ping > /dev/null 2>&1; then
        echo -e " ${GREEN}✓${NC}"
        break
    fi
    echo -n "."
    sleep 2
done

echo ""
print_step "Paso 5: Ejecutando tests de validación..."

# Test 1: PostgreSQL
echo -n "Test PostgreSQL: "
if docker-compose exec postgres pg_isready -U directus > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
    exit 1
fi

# Test 2: Directus API
echo -n "Test Directus API: "
if curl -s http://localhost:8055/server/health | grep -q "ok"; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
    exit 1
fi

# Test 3: Redis
echo -n "Test Redis: "
if docker-compose exec redis redis-cli ping > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
    exit 1
fi

# Test 4: pgvector extension
echo -n "Test pgvector extension: "
if docker-compose exec postgres psql -U directus -d directus -c "CREATE EXTENSION IF NOT EXISTS vector;" > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC}"
else
    print_warning "pgvector no disponible (no crítico)"
fi

echo ""
echo "=============================================="
print_step "🎉 MIGRACIÓN COMPLETADA EXITOSAMENTE"
echo "=============================================="
echo ""
echo "📊 Status de Servicios:"
docker-compose ps
echo ""
echo "🔗 URLs:"
echo "  • Directus Admin: http://localhost:8055/admin"
echo "  • Directus API:   http://localhost:8055/rest"
echo "  • Redis Cache:    localhost:6379"
echo "  • PostgreSQL:     localhost:5433"
echo ""
echo "💡 Próximos pasos:"
echo "  1. Inicia sesión en Directus: http://localhost:8055"
echo "  2. Verifica que tus datos estén intactos"
echo "  3. El caché de Redis está listo para usar"
echo ""
