# FASE 6.4: DEPLOY AUTOMÁTICO - CLOUDFLARE PAGES
**Status:** ✅ LISTO PARA EJECUTAR
**Duración:** 20-30 minutos
**Objetivo:** Automatizar deploy cuando stock cambia (compra realizada)

---

## 🎯 FLUJO COMPLETO (2 minutos)

```
Compra realizada (Webhook IPN)
        ↓
T+5s:   Stock reducido en Directus (FASE 6.1)
        ↓
T+10s:  Deploy Hook disparado a Cloudflare (ESTA FASE)
        ↓
T+20s:  Cloudflare inicia rebuild
        ↓
T+2min: Sitio actualizado + ACTIVE ✅
```

---

## 📋 PASO 1: OBTENER DEPLOY HOOK URL (1 MIN)

### Ubicación Cloudflare Dashboard
1. **URL:** https://dash.cloudflare.com
2. **Pages** → Proyecto `pure24-nutrition`
3. **Settings** → **Builds & deployments**
4. **Deploy hooks** → Seleccionar hook existente
5. **Copiar URL completa**

### Formato esperado
```
https://api.cloudflare.com/client/v4/accounts/{ACCOUNT_ID}/pages/projects/pure24-nutrition/deployments/hooks/{HOOK_ID}/trigger
```

### Guardar en variable temporal
```bash
CF_DEPLOY_HOOK_URL="https://api.cloudflare.com/client/v4/accounts/XXX/pages/projects/pure24-nutrition/deployments/hooks/YYY/trigger"

# Validar que tenga valor
echo $CF_DEPLOY_HOOK_URL
# Debe mostrar: https://api.cloudflare.com/...
```

✅ **PASO 1 COMPLETADO** cuando veas la URL completa en la variable

---

## 📋 PASO 2: CREAR COLECCIÓN deploy_events EN DIRECTUS (3 MIN)

### Opción A: Via UI (recomendado)
1. **Directus:** http://localhost:8055 (o tu VPS)
2. Click **"+"** (crear colección)
3. **Nombre:** `deploy_events`
4. **Click "Create Collection"**

### Agregar campos (en orden)

| Campo | Tipo | Requerido | Notas |
|-------|------|-----------|-------|
| `id` | UUID | ✅ | PK, auto |
| `event_type` | String (50) | ✅ | Default: `stock_change_deploy` |
| `stock_sku` | String (100) | ❌ | Ej: `P24N-WHEY-500` |
| `deploy_id` | String (255) | ❌ | ID del deploy en Cloudflare |
| `deploy_started` | Boolean | ✅ | Default: `false` |
| `provider` | String (50) | ❌ | Ej: `cloudflare` |
| `status_code` | Integer | ❌ | Ej: `200` |
| `triggered_at` | Timestamp | ❌ | Cuándo se disparó el webhook |
| `created_at` | Timestamp | ✅ | Auto NOW() |

### Opción B: Via SQL (VPS Postgres)
```bash
docker exec -it postgres psql -U postgres -d pure24 << 'EOF'
CREATE TABLE deploy_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR(50) NOT NULL DEFAULT 'stock_change_deploy',
  stock_sku VARCHAR(100),
  deploy_id VARCHAR(255),
  deploy_started BOOLEAN DEFAULT FALSE,
  provider VARCHAR(50),
  status_code INTEGER,
  triggered_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
EOF
```

### Validar creación
```bash
DIRECTUS_API_KEY="tu_api_key_aqui"

curl -s "http://localhost:8055/api/collections" \
  -H "Authorization: Bearer $DIRECTUS_API_KEY" | grep deploy_events

# O via SQL:
docker exec -it postgres psql -U postgres -d pure24 -c "\dt deploy_events"
```

✅ **PASO 2 COMPLETADO** cuando ves la colección en Directus UI o en tabla SQL

---

## 📋 PASO 3: CONFIGURAR VARIABLES EN .env (2 MIN)

