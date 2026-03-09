# FASE 6.4: REFERENCIA RÁPIDA

## 🎯 OBJETIVO
Automatizar que cuando se realiza una compra, el sitio en Cloudflare Pages se redeploy automáticamente en < 5 minutos para reflejar cambios de stock.

## 📊 ARQUITECTURA

```
Compra realizada (Webhook Mercado Pago)
  ↓ (FASE 6.1)
Stock reducido en Directus
  ↓ (WebhookEvent en Directus)
n8n webhook disparado
  ↓ (FASE 6.4 - Este workflow)
Cloudflare Deploy Hook llamado (POST)
  ↓
Cloudflare Pages inicia rebuild
  ↓ (2 minutos)
Sitio actualizado y ACTIVE ✅
```

## 🔧 COMPONENTES

### 1. **Deploy Events Table** (Directus PostgreSQL)
```sql
deploy_events {
  id: UUID (PK)
  event_type: "stock_change_deploy"
  stock_sku: "P24N-WHEY-500"
  deploy_id: "cloudflare-deploy-xyz"
  deploy_started: true/false
  provider: "cloudflare"
  status_code: 200/401/404
  triggered_at: timestamp
  created_at: timestamp
}
```

### 2. **n8n Workflow** (5 nodos)
- **Webhook Trigger:** Recibe evento de stock change
- **Fetch Stock:** Valida stock en Directus
- **Trigger Deploy Hook:** Llama POST a Cloudflare
- **Verify Deploy:** Confirma que deploy inició
- **Log Deploy Event:** Crea record en deploy_events

### 3. **Cloudflare Deploy Hook**
- URL: `https://api.cloudflare.com/client/v4/accounts/{ACCOUNT_ID}/pages/projects/pure24-nutrition/deployments/hooks/{HOOK_ID}/trigger`
- Método: `POST`
- Body: `{}` (vacío)
- Response: `200 OK` + JSON con deploy ID

### 4. **Environment Variables**
```bash
CF_DEPLOY_HOOK_URL="https://api.cloudflare.com/..."
DIRECTUS_API_KEY="dirk_xxx..."
DIRECTUS_URL="http://localhost:8055"
N8N_URL="http://localhost:5678"
```

## 🚀 COMANDOS RÁPIDOS

### Crear tabla deploy_events
```bash
# Via Docker
docker exec -it postgres psql -U postgres -d pure24 < scripts/create-deploy-events-table.sql

# Via local psql
psql -U postgres -d pure24 < scripts/create-deploy-events-table.sql
```

### Actualizar .env
```bash
echo 'CF_DEPLOY_HOOK_URL="https://api.cloudflare.com/..."' >> .env
```

### Crear orden test
```bash
DIRECTUS_URL="http://localhost:8055"
DIRECTUS_API_KEY="tu_api_key"

curl -X POST "$DIRECTUS_URL/api/items/orders" \
  -H "Authorization: Bearer $DIRECTUS_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "sku": "P24N-WHEY-500",
    "quantity": 1,
    "email": "test@example.com",
    "amount": 1499.99,
    "payer_name": "Test User",
    "status": "completed",
    "external_reference": "TEST-001"
  }'
```

### Disparar webhook
```bash
WEBHOOK_URL="https://n8n.tudominio.com/webhook/stock-change"

curl -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "sku": "P24N-WHEY-500",
    "quantity": 1,
    "reason": "test"
  }'
```

### Ver deploy events
```bash
DIRECTUS_URL="http://localhost:8055"
DIRECTUS_API_KEY="tu_api_key"

# Últimos 5 eventos
curl -s "$DIRECTUS_URL/api/items/deploy_events?sort=-created_at&limit=5" \
  -H "Authorization: Bearer $DIRECTUS_API_KEY" | jq '.data'

# Por proveedor (cloudflare)
curl -s "$DIRECTUS_URL/api/items/deploy_events?filter[provider][_eq]=cloudflare" \
  -H "Authorization: Bearer $DIRECTUS_API_KEY" | jq '.data'
```

## 🐛 TROUBLESHOOTING

### Deploy Hook retorna 404
**Causa:** URL incorrecta o expirada
```bash
# Regenerar en Cloudflare Dashboard:
# Pages → pure24-nutrition → Settings → Builds & deployments → Deploy hooks
# Delete y crear nuevo hook
```

### Deploy Hook retorna 401
**Causa:** Token expirado o URL inválida
```bash
# Regenerar URL en Cloudflare Dashboard
# Verificar que es URL completa (https://api.cloudflare.com/...)
```

