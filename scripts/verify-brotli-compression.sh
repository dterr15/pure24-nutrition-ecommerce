#!/bin/bash
# verify-brotli-compression.sh
# Script para validar que Brotli está comprimiendo assets en Cloudflare Pages
# Pure 24 Nutrition

echo "🔍 Verificando compresión Brotli en Cloudflare..."
echo "================================================"

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# URLs para validar
URLS=(
  "https://pure24nutrition.cl/"
  "https://pure24nutrition.cl/productos"
)

# Headers a validar
EXPECTED_COMPRESSION="br"  # br = Brotli

echo ""
echo "Validando compresión en URLs:"
echo ""

for url in "${URLS[@]}"; do
  echo -n "🔗 $url ... "

  # Hacer request y obtener header Content-Encoding
  response=$(curl -s -I -H "Accept-Encoding: gzip, deflate, br" "$url" 2>/dev/null)

  # Extraer Content-Encoding
  encoding=$(echo "$response" | grep -i "^content-encoding:" | awk '{print $2}' | tr -d '\r')

  if [ -z "$encoding" ]; then
    echo -e "${YELLOW}⚠️ Sin compresión detectada${NC}"
  elif [ "$encoding" = "br" ]; then
    echo -e "${GREEN}✅ Brotli activado (br)${NC}"
  elif [ "$encoding" = "gzip" ]; then
    echo -e "${YELLOW}⚠️ Gzip detectado (no Brotli)${NC}"
  else
    echo -e "${RED}❌ Encoding desconocido: $encoding${NC}"
  fi
done

echo ""
echo "================================================"
echo ""
echo "📊 Validación de Cache Headers:"
echo ""

# Validar cache headers para diferentes tipos de assets
echo "HTML (sin caché):"
curl -s -I "https://pure24nutrition.cl/" | grep -i "cache-control:" | grep -o "max-age=[^,;]*"

echo ""
echo "Assets (1 año):"
curl -s -I "https://pure24nutrition.cl/_astro/index.*.css" 2>/dev/null | head -1 | grep -i "cache-control:"

echo ""
echo "Imágenes (30 días):"
curl -s -I "https://pure24nutrition.cl/images/hero.jpg" 2>/dev/null | grep -i "cache-control:"

echo ""
echo "================================================"
echo "✅ Validación completada"
echo ""
echo "ℹ️  Nota: Si Cloudflare no muestra Brotli:"
echo "   1. Espera 10 minutos después del deploy"
echo "   2. Hard refresh (Ctrl+Shift+R en navegador)"
echo "   3. Verifica que _headers esté en raíz del proyecto"
echo ""
