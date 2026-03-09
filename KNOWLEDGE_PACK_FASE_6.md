# KNOWLEDGE PACK: FASE 6 - AUTOMATIZACIÓN POST-COMPRA
**Status:** ✅ COMPLETO
**Objetivo:** Automatizar toda la cadena post-compra: stock → deploy → email
**Timeline:** 2 minutos de compra a sitio actualizado

---

## 📚 DOCUMENTOS INCLUIDOS

### 1. **FASE_6_4_CHECKLIST_PASO_A_PASO.md** ⭐
   - **Qué:** Guía ejecutable paso a paso
   - **Para quién:** Tú (implementador)
   - **Contiene:** 10 pasos, 27 minutos, checklist final
   - **Uso:** Abre y sigue cada PASO secuencialmente

### 2. **FASE_6_4_N8N_WORKFLOW.json**
   - **Qué:** Workflow ya armado, listo para importar
   - **Para quién:** n8n (VPS)
   - **Contiene:** 5 nodos, conexiones, configuración
   - **Uso:** n8n UI → Import from file → seleccionar este archivo

### 3. **FASE_6_4_N8N_GUIDE.md**
   - **Qué:** Guía específica para n8n
   - **Para quién:** Tú (si tienes dudas con n8n)
   - **Contiene:** Acceso, workflow setup, debugging
   - **Uso:** Lee antes de PASO 5-6 del checklist

### 4. **FASE_6_4_REFERENCE.md**
   - **Qué:** Referencia rápida y comandos
   - **Para quién:** Tú (durante testing)
   - **Contiene:** Comandos útiles, troubleshooting, timeline
   - **Uso:** Consulta mientras ejecutas pasos

### 5. **scripts/create-deploy-events-table.sql**
   - **Qué:** Script SQL para tabla de auditoría
   - **Para quién:** PostgreSQL (Directus DB)
   - **Contiene:** CREATE TABLE deploy_events + índices
   - **Uso:** Ejecuta en PASO 2

### 6. **scripts/fase-6-4-setup.sh**
   - **Qué:** Script bash para automatizar setup
   - **Para quién:** Terminal/bash
   - **Contiene:** Pasos 1-4 automatizados
   - **Uso:** `./scripts/fase-6-4-setup.sh` (opcional)

### 7. **scripts/fase-6-4-test.sh**
   - **Qué:** Script bash para testing
   - **Para quién:** Terminal/bash
   - **Contiene:** Pasos 7-10 automatizados
   - **Uso:** `./scripts/fase-6-4-test.sh` (opcional)

---

## 🎯 FLUJO COMPLETO (FASES 6.1-6.4)

```
┌─────────────────────────────────────────────────────────────┐
│ COMPRA REALIZADA (Webhook IPN Mercado Pago)                │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓ T+5s
        ┌────────────────────────────────────┐
        │ FASE 6.1: Stock Sync ✅             │
        │ Reduce stock en Directus           │
        │ Status: COMPLETADA                 │
        └────────────┬───────────────────────┘
                     │
                     ↓ T+10s
        ┌────────────────────────────────────┐
        │ FASE 6.2: GA4 Analytics ✅          │
        │ Envia evento server-side            │
        │ Status: COMPLETADA                 │
        └────────────┬───────────────────────┘
                     │
                     ↓ T+15s
        ┌────────────────────────────────────┐
        │ FASE 6.4: Deploy Automático ✅      │
        │ (Webhook → n8n → Cloudflare)      │
        │ ← ESTA FASE (pasos 1-10)           │
        │ Status: LISTA PARA EJECUTAR        │
        └────────────┬───────────────────────┘
                     │
                     ↓ T+20s-120s
        ┌────────────────────────────────────┐
        │ Cloudflare rebuild iniciado        │
        │ Proceso: ~1-2 minutos              │
        └────────────┬───────────────────────┘
                     │
                     ↓ T+2min
        ┌────────────────────────────────────┐
        │ Sitio actualizado y ACTIVE ✅       │
        │ Stock reflejado en productos       │
        └────────────────────────────────────┘
```

---

## 📊 ARQUITECTURA TÉCNICA

