# FASE 6.4: n8n WORKFLOW GUIDE

## 📋 OVERVIEW

Tu n8n está en VPS. Necesitas:
1. Importar workflow JSON
2. Configurar variables de entorno
3. Activar workflow
4. Testar

## 🔗 ACCESO A N8N

**URL:** `https://tu-dominio-n8n.com:5678` (o según tu configuración)

## 📥 OPCIÓN 1: IMPORTAR WORKFLOW JSON (RECOMENDADO)

### Paso a paso:

1. **Abrir n8n**
   - URL: Tu dominio de n8n
   - Login con tu usuario

2. **Ir a Workflows**
   - Menu (izquierda) → "Workflows"

3. **Crear nuevo workflow**
   - Click botón "New Workflow" (arriba derecha)

4. **Importar archivo**
   - Menu (⋯ arriba derecha) → "Import from file"
   - Seleccionar: `FASE_6_4_N8N_WORKFLOW.json`
   - Click "Import"

5. **Resultado**
   - Ves 5 nodos ya conectados:
     ```
     Webhook Trigger → Fetch Stock → Deploy Hook → Verify → Log Event
     ```

## 🔧 CONFIGURAR VARIABLES DE ENTORNO

### En tu VPS (donde corre n8n):

```bash
# Editar .env de n8n
sudo nano /etc/systemd/system/n8n.service
# O si usas Docker:
docker exec -it n8n sh -c 'env | grep CF_DEPLOY'

# Agregar variable:
export CF_DEPLOY_HOOK_URL="https://api.cloudflare.com/client/v4/accounts/XXX/pages/projects/pure24-nutrition/deployments/hooks/YYY/trigger"

# Si usas Docker:
docker stop n8n
docker run -d \
  -e CF_DEPLOY_HOOK_URL="https://api.cloudflare.com/..." \
  -e DIRECTUS_API_KEY="dirk_..." \
  n8nio/n8n
```

## 🟢 ACTIVAR WORKFLOW

### En n8n UI:

1. **Abre el workflow importado**
2. **Esquina superior derecha: botón toggle "Activate"**
3. **Debe cambiar a verde** → Status: "This workflow is now active"

## 🧪 OBTENER WEBHOOK URL

### Para testar:

1. **En el workflow, click en primer nodo: "Webhook Trigger"**
2. **Pestaña "Test"**
3. **Copiar "Webhook URL"** (formato: `https://tu-n8n.com/webhook/stock-change`)
4. Esta URL es la que usas para disparar test en PASO 8

## 🧩 ESTRUCTURA DE NODOS

### Nodo 1: Webhook Trigger
```
Type: Webhook
Method: POST
Path: stock-change
Body esperado:
{
  "sku": "P24N-WHEY-500",
  "quantity": 1,
  "reason": "test"
}
```

### Nodo 2: Fetch Stock Actual
```
Type: HTTP Request
Method: GET
URL: http://localhost:8055/api/items/products?filter[sku][_eq]={{$json.sku}}
Headers:
  Authorization: Bearer {{$env.DIRECTUS_API_KEY}}
```

### Nodo 3: Trigger Deploy Hook (CRÍTICO)
```
Type: HTTP Request
Method: POST
URL: {{$env.CF_DEPLOY_HOOK_URL}}
Body: {} (vacío)
Headers: (ninguno)
Response esperada:
  Status: 200
  Body: {"success": true, "id": "deploy-xyz"}
```

### Nodo 4: Verify Deploy Started
```
Type: Code (JavaScript)
Code:
return {
  status_code: 200,
  deploy_started: true,
  triggered_at: new Date().toISOString()
};
```

### Nodo 5: Log Deploy Event
```
Type: HTTP Request
Method: POST
URL: http://localhost:8055/api/items/deploy_events
Headers:
  Authorization: Bearer {{$env.DIRECTUS_API_KEY}}
Body (JSON):
{
  "event_type": "stock_change_deploy",
  "stock_sku": "{{$json.sku}}",
  "deploy_started": true,
  "provider": "cloudflare",
  "status_code": 200,
  "triggered_at": "{{$json.triggered_at}}"
}
```

## 🧪 TESTAR NODO A NODO

### Método 1: Test en UI