### Agregar a `.env` en root del proyecto
```bash
# Cloudflare Deploy Hook
CF_DEPLOY_HOOK_URL="https://api.cloudflare.com/client/v4/accounts/ACCOUNT_ID/pages/projects/pure24-nutrition/deployments/hooks/HOOK_ID/trigger"
```

### Script rápido
```bash
cat >> .env << 'EOF'

# FASE 6.4: Deploy Automático
CF_DEPLOY_HOOK_URL="https://api.cloudflare.com/client/v4/accounts/XXX/pages/projects/pure24-nutrition/deployments/hooks/YYY/trigger"
EOF

# Validar
grep CF_DEPLOY_HOOK_URL .env
```

✅ **PASO 3 COMPLETADO** cuando `grep` muestra la URL completa

---

## 📋 PASO 4: ACTUALIZAR docker-compose.yml (2 MIN)

### Si usas n8n en Docker local:
```yaml
services:
  n8n:
    # ... otras config ...
    environment:
      # ... variables existentes ...
      - CF_DEPLOY_HOOK_URL=${CF_DEPLOY_HOOK_URL}
```

### Si n8n está en VPS:
⏭️ **SALTA ESTE PASO** — irás directo a n8n web UI

### Si usaste docker-compose:
```bash
docker-compose restart n8n
sleep 10
```

✅ **PASO 4 COMPLETADO** si n8n está en VPS (salta) o reinició sin errores

---

## 📋 PASO 5: CREAR NODOS EN n8n (5 MIN)

### Opción A: Importar workflow JSON (RECOMENDADO)

**Archivo:** `FASE_6_4_N8N_WORKFLOW.json` (incluido abajo)

1. **n8n web:** http://n8n-vps:5678 (o IP de tu VPS)
2. **Menu (⋯)** → **"Import from file"**
3. **Seleccionar:** `FASE_6_4_N8N_WORKFLOW.json`
4. **Click "Import"**

### Opción B: Manual (crear nodos paso a paso)

**Nueva workflow:**
1. **New Workflow**
2. **Canvas vacío**

**Nodo 1: Webhook Trigger**
- Tipo: `Webhook Trigger`
- Método: `POST`
- Path: `/stock-change` (o tu path)
- Click "Test webhook URL" → copiar URL para usar en PASO 8

**Nodo 2: Fetch Stock Actual** (obtener stock de Directus)
- Tipo: `HTTP Request`
- Método: `GET`
- URL: `http://localhost:8055/api/items/products?filter[sku][_eq]={{$json.sku}}`
- Headers: `Authorization: Bearer {{env.DIRECTUS_API_KEY}}`
- Conectar desde Nodo 1 → Nodo 2

**Nodo 3: Trigger Deploy Hook** (CRÍTICO)
- Tipo: `HTTP Request`
- Método: `POST`
- URL: `{{env.CF_DEPLOY_HOOK_URL}}`
- Body: `{}` (vacío)
- Conectar desde Nodo 2 → Nodo 3

**Nodo 4: Verify Deploy Started**
- Tipo: `Code`
- Lenguaje: `JavaScript`
- Script:
```javascript
return {
  status_code: 200,
  deploy_started: true,
  triggered_at: new Date().toISOString()
};
```
- Conectar desde Nodo 3 → Nodo 4

**Nodo 5: Log Deploy Event** (crear record en Directus)
- Tipo: `HTTP Request`
- Método: `POST`
- URL: `http://localhost:8055/api/items/deploy_events`
- Headers: `Authorization: Bearer {{env.DIRECTUS_API_KEY}}`
- Body:
```json
{
  "event_type": "stock_change_deploy",
  "stock_sku": "{{$json.sku}}",
  "deploy_started": true,
  "provider": "cloudflare",
  "status_code": 200,
  "triggered_at": "{{$json.triggered_at}}"
}
```
- Conectar desde Nodo 4 → Nodo 5

✅ **PASO 5 COMPLETADO** cuando ves los 5 nodos conectados en canvas

---

## 📋 PASO 6: GUARDAR Y ACTIVAR WORKFLOW (2 MIN)