```
WEBHOOK IPN (Mercado Pago)
    ↓
├─ FASE 6.1: Actualizar stock (Directus)
├─ FASE 6.2: Evento GA4 (Google Analytics)
├─ FASE 6.3: Email confirmación ⏳ (aún sin hacer)
│
└─ FASE 6.4: Deploy Automático
   ├─ Stock change event (Directus)
   │  └─ Webhook URL en n8n
   │
   ├─ n8n Workflow (5 nodos):
   │  1. Webhook Trigger (recibe event)
   │  2. Fetch Stock (valida datos)
   │  3. Trigger Deploy Hook (POST a Cloudflare)
   │  4. Verify Deploy (confirma que inició)
   │  5. Log Deploy Event (auditoría en Directus)
   │
   ├─ Cloudflare Pages
   │  ├─ Deploy Hook recibe POST
   │  ├─ Inicia rebuild automático
   │  └─ Sitio actualizado en 1-2 min
   │
   └─ Directus deploy_events table
      └─ Auditoría de todos los deploys
```

---

## 🚀 CÓMO USAR ESTE KNOWLEDGE PACK

### OPCIÓN A: Implementación Manual (Recomendado para aprender)

```
1. Lee: FASE_6_4_CHECKLIST_PASO_A_PASO.md
2. Ejecuta: PASO 1-10 en orden
3. Consulta: FASE_6_4_REFERENCE.md si tienes dudas
4. Debuggea: FASE_6_4_N8N_GUIDE.md si hay errores
```

**Tiempo:** ~27 minutos

### OPCIÓN B: Automatización Parcial

```
1. Ejecuta: ./scripts/fase-6-4-setup.sh (PASOS 1-4)
2. Manualmente: PASOS 5-6 en n8n UI
3. Ejecuta: ./scripts/fase-6-4-test.sh (PASOS 7-10)
```

**Tiempo:** ~15 minutos

### OPCIÓN C: Manual Total

```
1. Copiar Deploy Hook URL
2. Crear tabla SQL manualmente
3. Editar .env
4. Importar JSON en n8n
5. Testar workflow
```

**Tiempo:** ~10 minutos

---

## ⏰ TIMELINE ESPERADO

| Paso | Tarea | Tiempo | Acumulado |
|------|-------|--------|-----------|
| 1 | Copiar Deploy Hook | 1 min | 1 min |
| 2 | Crear tabla SQL | 3 min | 4 min |
| 3 | Config .env | 2 min | 6 min |
| 4 | Docker-compose | 2 min | 8 min |
| 5 | Crear nodos n8n | 5 min | 13 min |
| 6 | Guardar + Activar | 2 min | 15 min |
| 7 | Orden test | 2 min | 17 min |
| 8 | Disparar webhook | 3 min | 20 min |
| 9 | Validar Cloudflare | 5 min | 25 min |
| 10 | Validar Directus | 2 min | 27 min |

**TOTAL: ~27 minutos**

---

## ✅ CHECKLIST PRE-EJECUCIÓN

Antes de comenzar, verifica que tienes:

```
[ ] Deploy Hook URL de Cloudflare copiada
    → https://dash.cloudflare.com → Pages → pure24-nutrition → Settings → Deploy hooks

[ ] DIRECTUS_API_KEY (para acceder API)
    → Ve a Directus Settings → API tokens

[ ] PostgreSQL accesible (para crear tabla)
    → docker exec -it postgres psql -U postgres -d pure24 (o local)

[ ] n8n en VPS y accesible
    → https://tu-dominio-n8n.com:5678

[ ] Archivo .env en root del proyecto
    → C:\Users\danie\pure24-nutrition-ecommerce\.env

[ ] Este knowledge pack completo
    → 7 archivos + 1 carpeta scripts
```

---

## 🔐 VARIABLES NECESARIAS

```bash
# Estas necesitas obtener/configurar:

# 1. Deploy Hook URL (de Cloudflare)
CF_DEPLOY_HOOK_URL="https://api.cloudflare.com/client/v4/accounts/{ACCOUNT_ID}/pages/projects/pure24-nutrition/deployments/hooks/{HOOK_ID}/trigger"

# 2. Directus API Key
DIRECTUS_API_KEY="dirk_XXXXXXXXXXXX"

# 3. URLs (si no son localhost)
DIRECTUS_URL="http://localhost:8055"
N8N_URL="http://localhost:5678"
CLOUDFLARE_PROJECT="pure24-nutrition"
```

---

## 🚨 PUNTOS CRÍTICOS

### ❌ Errores que rompen todo:

1. **URL del Deploy Hook incorrecta**
   - Síntoma: 404 Not Found
   - Solución: Regenerar en Cloudflare Dashboard

2. **API Key expirada o inválida**
   - Síntoma: 401 Unauthorized
   - Solución: Generar nueva en Directus

3. **n8n workflow no ACTIVADO**
   - Síntoma: Webhook no dispara
   - Solución: Click toggle ACTIVADO (verde)

