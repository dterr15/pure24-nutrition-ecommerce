#!/bin/bash

# FASE 6.4: Script de Test y Validación
# Uso: ./scripts/fase-6-4-test.sh
# Ejecuta los pasos 7-10: crea orden test, dispara webhook, valida deploys

set -e

echo "=================================="
echo "FASE 6.4: Test y Validación"
echo "=================================="
echo ""

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Cargar variables de .env
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
else
  echo -e "${RED}❌ .env no encontrado${NC}"
  exit 1
fi

# ============================================
# PASO 7: Crear orden de test
# ============================================
echo -e "${BLUE}PASO 7: Crear orden de test${NC}"
echo "---"

DIRECTUS_URL="${DIRECTUS_URL:-http://localhost:8055}"
DIRECTUS_API_KEY="${DIRECTUS_API_KEY}"

if [ -z "$DIRECTUS_API_KEY" ]; then
  read -p "Ingresa DIRECTUS_API_KEY: " DIRECTUS_API_KEY
fi

TEST_ORDER_ID=$(python3 -c "import uuid; print(str(uuid.uuid4()))")
TEST_SKU="P24N-WHEY-500"

echo "Creando orden de test..."
echo "  Order ID: $TEST_ORDER_ID"
echo "  SKU: $TEST_SKU"
echo ""

RESPONSE=$(curl -s -X POST "$DIRECTUS_URL/api/items/orders" \
  -H "Authorization: Bearer $DIRECTUS_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"sku\": \"$TEST_SKU\",
    \"quantity\": 1,
    \"email\": \"test@pure24.com\",
    \"amount\": 1499.99,
    \"payer_name\": \"Test User\",
    \"status\": \"completed\",
    \"external_reference\": \"TEST-DEPLOY-$(date +%s)\"
  }")

if echo "$RESPONSE" | grep -q '"id"'; then
  echo -e "${GREEN}✅ Orden creada exitosamente${NC}"
else
  echo -e "${RED}❌ Error creando orden${NC}"
  echo "Response: $RESPONSE"
  exit 1
fi
echo ""

# ============================================
# PASO 8: Obtener y disparar webhook
# ============================================
echo -e "${BLUE}PASO 8: Disparar webhook en n8n${NC}"
echo "---"

echo "Para obtener el webhook URL:"
echo "1. Abre http://localhost:5678 (o tu n8n)"
echo "2. Abre el workflow 'Stock Change → Deploy Cloudflare Pages'"
echo "3. Click en 'Webhook Trigger'"
echo "4. Copia la URL bajo 'Webhook URL'"
echo ""

read -p "Ingresa webhook URL de n8n (ej: https://n8n.tudominio.com/webhook/stock-change): " WEBHOOK_URL

if [ -z "$WEBHOOK_URL" ]; then
  echo -e "${RED}❌ Webhook URL no puede estar vacío${NC}"
  exit 1
fi

echo "Disparando webhook..."
WEBHOOK_RESPONSE=$(curl -s -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"sku\": \"$TEST_SKU\",
    \"quantity\": 1,
    \"reason\": \"test-deploy\",
    \"order_id\": \"$TEST_ORDER_ID\"
  }")

echo -e "${GREEN}✅ Webhook disparado${NC}"
echo "Respuesta: $WEBHOOK_RESPONSE"
echo ""

# ============================================
# PASO 9: Esperar y validar deploy
# ============================================
echo -e "${BLUE}PASO 9: Validar deploy en Cloudflare${NC}"
echo "---"

echo "⏳ Esperando que el deploy se complete..."
echo "   (Cloudflare tarda ~2 minutos)"
echo ""

for i in {1..24}; do
  echo -n "."
  sleep 5
done
echo ""

echo "✅ Deploy debería estar completado"
echo ""
echo "Ir a: https://dash.cloudflare.com"
echo "  → Pages → pure24-nutrition"
echo "  → Pestaña 'Deployments'"
echo "  → Buscar deployment más reciente"
echo "  → Status debe ser 'Active'"
echo ""

# ============================================
# PASO 10: Validar en Directus
# ============================================
echo -e "${BLUE}PASO 10: Validar log en Directus${NC}"
echo "---"

echo "Buscando evento de deploy..."
DEPLOY_EVENT=$(curl -s "$DIRECTUS_URL/api/items/deploy_events?sort=-created_at&limit=1" \
  -H "Authorization: Bearer $DIRECTUS_API_KEY")

if echo "$DEPLOY_EVENT" | grep -q '"deploy_started":true'; then
  echo -e "${GREEN}✅ Deploy event creado correctamente${NC}"
  echo ""
  echo "Evento:"
  echo "$DEPLOY_EVENT" | jq '.data[0]'
else
  echo -e "${YELLOW}⚠️  No se encontró evento reciente${NC}"
  echo "Response: $DEPLOY_EVENT"
fi
echo ""

# ============================================
# Resumen Final
# ============================================
echo -e "${GREEN}=================================="
echo "✅ TEST COMPLETADO"
echo "==================================${NC}"
echo ""
echo "Próximos pasos:"
echo "1. Verifica que el sitio está actualizado"
echo "2. Revisa Cloudflare Dashboard para confirmar deploy"
echo "3. Revisa Directus para confirmar evento log"
echo ""
echo "Si todo está ✓ → FASE 6.4 COMPLETADA 🚀"
echo ""
