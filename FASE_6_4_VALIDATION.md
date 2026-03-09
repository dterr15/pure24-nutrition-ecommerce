# FASE 6.4: VALIDATION & GATE CHECKS

**Objetivo:** Verificar que FASE 6.4 está 100% funcional antes de pasar a FASE 6.7

---

## ✅ PRE-EXECUTION CHECKS

Antes de comenzar PASOS 1-10, valida que tienes todo:

### 1. Cloudflare Pages Setup ✓
```bash
# Verificar que proyecto existe
curl -s https://api.cloudflare.com/client/v4/accounts/{ACCOUNT_ID}/pages/projects \
  -H "Authorization: Bearer $CLOUDFLARE_API_KEY" | jq '.result[] | select(.name=="pure24-nutrition")'

# Esperado:
# {
#   "name": "pure24-nutrition",
#   "production_branch": "main",
#   ...
# }
```

### 2. Deploy Hook Exists ✓
```bash
# Verificar que Deploy Hook existe
CF_DEPLOY_HOOK_URL="tu_url_aqui"

curl -X POST "$CF_DEPLOY_HOOK_URL" -d '{}' -v

# Esperado en headers:
# < HTTP/1.1 200 OK
# o
# < HTTP/1.1 201 Created
```

### 3. PostgreSQL Accessible ✓
```bash
# Local
psql -U postgres -d pure24 -c "SELECT 1"

# Docker
docker exec postgres psql -U postgres -d pure24 -c "SELECT 1"

# Esperado: 1
```

### 4. Directus API Working ✓
```bash
DIRECTUS_URL="http://localhost:8055"
DIRECTUS_API_KEY="tu_api_key"

curl -s "$DIRECTUS_URL/api/items/products?limit=1" \
  -H "Authorization: Bearer $DIRECTUS_API_KEY" | jq '.data | length'

# Esperado: 1 (al menos 1 producto)
```

### 5. n8n Accessible ✓
```bash
# Local
curl -s http://localhost:5678/api/v1/workflows | jq '.data | length'

# VPS
curl -s https://tu-n8n.com/api/v1/workflows | jq '.data | length'

# Esperado: número (al menos 0)
```

---

## 📋 EXECUTION CHECKLIST

Mientras ejecutas PASOS 1-10, checkea cada uno:

### ✅ PASO 1: Deploy Hook URL
```bash
# Validar URL válida
CF_DEPLOY_HOOK_URL="tu_url"
if [[ "$CF_DEPLOY_HOOK_URL" =~ ^https://api\.cloudflare\.com ]]; then
  echo "✅ URL válida"
else
  echo "❌ URL inválida"
fi

# Guardar en variable
echo $CF_DEPLOY_HOOK_URL | wc -c # Debe ser > 80 caracteres
```

### ✅ PASO 2: Tabla deploy_events
```bash
# Verificar tabla
docker exec postgres psql -U postgres -d pure24 << 'EOF'
\dt deploy_events
SELECT COUNT(*) FROM deploy_events;
EOF

# Esperado:
#  schema |      Name      | Type  | Owner
# --------+----------------+-------+-------
#  public | deploy_events  | table | postgres
# count
# -------
#     0

# Si existe → ✅ PASO 2 OK
```

### ✅ PASO 3: .env configurado
```bash
# Verificar que variable existe
grep "CF_DEPLOY_HOOK_URL" .env

# Verificar que tiene valor
grep "CF_DEPLOY_HOOK_URL=https://" .env

# Contar caracteres
grep "CF_DEPLOY_HOOK_URL" .env | awk -F'=' '{print length($2)}'
# Debe ser > 80
```

### ✅ PASO 4: docker-compose (si aplica)
```bash
# Si usas Docker Compose local
docker-compose config | grep CF_DEPLOY_HOOK_URL

# Si n8n está en VPS → Skip
# Verificar que n8n inició
curl -s http://localhost:5678/api/v1/workflows | jq '.data | length'
```

### ✅ PASO 5: Nodos en n8n
```bash
# Importar workflow JSON
# Esto lo haces en UI:
# n8n → Menu (⋯) → Import from file → FASE_6_4_N8N_WORKFLOW.json

# Verificar que se importó
# Click en workflow → Debe ver 5 nodos
# Webhook Trigger → Fetch Stock → Deploy Hook → Verify → Log Event

# Validar conexiones (líneas entre nodos)
# Cada nodo debe tener entrada y salida (excepto primero y último)
```

