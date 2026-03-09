#!/bin/bash
# ============================================================================
# PURE 24 NUTRITION — SETUP AUTOMATIZADO FASE 0
# ============================================================================
# Uso: bash scripts/setup.sh
# Automatiza: estructura, credenciales, validación, Docker
# ============================================================================
set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Banner
clear
cat << "EOF"
╔════════════════════════════════════════════════════════════════════════════╗
║                                                                            ║
║  PURE 24 NUTRITION — E-COMMERCE AI-NATIVE                                 ║
║  SETUP AUTOMATIZADO FASE 0                                                ║
║                                                                            ║
║  Este script prepara el entorno para desarrollo                           ║
║  Duración estimada: 5 minutos                                             ║
║                                                                            ║
╚════════════════════════════════════════════════════════════════════════════╝
EOF
echo ""

# ============================================================================
# PASO 1: VALIDAR REQUISITOS
# ============================================================================
echo -e "${BLUE}[1/5] Validando requisitos previos${NC}"
echo ""

# Check Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}✗ Docker no está instalado${NC}"
    echo "  Descargar desde: https://www.docker.com/products/docker-desktop"
    exit 1
fi
DOCKER_VERSION=$(docker --version)
echo -e "${GREEN}✓${NC} Docker instalado: $DOCKER_VERSION"

# Check Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}✗ Docker Compose no está instalado${NC}"
    exit 1
fi
DC_VERSION=$(docker-compose --version)
echo -e "${GREEN}✓${NC} Docker Compose instalado: $DC_VERSION"

echo ""

# ============================================================================
# PASO 2: VERIFICAR .env
# ============================================================================
echo -e "${BLUE}[2/5] Configurando variables de entorno${NC}"
echo ""

if [ ! -f .env ]; then
    echo -e "${RED}✗ Archivo .env no encontrado${NC}"
    echo "  Debes crear .env con las credenciales necesarias"
    echo ""
    echo "  Credenciales requeridas:"
    echo "  • Mercado Pago: VITE_PUBLIC_MP_PUBLIC_KEY, MP_ACCESS_TOKEN"
    echo "  • Google Analytics: VITE_PUBLIC_GA4_MEASUREMENT_ID, GA4_API_SECRET"
    echo "  • Cloudflare: CF_ACCOUNT_ID, CF_API_TOKEN, CF_ZONE_ID"
    echo "  • Directus: DIRECTUS_ADMIN_EMAIL, DIRECTUS_ADMIN_PASSWORD"
    echo ""
    exit 1
else
    echo -e "${GREEN}✓${NC} Archivo .env encontrado"
fi

echo ""

# ============================================================================
# PASO 3: VALIDAR CREDENCIALES
# ============================================================================
echo -e "${BLUE}[3/5] Validando credenciales${NC}"
echo ""

if [ -f scripts/validate-config.sh ]; then
    bash scripts/validate-config.sh
else
    echo -e "${YELLOW}⚠${NC} Script de validación no encontrado (omitiendo)"
fi

echo ""

# ============================================================================
# PASO 4: VERIFICAR DOCKER DAEMON
# ============================================================================
echo -e "${BLUE}[4/5] Verificando Docker daemon${NC}"
echo ""

if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}✗ Docker daemon no está corriendo${NC}"
    echo "  Solución: Abre Docker Desktop y espera a que inicie"
    exit 1
fi
echo -e "${GREEN}✓${NC} Docker daemon está activo"

echo ""

# ============================================================================
# PASO 5: LEVANTAR SERVICIOS
# ============================================================================
echo -e "${BLUE}[5/5] Levantando servicios Docker${NC}"
echo ""

echo "Construyendo imágenes y levantando containers..."
echo "(Esto puede tomar 2-3 minutos en primera ejecución)"
echo ""

docker-compose up -d

# Wait for services to be ready
echo ""
echo "Esperando a que los servicios estén listos..."
sleep 15

# Health checks
echo ""
echo -e "${BLUE}Verificando servicios...${NC}"
echo ""

# PostgreSQL
if docker-compose exec postgres pg_isready -U directus > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} PostgreSQL está activo (localhost:5433)"
else
    echo -e "${RED}✗${NC} PostgreSQL NO responde"
fi

# Directus
if curl -s http://localhost:8055/server/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Directus está activo (http://localhost:8055)"
else
    echo -e "${YELLOW}⚠${NC} Directus aún se está levantando (esperar 30 segundos más)"
fi

# Redis
if docker-compose exec redis redis-cli ping > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Redis está activo (localhost:6379)"
else
    echo -e "${RED}✗${NC} Redis NO responde"
fi

echo ""

# ============================================================================
# RESUMEN FINAL
# ============================================================================
echo "========================================================================"
echo -e "${GREEN}✓ SETUP FASE 0 COMPLETADO${NC}"
echo "========================================================================"
echo ""
echo "Servicios activos:"
echo "  • PostgreSQL:    localhost:5433"
echo "  • Directus CMS:  http://localhost:8055"
echo "  • Redis:         localhost:6379"
echo ""
echo "Credenciales Directus:"
echo "  • Email: dt@sygnode.cl"
echo "  • Password: (ver en .env DIRECTUS_ADMIN_PASSWORD)"
echo ""
echo "Próximos pasos:"
echo ""
echo "1. Accede a Directus:"
echo "   http://localhost:8055/admin"
echo ""
echo "2. Completa el checklist de datos:"
echo "   /docs/00_data_collection_checklist.md"
echo ""
echo "3. Ver logs en tiempo real:"
echo "   docker-compose logs -f"
echo ""
echo "4. Detener servicios:"
echo "   docker-compose down"
echo ""
echo "========================================================================"
echo ""
echo -e "${YELLOW}Recordar:${NC}"
echo "• Nunca commitear .env (está en .gitignore)"
echo "• Credenciales se cargan desde .env en tiempo de ejecución"
echo "• Para debugging: docker-compose logs -f directus"
echo ""
echo "Ready! 🚀"
