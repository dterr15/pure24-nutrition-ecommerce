#!/bin/bash

# Script de validación de configuración - PURE 24 NUTRITION
# Verifica que todas las credenciales estén correctamente configuradas

set -e

echo "🔍 Iniciando validación de configuración..."
echo "================================"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ Archivo .env no encontrado en la raíz del proyecto${NC}"
    exit 1
fi

echo -e "${YELLOW}✓ Archivo .env encontrado${NC}"
echo ""

# Source the .env file
export $(cat .env | grep -v '^#' | xargs)

# 1. Validar Mercado Pago
echo "📌 Validando Mercado Pago..."
if [ -z "$MP_ACCESS_TOKEN" ]; then
    echo -e "${RED}❌ MP_ACCESS_TOKEN no configurado${NC}"
    exit 1
fi

MP_TEST=$(curl -s -H "Authorization: Bearer $MP_ACCESS_TOKEN" https://api.mercadopago.com/v1/payments/search | grep -o '"results"' | head -1)
if [ -z "$MP_TEST" ]; then
    echo -e "${RED}❌ Error al conectar con Mercado Pago API${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Mercado Pago verificado correctamente${NC}"

# 2. Validar Google Analytics GA4
echo "📌 Validando Google Analytics GA4..."
if [ -z "$VITE_PUBLIC_GA4_MEASUREMENT_ID" ] || [ -z "$GA4_API_SECRET" ]; then
    echo -e "${RED}❌ GA4_MEASUREMENT_ID o GA4_API_SECRET no configurados${NC}"
    exit 1
fi

GA4_TEST=$(curl -s -w "%{http_code}" -o /dev/null -X POST "https://www.google-analytics.com/mp/collect?measurement_id=$VITE_PUBLIC_GA4_MEASUREMENT_ID&api_secret=$GA4_API_SECRET" -H "Content-Type: application/json" -d '{"client_id":"test_client_12345","events":[{"name":"page_view"}]}')
if [ "$GA4_TEST" != "204" ]; then
    echo -e "${RED}❌ Error al conectar con Google Analytics (HTTP $GA4_TEST)${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Google Analytics GA4 verificado correctamente (HTTP 204)${NC}"

# 3. Validar Cloudflare
echo "📌 Validando Cloudflare..."
if [ -z "$CF_API_TOKEN" ] || [ -z "$CF_ACCOUNT_ID" ] || [ -z "$CF_ZONE_ID" ]; then
    echo -e "${RED}❌ CF_API_TOKEN, CF_ACCOUNT_ID o CF_ZONE_ID no configurados${NC}"
    exit 1
fi

CF_TEST=$(curl -s -H "Authorization: Bearer $CF_API_TOKEN" https://api.cloudflare.com/client/v4/user/tokens/verify | grep -o '"success":true' | head -1)
if [ -z "$CF_TEST" ]; then
    echo -e "${RED}❌ Error al conectar con Cloudflare API${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Cloudflare verificado correctamente${NC}"

# 4. Validar Directus
echo "📌 Validando Directus..."
if [ -z "$DIRECTUS_ADMIN_EMAIL" ] || [ -z "$DIRECTUS_ADMIN_PASSWORD" ]; then
    echo -e "${RED}❌ DIRECTUS_ADMIN_EMAIL o DIRECTUS_ADMIN_PASSWORD no configurados${NC}"
    exit 1
fi
echo -e "${YELLOW}✓ Credenciales de Directus configuradas (test en Fase 3)${NC}"

# 5. Validar N8N
echo "📌 Validando N8N..."
if [ -z "$N8N_API_KEY" ]; then
    echo -e "${RED}❌ N8N_API_KEY no configurado${NC}"
    exit 1
fi
echo -e "${YELLOW}✓ N8N API Key configurado (test en Fase 3)${NC}"

# 6. Validar Dominio
echo "📌 Validando Dominio..."
if [ -z "$VITE_PUBLIC_DOMAIN" ] || [ -z "$BACKEND_DOMAIN" ]; then
    echo -e "${RED}❌ VITE_PUBLIC_DOMAIN o BACKEND_DOMAIN no configurados${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Dominios configurados correctamente${NC}"
echo "   - Dominio principal: $VITE_PUBLIC_DOMAIN"
echo "   - Backend domain: $BACKEND_DOMAIN"

# 7. Validar CSV de productos
echo "📌 Validando archivo de productos..."
if [ ! -f data/products.csv ]; then
    echo -e "${RED}❌ Archivo data/products.csv no encontrado${NC}"
    exit 1
fi

PRODUCT_COUNT=$(wc -l < data/products.csv)
PRODUCT_COUNT=$((PRODUCT_COUNT - 1))  # Restar header
if [ "$PRODUCT_COUNT" -lt 5 ]; then
    echo -e "${RED}❌ Se requieren mínimo 5 productos (encontrados: $PRODUCT_COUNT)${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Archivo de productos válido ($PRODUCT_COUNT productos)${NC}"

echo ""
echo "================================"
echo -e "${GREEN}✅ VALIDACIÓN COMPLETADA EXITOSAMENTE${NC}"
echo "================================"
echo ""
echo "📊 Resumen:"
echo "   ✓ Mercado Pago: Verificado"
echo "   ✓ Google Analytics GA4: Verificado"
echo "   ✓ Cloudflare: Verificado"
echo "   ✓ Directus: Configurado (test en Fase 3)"
echo "   ✓ N8N: Configurado (test en Fase 3)"
echo "   ✓ Dominio: Configurado"
echo "   ✓ Productos: $PRODUCT_COUNT productos en data/products.csv"
echo ""
echo "🚀 Listo para iniciar Fase 1: Knowledge Pack"