### ✅ PASO 6: Workflow Activado
```bash
# En n8n UI:
# 1. Click toggle "Activate" (esquina superior derecha)
# 2. Debe cambiar a VERDE
# 3. Mensaje: "This workflow is now active"

# Validar via API:
curl -s http://localhost:5678/api/v1/workflows | \
  jq '.data[] | select(.name | contains("Deploy")) | .active'

# Esperado: true
```

### ✅ PASO 7: Orden Test
```bash
DIRECTUS_URL="http://localhost:8055"
DIRECTUS_API_KEY="tu_api_key"

# Verificar que orden se creó
curl -s "$DIRECTUS_URL/api/items/orders?limit=1&sort=-created_at" \
  -H "Authorization: Bearer $DIRECTUS_API_KEY" | jq '.data[0]'

# Esperado:
# {
#   "id": "xxx",
#   "sku": "P24N-WHEY-500",
#   "quantity": 1,
#   "status": "completed"
# }
```

### ✅ PASO 8: Webhook Disparado
```bash
# En n8n UI:
# Workflow → Pestaña "Execution"
# Debe haber 1+ execution con status "Success"

# Validar via API:
curl -s http://localhost:5678/api/v1/workflows/WORKFLOW_ID/executions?limit=1 \
  -H "Authorization: Bearer $N8N_API_TOKEN" | jq '.data[0].status'

# Esperado: success o completed
```

### ✅ PASO 9: Deploy en Cloudflare
```bash
# En Cloudflare Dashboard:
# https://dash.cloudflare.com
# Pages → pure24-nutrition → Deployments
# Debe haber deployment reciente

# Validar via API:
curl -s "https://api.cloudflare.com/client/v4/accounts/ACCOUNT_ID/pages/projects/pure24-nutrition/deployments" \
  -H "Authorization: Bearer $CLOUDFLARE_API_KEY" | jq '.result[0].status'

# Esperado: success o active
```

### ✅ PASO 10: Log en Directus
```bash
DIRECTUS_URL="http://localhost:8055"
DIRECTUS_API_KEY="tu_api_key"

# Verificar que deploy_event se creó
curl -s "$DIRECTUS_URL/api/items/deploy_events?limit=1&sort=-created_at" \
  -H "Authorization: Bearer $DIRECTUS_API_KEY" | jq '.data[0]'

# Esperado:
# {
#   "id": "xxx",
#   "event_type": "stock_change_deploy",
#   "stock_sku": "P24N-WHEY-500",
#   "deploy_started": true,
#   "provider": "cloudflare",
#   "status_code": 200
# }
```

---

## 🎯 GATE 6: VALIDACIÓN COMPLETA

**Después de FASE 6.4 ✅**, validar que TODAS las fases 6.x funcionan:

### FASE 6.1: Stock Sync ✓
```bash
# Crear orden test
curl -X POST "$DIRECTUS_URL/api/items/orders" \
  -H "Authorization: Bearer $DIRECTUS_API_KEY" \
  -d '{"sku": "P24N-WHEY-500", "quantity": 5, ...}'

# Verificar que stock se redujo en products
curl -s "$DIRECTUS_URL/api/items/products?filter[sku][_eq]=P24N-WHEY-500" \
  -H "Authorization: Bearer $DIRECTUS_API_KEY" | jq '.data[0].stock'

# Esperado: número menor que antes
```

### FASE 6.2: GA4 Analytics ✓
```bash
# Abrir navegador
# Ir a Google Analytics 4
# Property → Events
# Debe haber evento "purchase" o "add_to_cart"
# Status: ✅ (con timestamp reciente)
```

### FASE 6.4: Deploy Automático ✓
```bash
# Timeline válido:
# T+5s: Stock actualizado
# T+15s: Deploy Hook disparado
# T+2min: Sitio actualizado en Cloudflare

# Validar timeline
echo "T+0: Crear orden"
curl -X POST "$DIRECTUS_URL/api/items/orders" ...

echo "T+5: Verificar stock"
sleep 5
curl -s "$DIRECTUS_URL/api/items/products?filter[sku][_eq]=P24N-WHEY-500" ... | jq '.data[0].stock'

echo "T+15: Verificar deploy"
sleep 10
curl -s "https://dash.cloudflare.com/api/..." | jq '.result[0].status'
# Esperado: "success" o "active"
```