4. **Tabla deploy_events no existe**
   - Síntoma: Error 422 en Nodo 5
   - Solución: Ejecutar SQL script

### ✅ Validaciones importantes:

```bash
# Validar Deploy Hook funciona
curl -X POST "$CF_DEPLOY_HOOK_URL" -d '{}'
# Esperado: 200 OK

# Validar API Key
curl "$DIRECTUS_URL/api/items/products" \
  -H "Authorization: Bearer $DIRECTUS_API_KEY"
# Esperado: JSON con productos

# Validar tabla existe
docker exec postgres psql -U postgres -d pure24 -c "\dt deploy_events"
# Esperado: deploy_events (tabla)

# Validar workflow activo
curl "$N8N_URL/api/v1/workflows"
# Esperado: JSON con workflows
```

---

## 📖 DOCUMENTACIÓN ADICIONAL

### Para Cloudflare Pages:
- [Deploy Hooks Docs](https://developers.cloudflare.com/pages/platform/deploy-hooks/)
- Tutorial: Crear Deploy Hook sin código

### Para n8n:
- [Webhook Documentation](https://docs.n8n.io/features/webhooks/)
- [HTTP Request Node](https://docs.n8n.io/integrations/nodes/n8n-nodes-base.httpRequest/)

### Para Directus:
- [API Reference](https://docs.directus.io/reference/api/)
- [Authentication](https://docs.directus.io/reference/authentication/)

---

## 🎯 VALIDACIÓN FINAL (GATE 6)

Una vez completada FASE 6.4, valida que TODOS estos checks funcionan:

```
[ ] FASE 6.1: Stock se reduce automáticamente
    → Crear orden → Ver stock reducido en Directus

[ ] FASE 6.2: Evento GA4 enviado server-side
    → Revisar GA4 events → Debe haber purchase event

[ ] FASE 6.3: Email de confirmación recibido ⏳
    → Revisar inbox → Debe llegar email

[ ] FASE 6.4: Deploy automático se dispara
    → Cloudflare Dashboard → Deployment visible ✅

[ ] Sitio reflejado en < 5 minutos
    → Ir a https://pure24nutrition.pages.dev
    → Stock debe estar actualizado
```

Si todos ✅ → **PHASE 6.7: Documentación Final & Handoff**

---

## 📝 PRÓXIMAS FASES

### FASE 6.3: Email Transaccionales ⏳
- Setup SendGrid o Resend
- Template de confirmación
- Webhook en Mercado Pago para trigger
- Testing

### FASE 6.7: Documentación Final
- Runbook de operaciones
- Monitoreo y alertas
- Backup procedures
- Disaster recovery

### FASE 7: Production Deploy
- Vercel/Cloudflare setup
- Railway/Railway deploy
- SSL certificates
- DNS configuración

---

## 🆘 SOPORTE

Si algo no funciona:

1. **Abre FASE_6_4_REFERENCE.md** → Troubleshooting section
2. **Revisa n8n Execution logs** → Aquí está siempre la respuesta
3. **Valida variables de entorno** → `echo $CF_DEPLOY_HOOK_URL`
4. **Compara exactamente URLs** → Copia/pega, no escribas a mano

---

## 📦 CONTENIDO DEL PACKAGE

```
KNOWLEDGE_PACK_FASE_6.md
├── Este archivo (overview y guía)
│
├── FASE_6_4_CHECKLIST_PASO_A_PASO.md ⭐
│   └── 10 pasos ejecutables
│
├── FASE_6_4_N8N_GUIDE.md
│   └── Guía específica para n8n
│
├── FASE_6_4_REFERENCE.md
│   └── Comandos y troubleshooting
│
├── FASE_6_4_N8N_WORKFLOW.json
│   └── Workflow importable
│
└── scripts/
    ├── create-deploy-events-table.sql
    │   └── Script SQL
    ├── fase-6-4-setup.sh
    │   └── Automatiza PASOS 1-4
    └── fase-6-4-test.sh
        └── Automatiza PASOS 7-10
```

---

## 🎬 COMIENZA AHORA

```
1. Abre: FASE_6_4_CHECKLIST_PASO_A_PASO.md
2. Lee PASO 1
3. Sigue cada paso en orden
4. Avisame cuando termines cada PASO para validar
```

**¿Listo?** 🚀

---

**Generado:** 2025-03-09
**Status:** ✅ Knowledge Pack Completo
**Próximo:** Ejecutar PASOS 1-10
