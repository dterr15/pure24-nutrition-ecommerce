#!/bin/bash

# FASE 6.4: Setup Automático - Deploy Cloudflare Pages
# Uso: ./scripts/fase-6-4-setup.sh
# Este script automatiza PASOS 1-4 del checklist

set -e

echo "=================================="
echo "FASE 6.4: Setup Deploy Automático"
echo "=================================="
echo ""

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ============================================
# PASO 1: Verificar y guardar Deploy Hook URL
# ============================================
echo -e "${BLUE}PASO 1: Verificar Deploy Hook URL${NC}"
echo "---"

read -p "Ingresa Deploy Hook URL de Cloudflare Pages (sin quotes): " CF_DEPLOY_HOOK_URL

if [[ ! "$CF_DEPLOY_HOOK_URL" =~ ^https://api\.cloudflare\.com ]]; then
  echo -e "${YELLOW}⚠️  URL no parece válida (debe empezar con https://api.cloudflare.com)${NC}"
  exit 1
fi

echo -e "${GREEN}✅ URL válida${NC}"
echo "URL: $CF_DEPLOY_HOOK_URL"
echo ""

# ============================================
# PASO 2: Crear tabla deploy_events en SQL
# ============================================
echo -e "${BLUE}PASO 2: Crear tabla deploy_events${NC}"
echo "---"

read -p "¿Está PostgreSQL corriendo en Docker? (y/n): " USE_DOCKER

if [[ "$USE_DOCKER" == "y" ]]; then
  echo "Ejecutando SQL en PostgreSQL Docker..."
  docker exec -it postgres psql -U postgres -d pure24 < scripts/create-deploy-events-table.sql
  echo -e "${GREEN}✅ Tabla creada${NC}"
else
  echo "Ejecuta manualmente:"
  echo "psql -U postgres -d pure24 < scripts/create-deploy-events-table.sql"
fi
echo ""

# ============================================
# PASO 3: Actualizar .env
# ============================================
echo -e "${BLUE}PASO 3: Actualizar .env${NC}"
echo "---"

if grep -q "CF_DEPLOY_HOOK_URL" .env; then
  echo "Actualizando valor existente..."
  sed -i.bak "s|CF_DEPLOY_HOOK_URL=.*|CF_DEPLOY_HOOK_URL=\"$CF_DEPLOY_HOOK_URL\"|" .env
else
  echo "Agregando variable a .env..."
  echo "" >> .env
  echo "# FASE 6.4: Deploy Automático" >> .env
  echo "CF_DEPLOY_HOOK_URL=\"$CF_DEPLOY_HOOK_URL\"" >> .env
fi

echo -e "${GREEN}✅ .env actualizado${NC}"
echo ""

# ============================================
# PASO 4: Verificar n8n accesible
# ============================================
echo -e "${BLUE}PASO 4: Verificar n8n accesible${NC}"
echo "---"

read -p "Ingresa URL de n8n (ej: http://localhost:5678 o https://n8n.tudominio.com): " N8N_URL

if curl -s "$N8N_URL/api/v1/workflows" > /dev/null 2>&1; then
  echo -e "${GREEN}✅ n8n está accesible${NC}"
else
  echo -e "${YELLOW}⚠️  No se puede alcanzar n8n en $N8N_URL${NC}"
  echo "Continúa manualmente con PASO 5 en la UI de n8n"
fi
echo ""

# ============================================
# Resumen
# ============================================
echo -e "${GREEN}=================================="
echo "✅ PASOS 1-4 COMPLETADOS"
echo "==================================${NC}"
echo ""
echo "Próximos pasos:"
echo "1. Abre FASE_6_4_CHECKLIST_PASO_A_PASO.md"
echo "2. Continúa con PASO 5: Importar workflow en n8n"
echo ""
echo "Valores guardados:"
echo "  .env → CF_DEPLOY_HOOK_URL"
echo "  Deploy table → deploy_events"
echo ""
