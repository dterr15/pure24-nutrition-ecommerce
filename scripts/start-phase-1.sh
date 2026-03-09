#!/bin/bash
# ============================================================================
# PURE 24 NUTRITION — INICIAR FASE 1: KNOWLEDGE PACK
# ============================================================================
# Uso: bash scripts/start-phase-1.sh
# Verifica que Fase 0B esté completa y genera Knowledge Pack
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
║  PURE 24 NUTRITION — FASE 1: KNOWLEDGE PACK                               ║
║                                                                            ║
║  Generando documentación de análisis y diseño                             ║
║                                                                            ║
╚════════════════════════════════════════════════════════════════════════════╝
EOF
echo ""

# ============================================================================
# PASO 1: VERIFICAR QUE FASE 0B ESTÁ COMPLETA
# ============================================================================
echo -e "${BLUE}[1/3] Verificando Fase 0B completada${NC}"
echo ""

# Verificar .env existe
if [ ! -f .env ]; then
    echo -e "${RED}✗ .env no encontrado${NC}"
    echo "  Ejecutar primero: bash scripts/setup.sh"
    exit 1
fi
echo -e "${GREEN}✓${NC} .env existe"

# Verificar data/products.csv existe
if [ ! -f data/products.csv ]; then
    echo -e "${RED}✗ data/products.csv no encontrado${NC}"
    echo "  Ver: docs/00_data_collection_checklist.md (Sección 1)"
    exit 1
fi

# Contar productos
PRODUCT_COUNT=$(tail -n +2 data/products.csv | wc -l)
if [ "$PRODUCT_COUNT" -lt 5 ]; then
    echo -e "${RED}✗ Mínimo 5 productos requeridos (encontrados: $PRODUCT_COUNT)${NC}"
    exit 1
fi
echo -e "${GREEN}✓${NC} data/products.csv completado ($PRODUCT_COUNT productos)"

# Ejecutar validación
echo ""
echo -e "${BLUE}Ejecutando validación de credenciales...${NC}"
if bash scripts/validate-config.sh 2>&1 | grep -q "VALIDACIÓN COMPLETADA"; then
    echo -e "${GREEN}✓${NC} Todas las credenciales válidas"
else
    echo -e "${RED}✗ Validación falló${NC}"
    echo "  Ver: docs/00_data_collection_checklist.md"
    exit 1
fi

echo ""
echo -e "${GREEN}✓ FASE 0B VERIFICADA${NC}"
echo ""

# ============================================================================
# PASO 2: CREAR ESTRUCTURA FASE 1
# ============================================================================
echo -e "${BLUE}[2/3] Creando documentos Knowledge Pack${NC}"
echo ""

# Crear carpeta phase-1 si no existe
mkdir -p docs/phase-1

# Documento 1: Análisis de Productos
cat > docs/phase-1/01_product_analysis.md << 'DOCEND'
# 📊 ANÁLISIS DE PRODUCTOS — FASE 1

Documento generado automáticamente en Fase 1.

Contenido a completar:
- [ ] Análisis de cada producto
- [ ] Categorización
- [ ] Pricing strategy
- [ ] Stock management
- [ ] Imágenes y descripciones

Ver: /data/products.csv para datos brutos.
DOCEND

# Documento 2: Directus Collections Design
cat > docs/phase-1/02_directus_collections.md << 'DOCEND'
# 🗄️ DIRECTUS COLLECTIONS DESIGN — FASE 1

Documento generado automáticamente en Fase 1.

Contenido a completar:
- [ ] Schema de productos
- [ ] Relaciones entre tablas
- [ ] Validaciones
- [ ] Permisos y roles

Próximo paso: Crear collections en Directus Admin.
DOCEND

# Documento 3: API Endpoints Design
cat > docs/phase-1/03_api_design.md << 'DOCEND'
# 🔌 API DESIGN — FASE 1

Documento generado automáticamente en Fase 1.

Contenido a completar:
- [ ] Endpoints REST
- [ ] Query parameters
- [ ] Response formats
- [ ] Error handling
- [ ] Rate limiting

Basado en Directus API.
DOCEND

# Documentos 4-14: Placeholder
for i in {4..14}; do
    cat > docs/phase-1/0${i}_placeholder.md << DOCEND
# DOCUMENTO FASE 1 — PARTE $i

Placeholder generado en Fase 1.

Será completado cuando sea necesario.
DOCEND
done

echo -e "${GREEN}✓${NC} Knowledge Pack creado (14 documentos)"
echo "   Ubicación: docs/phase-1/"
echo ""

# ============================================================================
# PASO 3: INSTRUCCIONES SIGUIENTES
# ============================================================================
echo -e "${BLUE}[3/3] Generando instrucciones${NC}"
echo ""

cat > docs/PHASE_1_INSTRUCTIONS.md << 'DOCEND'
# 🚀 FASE 1: KNOWLEDGE PACK — INSTRUCCIONES

**Status:** Iniciada
**Documentos:** 14 archivos generados en `docs/phase-1/`

## Próximos Pasos

### 1. Revisar Documentos Generados
```bash
ls -la docs/phase-1/
```

### 2. Completar Cada Documento
Los documentos están en `docs/phase-1/`:
- `01_product_analysis.md` — Análisis de productos
- `02_directus_collections.md` — Diseño de base de datos
- `03_api_design.md` — Diseño de API
- `04-14_placeholder.md` — Otros documentos

### 3. Crear Collections en Directus

Acceder a: http://localhost:8055/admin

Crear tablas (collections):
- [ ] products
- [ ] categories
- [ ] orders
- [ ] users

### 4. Importar Datos de Productos

```bash
# Los datos están en:
cat data/products.csv

# Importarlos en Directus Admin → Collections → products
```

### 5. Validar

```bash
# Verificar que Directus tiene datos
curl http://localhost:8055/rest/items/products
```

## Timeline
- Duración estimada: 5-8 horas
- Bloqueante para: Fase 2 (Message Lab)

## Siguiente
Cuando Fase 1 esté completa:
```bash
bash scripts/start-phase-2.sh
```
DOCEND

echo -e "${GREEN}✓${NC} Instrucciones guardadas: docs/PHASE_1_INSTRUCTIONS.md"
echo ""

# ============================================================================
# RESUMEN FINAL
# ============================================================================
echo "========================================================================"
echo -e "${GREEN}✓ FASE 1 INICIADA EXITOSAMENTE${NC}"
echo "========================================================================"
echo ""
echo "Documentos creados:"
echo "  • docs/phase-1/01_product_analysis.md"
echo "  • docs/phase-1/02_directus_collections.md"
echo "  • docs/phase-1/03_api_design.md"
echo "  • docs/phase-1/04-14_placeholder.md (11 documentos)"
echo ""
echo "Próximos pasos:"
echo "  1. Revisar: docs/PHASE_1_INSTRUCTIONS.md"
echo "  2. Completar documentos en: docs/phase-1/"
echo "  3. Crear collections en Directus"
echo "  4. Importar datos de productos"
echo ""
echo "Directus Admin:"
echo "  • URL: http://localhost:8055/admin"
echo "  • Email: dt@sygnode.cl"
echo "  • Password: (ver .env)"
echo ""
echo "========================================================================"
echo ""
echo "Ready! 🚀"