### Sitio Reflejado ✓
```bash
# Ir a: https://pure24nutrition.pages.dev
# Abrir producto: /productos/P24N-WHEY-500
# Stock debe estar actualizado
# Tiempo máximo: 2-3 minutos desde compra
```

---

## ❌ COMMON FAILURES & FIXES

### Failure: Deploy Hook retorna 404
```bash
# Causa: URL incorrecta
# Verificar:
curl -X POST "YOUR_URL" -d '{}' -v

# Si 404:
# 1. Regenerar en Cloudflare Dashboard
# 2. Copiar URL COMPLETA (sin cortes)
# 3. Validar que tiene formato: https://api.cloudflare.com/...
```

### Failure: n8n workflow no dispara
```bash
# Causa: Workflow no ACTIVADO
# Verificar en n8n UI:
# Toggle "Activate" debe estar VERDE

# Si sigue sin disparar:
# 1. Guardar workflow (Ctrl+S)
# 2. Recargar página
# 3. Revisar n8n logs
```

### Failure: deploy_events no tiene rows
```bash
# Causa: Colección no existe o Nodo 5 falla
# Verificar:
docker exec postgres psql -U postgres -d pure24 << 'EOF'
SELECT COUNT(*) FROM deploy_events;
EOF

# Si tabla no existe:
docker exec postgres psql -U postgres -d pure24 < scripts/create-deploy-events-table.sql

# Si tabla existe pero sin rows:
# 1. Revisar n8n Execution logs → Nodo 5
# 2. Verificar DIRECTUS_API_KEY válida
# 3. Verificar que Nodo 3 retornó 200 OK
```

### Failure: Sitio no se actualiza en Cloudflare
```bash
# Causa: Deploy no completó o URL incorrecta
# Validar:
curl -s https://api.cloudflare.com/client/v4/accounts/{ACCOUNT_ID}/pages/projects/pure24-nutrition/deployments \
  -H "Authorization: Bearer $CLOUDFLARE_API_KEY" | jq '.result[0]'

# Si último deployment está en "Building" → Esperar
# Si está en "Failed" → Ver logs en Dashboard
# Si no aparece → Deploy Hook no fue llamado (revisar n8n)
```

---

## 📊 FINAL CHECKLIST

```
GATE 6 CHECKLIST (Todos deben estar ✅):

FASE 6.1: Stock Sync
[ ] Crear orden → Stock se reduce
[ ] Verificar en Directus API
[ ] Status: ✅ WORKING

FASE 6.2: GA4 Analytics
[ ] Evento enviado a Google Analytics
[ ] Visible en GA4 Events tab
[ ] Status: ✅ WORKING

FASE 6.3: Email Transaccionales
[ ] Email recibido en inbox
[ ] Subject y contenido válidos
[ ] Status: ⏳ NOT YET (configurar después)

FASE 6.4: Deploy Automático
[ ] PASO 1: Deploy Hook URL obtenida ✅
[ ] PASO 2: deploy_events tabla creada ✅
[ ] PASO 3: .env configurado ✅
[ ] PASO 4: docker-compose actualizado ✅
[ ] PASO 5: Nodos n8n creados ✅
[ ] PASO 6: Workflow ACTIVADO (verde) ✅
[ ] PASO 7: Orden test creada ✅
[ ] PASO 8: Webhook disparado ✅
[ ] PASO 9: Deploy en Cloudflare Dashboard ✅
[ ] PASO 10: Log en deploy_events ✅
[ ] Sitio actualizado en < 5 min ✅
[ ] Status: ✅ WORKING

Validaciones Post-Deploy:
[ ] Stock refleja cambios correctamente
[ ] Timeline: T+2min máximo
[ ] No hay errores en n8n logs
[ ] deploy_events tiene registros
[ ] Cloudflare Dashboard muestra deploys

OVERALL STATUS:
[ ] GATE 6 PASSED ✅ → Ready for FASE 6.7
[ ] GATE 6 FAILED ❌ → Fix issues and retry
```

---

## 🚀 PRÓXIMO PASO

Cuando todos los checks estén ✅:

→ **FASE 6.7: Documentación Final & Handoff**
- Runbook de operaciones
- Guía de mantenimiento
- Procedures de disaster recovery
- Knowledge transfer

---

**Última actualización:** 2025-03-09
**Estado:** ✅ Validation Framework Completo