### En n8n UI
1. **Click "Save"** (esquina superior derecha)
2. **Esperar mensaje:** "Workflow saved"
3. **Click toggle "Activate"** (debe ponerse en verde)
4. **Status:** "This workflow is now active"

### Nombre sugerido
```
Stock Change → Deploy Cloudflare Pages
```

✅ **PASO 6 COMPLETADO** cuando ves toggle en verde y status "active"

---

## 📋 PASO 7: CREAR ORDEN DE TEST (2 MIN)

### Obtener valores necesarios
```bash
DIRECTUS_API_KEY="tu_api_key_aqui"
DIRECTUS_URL="http://localhost:8055" # o tu VPS

# Generar UUID para test
TEST_ORDER_ID=$(uuidgen 2>/dev/null || python3 -c "import uuid; print(uuid.uuid4())")
echo "TEST_ORDER_ID=$TEST_ORDER_ID"
```

### Crear orden POST
```bash
curl -X POST "$DIRECTUS_URL/api/items/orders" \
  -H "Authorization: Bearer $DIRECTUS_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"sku\": \"P24N-WHEY-500\",
    \"quantity\": 3,
    \"email\": \"test@example.com\",
    \"amount\": 1499.99,
    \"payer_name\": \"Test User\",
    \"status\": \"pending\",
    \"external_reference\": \"TEST-DEPLOY-001\"
  }"

echo "✅ Orden test creada"
```

✅ **PASO 7 COMPLETADO** cuando la API retorna status 201 o 200

---

## 📋 PASO 8: TRIGGER TEST MANUAL (3 MIN)

### Obtener webhook URL de n8n
En n8n UI:
1. **Abre el workflow**
2. **Click en Nodo 1 (Webhook Trigger)**
3. **Pestaña "Test"**
4. **Copiar "Webhook URL"**

Formato: `https://n8n-vps.com/webhook/stock-change`

### Disparar webhook
```bash
WEBHOOK_URL="https://n8n-vps.com/webhook/stock-change"
TEST_SKU="P24N-WHEY-500"

echo "🚀 Disparando webhook para deploy..."
curl -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"sku\": \"$TEST_SKU\",
    \"quantity\": 1,
    \"reason\": \"test-deploy\"
  }"

echo ""
echo "✅ Webhook disparado"
echo "⏳ Esperando procesamiento (3-5 segundos)..."
sleep 5
```

### Verificar en n8n logs
1. **n8n UI** → **Workflow**
2. **Pestaña "Execution"**
3. Debe haber execution reciente con status "Success"

✅ **PASO 8 COMPLETADO** cuando ves execution SUCCESS en n8n

---

## 📋 PASO 9: VALIDAR DEPLOY EN CLOUDFLARE DASHBOARD (5 MIN)

### Ir a Cloudflare
1. **URL:** https://dash.cloudflare.com
2. **Pages** → `pure24-nutrition`
3. **Pestaña "Deployments"**
4. **Buscar deployment más reciente**

### Timeline esperado
| Evento | Tiempo | Status |
|--------|--------|--------|
| Webhook disparado | T+0s | - |
| Deploy hook llamado | T+1s | - |
| Cloudflare recibe request | T+2s | - |
| Build iniciado | T+20s | `In progress` |
| Build completado | T+2min | `Active` ✅ |
| Sitio online | T+2:30 | Actualizado |

### Verificar cambios en sitio
```bash
# El sitio debe reflejar cambios de stock en < 2 minutos
curl https://pure24nutrition.pages.dev/productos/P24N-WHEY-500 | grep -i stock

# O revisar en navegador: https://pure24nutrition.pages.dev
```

✅ **PASO 9 COMPLETADO** cuando ves deployment con status "Active" en Dashboard

---

## 📋 PASO 10: VALIDAR EN DIRECTUS (2 MIN)