### Webhook no dispara
**Causa:** n8n no está activo o URL incorrecta
```bash
# En n8n UI:
# 1. Abre workflow
# 2. Click en Webhook Trigger
# 3. Pestaña "Test"
# 4. Copia "Webhook URL" completa
# 5. Valida que está correcta
# 6. Verifica que workflow tiene toggle ACTIVADO (verde)
```

### Deploy no aparece en Cloudflare
**Causa:** Tarda en indexarse o error en hook
```bash
# Esperar 30 segundos
# Recargar Dashboard (F5)
# Revisar n8n logs:
#   → Workflow → Pestaña "Execution"
#   → Ver el último execution
#   → Expandir nodo "Trigger Deploy Hook"
#   → Ver response completo
```

### deploy_events no tiene rows
**Causa:** Colección no existe o Nodo 5 falla
```bash
# Verificar tabla existe
docker exec -it postgres psql -U postgres -d pure24 -c "\dt deploy_events"

# Si no existe, crear:
docker exec -it postgres psql -U postgres -d pure24 < scripts/create-deploy-events-table.sql

# Revisar n8n logs del Nodo 5 (Log Deploy Event)
# Verificar DIRECTUS_API_KEY válida
```

## 📈 TIMELINE ESPERADO

| Evento | Tiempo | Status |
|--------|--------|--------|
| Compra realizada | T+0s | - |
| Stock reducido (FASE 6.1) | T+5s | ✅ |
| Webhook en n8n dispara | T+10s | ✅ |
| Deploy Hook a Cloudflare | T+15s | POST 200 OK |
| Cloudflare inicia rebuild | T+20s | Status: In progress |
| Rebuild completado | T+2min | Status: Active |
| Sitio online y actualizado | T+2:30 | ✅ |

## 📋 CHECKLIST QUICK

```bash
# 1. Deploy Hook URL obtenida
echo "CF_DEPLOY_HOOK_URL: $CF_DEPLOY_HOOK_URL"

# 2. deploy_events tabla existe
docker exec -it postgres psql -U postgres -d pure24 -c "\dt deploy_events"

# 3. Variables en .env
grep CF_DEPLOY_HOOK_URL .env

# 4. n8n workflow existe y está ACTIVADO
curl -s "http://localhost:5678/api/v1/workflows" | jq '.data[] | select(.name | contains("Deploy"))'

# 5. Crear orden test
DIRECTUS_URL="http://localhost:8055"
DIRECTUS_API_KEY="..."
# ... (ver comando arriba)

# 6. Disparar webhook
# ... (ver comando arriba)

# 7. Esperar 2 minutos

# 8. Validar en Cloudflare Dashboard
# https://dash.cloudflare.com → Pages → pure24-nutrition → Deployments

# 9. Validar en Directus
curl -s "http://localhost:8055/api/items/deploy_events?sort=-created_at&limit=1" \
  -H "Authorization: Bearer $DIRECTUS_API_KEY" | jq '.data[0]'
```

## 🔐 SEGURIDAD

### API Keys
- ✅ Guardar en `.env` (git-ignored)
- ✅ No commits de `.env`
- ✅ Usar variables de entorno en n8n
- ❌ No hardcodear en nodos

### Deploy Hook URL
- ✅ URL contiene Account ID + Hook ID (secreto)
- ✅ Guardar en .env
- ✅ Usar en n8n como variable de entorno
- ❌ No publicar públicamente

### Webhook n8n
- ✅ URL única por workflow
- ✅ Método POST con validación de SKU
- ✅ Logs en deploy_events para auditoría
- ❌ Sin autenticación (usar IP whitelist en VPS)

## 📚 REFERENCIAS

- [Cloudflare Pages Deploy Hooks](https://developers.cloudflare.com/pages/platform/deploy-hooks/)
- [n8n Webhook Documentation](https://docs.n8n.io/features/webhooks/)
- [Directus API Documentation](https://docs.directus.io/reference/api/)

## 🎯 FASES RELACIONADAS

- **FASE 6.1:** Stock Sync (reduce stock en Directus)
- **FASE 6.2:** GA4 Analytics (envia evento server-side)
- **FASE 6.3:** Email Transaccionales (envía confirmación)
- **FASE 6.4:** Deploy Automático (redeploy sitio) ← ESTA
- **FASE 6.7:** Documentación Final

---

**Última actualización:** 2025-03-09
**Estado:** ✅ Documentación Completa