1. **Abre workflow**
2. **Click en "Webhook Trigger"**
3. **Pestaña "Test"**
4. **Sección "Test the node"**
5. **Ingresa JSON test:**
   ```json
   {
     "sku": "P24N-WHEY-500",
     "quantity": 1
   }
   ```
6. **Click "Execute node"**
7. Ves resultado abajo

### Método 2: Test con curl

```bash
WEBHOOK_URL="https://tu-n8n.com/webhook/stock-change"

curl -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "sku": "P24N-WHEY-500",
    "quantity": 1
  }'
```

## 📊 REVISAR EXECUTION LOGS

### Ver si workflow se ejecutó:

1. **Workflow → Pestaña "Execution"**
2. **Ver lista de ejecuciones**
3. **Click en execution más reciente**
4. **Ver cada nodo:**
   - Verde ✅ = Success
   - Rojo ❌ = Error
   - Click en nodo → ver Input/Output

## 🔐 VARIABLES DE ENTORNO EN N8N

### Para usar `{{$env.VARIABLE}}`

En el nodo (cualquier campo):
- Click en el campo
- Expresión mode (fn con paréntesis)
- Escribe: `{{$env.CF_DEPLOY_HOOK_URL}}`

### Variables necesarias:

```
CF_DEPLOY_HOOK_URL = "https://api.cloudflare.com/..."
DIRECTUS_API_KEY = "dirk_abc123..."
```

## 🚨 ERRORES COMUNES

### Error: "Webhook URL not found"
- ❌ Nodo Webhook Trigger no está guardado
- ✅ Guardar workflow (Ctrl+S)
- ✅ Recargar página

### Error: "DIRECTUS_API_KEY is not defined"
- ❌ Variable de entorno no configurada en n8n
- ✅ Revisar n8n .env o docker run -e
- ✅ Reiniciar n8n

### Error: "Deploy Hook returned 401"
- ❌ CF_DEPLOY_HOOK_URL expirada o incorrecta
- ✅ Regenerar en Cloudflare Dashboard
- ✅ Actualizar variable en n8n

### Error: "Cannot POST to http://localhost:8055"
- ❌ Directus no está accessible desde n8n VPS
- ✅ Si Directus está en otra máquina, usar IP/domain
- ✅ Verificar firewall permite conexión

### Error: "Connection timeout"
- ❌ URL incorrecta o máquina no responde
- ✅ Testar curl desde VPS:
  ```bash
  curl https://api.cloudflare.com/... # Deploy Hook
  curl http://tu-directus:8055/api/items/products
  ```

## 📈 MONITOREO CONTINUO

### Después de activar:

1. **Ir a "Executions"**
2. **Debe haber ejecuciones cada vez que se dispara webhook**
3. **Revisar que todas sean Success ✅**
4. **Si hay Error ❌ → Click → Ver logs**

## 🛠️ DEBUGGEAR

### Agregar logs en nodo Code:

```javascript
// En Nodo 4 (Verify Deploy Started)
console.log("Starting deployment...");
console.log("Stock SKU:", $json.sku);

return {
  status_code: 200,
  deploy_started: true,
  triggered_at: new Date().toISOString()
};
```

Luego revisar en "Execution logs" del workflow.

## 📋 CHECKLIST FINAL N8N

```
[ ] Variables de entorno (CF_DEPLOY_HOOK_URL, DIRECTUS_API_KEY) configuradas
[ ] Workflow importado desde JSON
[ ] 5 nodos visibles en canvas
[ ] Nodos conectados en cadena correcta
[ ] Workflow guardado
[ ] Workflow ACTIVADO (toggle verde)
[ ] Webhook URL obtenida desde Nodo 1
[ ] Test ejecutado con curl o UI
[ ] Execution mostrada en Executions tab
[ ] Todos los nodos marcados Success ✅
[ ] Log creado en deploy_events (Directus)
```

## 🆘 SOPORTE

Si algo falla:
1. **Ver Execution logs** (siempre aquí está la respuesta)
2. **Expandir cada nodo** (Input/Output)
3. **Revisar error message completo**
4. **Comparar URL exactamente con formato esperado**

---

**Referencia:** FASE_6_4_CHECKLIST_PASO_A_PASO.md (PASO 5-6)