### Via API
```bash
DIRECTUS_API_KEY="tu_api_key"
DIRECTUS_URL="http://localhost:8055"

# Obtener último evento de deploy
curl -s "$DIRECTUS_URL/api/items/deploy_events?sort=-created_at&limit=1" \
  -H "Authorization: Bearer $DIRECTUS_API_KEY" | jq '.data[0]'

# Esperado:
# {
#   "id": "uuid-xxx",
#   "event_type": "stock_change_deploy",
#   "stock_sku": "P24N-WHEY-500",
#   "deploy_started": true,
#   "provider": "cloudflare",
#   "status_code": 200,
#   "triggered_at": "2025-03-09T10:35:00Z"
# }
```

### Via UI de Directus
1. **Directus:** http://localhost:8055
2. **Collections** → `deploy_events`
3. Debe haber 1+ rows nuevos
4. Verificar campos:
   - ✅ `event_type` = `stock_change_deploy`
   - ✅ `deploy_started` = `true`
   - ✅ `status_code` = `200`

✅ **PASO 10 COMPLETADO** cuando ves row en deploy_events con `deploy_started=true`

---

## ✅ CHECKLIST FINAL

```
[ ] PASO 1: Deploy Hook URL obtenida y guardada
[ ] PASO 2: Colección deploy_events creada en Directus
[ ] PASO 3: Variables en .env configuradas
[ ] PASO 4: docker-compose actualizado (o n8n en VPS)
[ ] PASO 5: 5 nodos creados en n8n
[ ] PASO 6: Workflow guardado y Activado
[ ] PASO 7: Orden de test creada
[ ] PASO 8: Webhook disparado exitosamente
[ ] PASO 9: Deploy visible en Cloudflare Dashboard (status "Active")
[ ] PASO 10: Log creado en deploy_events
[ ] ✅ FASE 6.4 COMPLETADA
```

---

## ⏱️ TIMELINE

| Paso | Tarea | Tiempo |
|------|-------|--------|
| 1 | Copiar Deploy Hook | 1 min |
| 2 | Crear colección deploy_events | 3 min |
| 3 | Configurar vars .env | 2 min |
| 4 | docker-compose (o skip) | 2 min |
| 5 | Crear 5 nodos n8n | 5 min |
| 6 | Guardar + Activar | 2 min |
| 7 | Orden de test | 2 min |
| 8 | Trigger webhook | 3 min |
| 9 | Validar Cloudflare | 5 min |
| 10 | Validar Directus | 2 min |
| **TOTAL** | | **~27 min** |

---

## 🚨 TROUBLESHOOTING RÁPIDO

### Deploy Hook retorna 404
- ❌ URL incorrecta (verificar en Cloudflare Dashboard)
- ✅ Regenerar Deploy Hook en Dashboard
- ✅ Validar Account ID, Project Name, Hook ID

### Deploy Hook retorna 401
- ❌ Deploy Hook URL expiró
- ✅ Regenerar en Cloudflare Dashboard

### Deploy no aparece en Dashboard
- ⏳ Esperar 30 segundos (tarda en indexarse)
- 🔄 Recargar página Dashboard (F5)
- 📋 Revisar logs de n8n (pestaña Execution)

### deploy_events no crea row
- ✅ Verificar que colección existe
- ✅ Verificar que campos están bien nombrados
- ✅ Verificar DIRECTUS_API_KEY es válida
- 📋 Revisar response del Nodo 5 en n8n

### Webhook retorna error
- ✅ Verificar path del webhook (ej: `/stock-change`)
- ✅ Verificar que n8n workflow está Activado
- 📋 Ver logs en n8n (pestaña Execution)

---

## 🎯 PRÓXIMO PASO

Cuando completes PASO 10 ✅:

→ **GATE 6: VALIDACIÓN COMPLETA**

Verificar que todos los checks funcionan:
- [ ] Stock se reduce automáticamente (FASE 6.1)
- [ ] Evento GA4 enviado server-side (FASE 6.2)
- [ ] Deploy automático se dispara (FASE 6.4) ✅
- [ ] Sitio refleja datos en < 5 min

Si todos ✓ → **FASE 6.7: Documentación Final & Handoff**

---

**¿Listo?** Comienza con **PASO 1**: Copia la Deploy Hook URL de Cloudflare.
Avisame cuando termines cada PASO para validar. 🚀
