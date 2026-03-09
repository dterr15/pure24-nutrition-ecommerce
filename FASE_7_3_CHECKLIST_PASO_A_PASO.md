# FASE 7.3: MONITOREO Y ALERTAS - GUÍA PASO-A-PASO

**Duración:** 45-60 minutos
**Status:** Listo para ejecutar
**Objetivo:** Sistema de monitoreo inteligente 24/7 para Pure24 Nutrition

---

## 🎯 RESUMEN

Implementar 7 servicios de monitoreo integrados:

| Servicio | Función | Alerta |
|----------|---------|--------|
| Google Jules AI | Uptime + Performance | Email/PR automático |
| Cloudflare Analytics | TTFB monitoreo | Email si > 100ms |
| GA4 Monitoring | Conversiones | Email si baja |
| n8n Workflows | Automaciones | Email si falla |
| Data Studio | Dashboard centralizado | Visual |
| Email Alertas | Notificaciones unificadas | Gmail folder |
| Tests | Verificación | Manual |

---

## 🤖 PASO 1: GOOGLE JULES AI (UPTIME MONITORING) - 15 MIN

### ¿Qué es?

Agente IA que monitorea tu sitio cada 5 minutos:
- ✅ Verifica: HTTP 200, TTFB, errores, backend
- ✅ Si hay problema: Email + PR automático con fix
- ✅ Histórico: Todo en repo GitHub
- ✅ Sin herramientas externas: Integrado en Google Cloud

### Setup

#### 1. Google Cloud Project

```bash
# Opción A: CLI (si tienes gcloud instalado)
gcloud projects create pure24-monitoring
gcloud config set project pure24-monitoring
gcloud services enable julesday-api.googleapis.com

# Opción B: Via Console
# 1. Ir a: https://console.cloud.google.com
# 2. Click: "+ Create Project"
# 3. Nombre: pure24-monitoring
# 4. Create
# 5. En search: "Jules"
# 6. Click: "Jules AI API"
# 7. Click: "Enable"
```

#### 2. Service Account (para GitHub Actions)

```bash
# Via Console:
# 1. Google Cloud Console
# 2. IAM & Admin → Service Accounts
# 3. Click: "+ Create Service Account"
# 4. Nombre: jules-ci
# 5. Grant role: Editor (para poder crear PRs)
# 6. Click: "Create and Continue"
# 7. Click: "Create key" → JSON
# 8. Download JSON file
# 9. Copiar contenido para GitHub secrets
```

#### 3. GitHub Workflow

Crear `.github/workflows/jules-monitoring.yml`:

```yaml
name: Jules AI Monitoring

on:
  schedule:
    - cron: '*/5 * * * *'  # Cada 5 minutos
  workflow_dispatch:

jobs:
  monitor:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Run Jules Monitoring
        uses: google-cloud/jules-ai@v1
        with:
          project-id: ${{ secrets.GCP_PROJECT_ID }}
          service-account-key: ${{ secrets.GCP_SERVICE_ACCOUNT_KEY }}
          monitoring-config: .github/julius-config.json

      - name: Create Issue on Failure
        if: failure()
        uses: actions/create-issue@v2
        with:
          title: "🚨 Jules AI detected issue"
          body: "Check workflow logs for details"
```

#### 4. Monitoring Config

Crear `.github/julius-config.json`:

```json
{
  "targets": [
    {
      "url": "https://pure24nutrition.cl",
      "name": "Pure24 Homepage",
      "checks": {
        "http_status": 200,
        "ttfb_ms": 100,
        "response_time_ms": 500,
        "error_rate": 0.01
      },
      "alerts": {
        "email": "alertas@pure24.com",
        "create_pr": true,
        "severity": "critical"
      }
    },
    {
      "url": "http://localhost:8055/health",
      "name": "Directus Backend Health",
      "checks": {
        "http_status": 200
      },
      "alerts": {
        "email": "alertas@pure24.com",
        "severity": "critical"
      }
    }
  ],
  "schedule": "*/5 * * * *",
  "retention_days": 90
}
```

#### 5. GitHub Secrets

En GitHub repo:
1. **Settings** → **Secrets and variables** → **Actions**
2. Agregar secrets:
   - `GCP_PROJECT_ID`: tu-project-id
   - `GCP_SERVICE_ACCOUNT_KEY`: (pegar JSON completo)

#### 6. Verificar

```bash
# Commit y push
git add .github/
git commit -m "feat: setup Jules AI monitoring"
git push origin main

# Verificar en GitHub
# Actions → Jules AI Monitoring → debe haber ejecutado
```

✅ **PASO 1 COMPLETADO** cuando ves ejecuciones cada 5 minutos en GitHub Actions

---

## 📊 PASO 2: CLOUDFLARE ANALYTICS (TTFB) - 5 MIN

### Acceder Analytics

1. **Cloudflare Dashboard:** https://dash.cloudflare.com
2. **Seleccionar:** pure24nutrition.cl
3. **Lado izquierdo:** Analytics → Overview

### Ver TTFB

```
Esperado:
- TTFB: < 100ms (muy rápido)
- Requests: cantidad de requests hoy
- Data transferred: bandwidth
- Page views: cantidad de visits
```

### Crear Alerta TTFB

1. **Notifications** (campana icon)
2. **Click:** "+ Add notification"
3. **Configurar:**
   - Notification Name: `TTFB Alert`
   - Trigger: `Performance Alert`
   - Metric: `Time to First Byte`
   - Operator: `greater than`
   - Value: `100` (milliseconds)
4. **Notification channels:**
   - Click: "+ Add"
   - Type: `Email`
   - Email: tu@correo.com
5. **Click:** Save

### Verificar TTFB Local

```bash
curl -w "TTFB: %{time_starttransfer}s\n" -o /dev/null -s https://pure24nutrition.cl
# Esperado: TTFB: 0.050-0.100s
```

✅ **PASO 2 COMPLETADO** cuando alerta está configurada y activa

---

## 📈 PASO 3: GA4 MONITORING (CONVERSIONES) - 10 MIN

### Acceder GA4

1. **Google Analytics:** https://analytics.google.com
2. **Login** con Google account
3. **Seleccionar:** pure24nutrition
4. **Click:** Reports

### Ver Compras

1. **Reports** → **Engagement** → **Events**
2. **Buscar evento:** `purchase`
3. **Ver:**
   - Cantidad de compras hoy
   - Usuarios únicos compraron
   - Ingresos totales

### Crear Alerta Conversiones

1. **Admin** → **Alerts**
2. **Click:** "+ Create alert"
3. **Configurar:**
   - Alert name: `Low Conversion Rate`
   - Applies to: `pure24nutrition`
   - Metric: `Conversion rate`
   - Condition: `drops below`
   - Threshold: `2%` (o tu baseline)
4. **Notification channels:**
   - Click: "+ Add"
   - Type: `Email`
   - Email: alertas@pure24.com
5. **Click:** Create

### Dashboard GA4

1. **Click:** "+ Create" (Reports)
2. **New dashboard**
3. **Nombre:** Pure24 Sales Dashboard
4. **Agregar visualizaciones:**
   - Card: Compras de hoy
   - Pie chart: Compras por fuente
   - Line chart: Ingresos por día
5. **Guardar**

✅ **PASO 3 COMPLETADO** cuando dashboard muestra datos y alerta está activa

---

## ⚙️ PASO 4: n8n WORKFLOW MONITORING - 10 MIN

### Revisar Estado Diario

1. **n8n:** http://localhost:5678
2. **Workflows:**
   - Stock Update Atomic
   - GA4 Events Tracking
   - Email de Confirmación
   - Deploy Automático

Para cada workflow:

```
1. Click en workflow
2. Ver: "Last run" (debe ser hace < 1 hora)
3. Status: debe ser "Active"
4. Click: "Logs" tab
5. Ver último log:
   - Status: Success ✅ o Error ❌
   - Si Error, leer mensaje
```

### Agregar Notificación de Error

Para cada workflow, agregar alerta:

1. **En el workflow:** Click en último nodo
2. **Agregar nodo:** "Send Email"
3. **Configurar:**
   - To: `alertas@pure24.com`
   - Subject: `[n8n] Workflow X fallo`
   - Body: `Status: {{execution.status}}`
4. **Settings:** "Execute only on error"
5. **Guardar workflow**

### Verificar Logs Directus

```bash
# En Directus local: http://localhost:8055
# Collections → audit_logs
# Filtrar por: severity = critical
# Si hay errores, leerlos
```

✅ **PASO 4 COMPLETADO** cuando todos los workflows están Active y tienen notificaciones

---

## 📊 PASO 5: DASHBOARD CENTRALIZADO (DATA STUDIO) - 15 MIN

### Crear Report

1. **Google Data Studio:** https://datastudio.google.com
2. **Click:** "+ Create" → Report
3. **Nombre:** `Pure24 Nutrition Dashboard`
4. **Blank report**

### Agregar Data Sources

#### Google Analytics

1. **Click:** "+ Data source"
2. **Type:** `Google Analytics 4`
3. **Select:** `pure24nutrition`
4. **Create data source**

#### Manual (CSV)

1. **Click:** "+ Data source"
2. **Type:** `Google Sheets`
3. **Create new sheet**
4. **Importar datos desde:**
   - Cloudflare Analytics (CSV export)
   - Uptime Robot (CSV export)

### Agregar Visualizaciones

1. **Layout:** Blank
2. **Agregar cards:**

**Card 1: Uptime %**
- Type: `Scorecard`
- Metric: Manual input (revisar Uptime Robot)
- Format: Percentage
- Green si > 99.5%

**Card 2: TTFB Promedio**
- Type: `Scorecard`
- Metric: Manual input (Cloudflare Analytics)
- Format: Duration (ms)
- Target: < 100ms

**Card 3: Compras Hoy**
- Type: `Scorecard`
- Metric: `Event count` (filtered by purchase)
- Data source: GA4

**Card 4: Conversion Rate**
- Type: `Scorecard`
- Metric: `Conversion rate`
- Data source: GA4
- Format: Percentage

**Card 5: Workflow Health**
- Type: `Table`
- Manual: status de cada workflow
- Columns: Workflow, Status, Last Run

### Guardar y Compartir

1. **Click:** "Save"
2. **Click:** "Share"
3. **Type:** "Anyone with the link"
4. **Copy URL**
5. **Compartir con equipo**

Dashboard se auto-actualiza cada hora ✅

✅ **PASO 5 COMPLETADO** cuando dashboard tiene 5+ visualizaciones y es accesible

---

## 📧 PASO 6: CONFIGURAR EMAIL ALERTAS - 5 MIN

### Agregar a Safelist

En tu email, agregar a contactos:
- `alerts@pure24.com` (n8n)
- `noreply@cloud.google.com` (Jules AI)
- `noreply@cloudflare.com` (Cloudflare)
- `noreply@google.com` (GA4)

### Crear Folder "Alerts"

1. **Gmail:** https://mail.google.com
2. **Click:** "+ Create label"
3. **Nombre:** `Alerts`
4. **Settings** → **Filters and Blocked Addresses**
5. **Create filter:**
   - From: `alerts@pure24.com` OR `noreply@cloud.google.com` OR...
   - Apply label: `Alerts`
   - Archive (para no llenar inbox)

### Revisar Diariamente

```
Cada mañana:
1. Gmail → Alerts folder
2. Ver si hay nuevas alertas
3. Si hay crítica: revisar servicio
4. Si es falsa alerta: ignorar
```

✅ **PASO 6 COMPLETADO** cuando emails llegan a folder "Alerts"

---

## ✓ PASO 7: VERIFICAR MONITOREO COMPLETO - 5 MIN

### Test 1: Jules AI

```bash
# GitHub Actions
# 1. Ir a: https://github.com/your-org/pure24-nutrition
# 2. Click: Actions → Jules AI Monitoring
# 3. Debe haber ejecuciones cada 5 minutos
# 4. Última ejecución: debe mostrar "Success"
```

### Test 2: Cloudflare Analytics

```bash
# Ver TTFB en tiempo real
curl -w "TTFB: %{time_starttransfer}s\n" -o /dev/null -s https://pure24nutrition.cl
# Esperado: 0.050-0.100s
```

### Test 3: GA4

```
# Google Analytics
# Reports → Events → purchase
# Debe mostrar datos de hoy (si hay tráfico)
```

### Test 4: n8n

```bash
# n8n: http://localhost:5678
# Workflows → todos deben estar "Active"
# Logs → última ejecución hace < 1 hora
```

### Test 5: Dashboard

```
# Google Data Studio
# Abrir link compartido
# Verificar que carga
# Campos pueden estar vacíos si es primer día
```

✅ **PASO 7 COMPLETADO** cuando todos los tests pasan

---

## ✅ CHECKLIST FINAL

```
PASO 1: Google Jules AI
[ ] Google Cloud Project creado
[ ] Service Account con JSON key
[ ] .github/workflows/jules-monitoring.yml creado
[ ] .github/julius-config.json creado
[ ] GitHub secrets configurados
[ ] Ejecuciones visibles cada 5 minutos en Actions

PASO 2: Cloudflare Analytics
[ ] Analytics accesible en Dashboard
[ ] TTFB visible (esperado < 100ms)
[ ] Alerta TTFB configurada
[ ] Email alerta funciona

PASO 3: GA4 Monitoring
[ ] GA4 muestra evento "purchase"
[ ] Dashboard con KPIs creado
[ ] Alerta conversion rate configurada
[ ] Email alerta funciona

PASO 4: n8n Workflows
[ ] Todos los workflows están "Active"
[ ] Logs muestran ejecuciones recientes
[ ] Notificaciones de error configuradas
[ ] Audit logs accesibles en Directus

PASO 5: Dashboard Data Studio
[ ] Report creado
[ ] 5+ visualizaciones agregadas
[ ] Data sources configuradas
[ ] Dashboard compartible

PASO 6: Email Alertas
[ ] Addresses en safelist
[ ] Folder "Alerts" creado
[ ] Filtros configurados
[ ] Emails llegan a folder

PASO 7: Verificación
[ ] Jules AI ejecución visible
[ ] TTFB < 100ms
[ ] GA4 datos correctos
[ ] n8n workflows active
[ ] Dashboard carga
```

---

## 📈 KPIs EN EL DASHBOARD

Después de completar, tu dashboard debe mostrar:

```
UPTIME
└─ % uptime último mes (meta: > 99.5%)

PERFORMANCE
└─ TTFB promedio hoy (meta: < 100ms)

CONVERSIONES
├─ Compras hoy (número)
├─ Conversion rate % (meta: tu baseline)
└─ Ingresos totales

WORKFLOW HEALTH
├─ Stock Update: ✅ OK
├─ GA4 Tracking: ✅ OK
├─ Email Send: ✅ OK
└─ Deploy Auto: ✅ OK
```

---

## 🚨 TROUBLESHOOTING

### Jules AI no ejecuta

```
Causa: GitHub Actions deshabilitado
Solución:
1. GitHub → Settings → Actions
2. Click: "Allow all actions"
3. Re-run workflow manualmente
```

### Alertas no llegan a email

```
Causa: Email va a spam
Solución:
1. Buscar en spam folder
2. Marcar como "Not spam"
3. Agregar a contacts
4. Crear filtro en Gmail
```

### TTFB alto

```
Causa: Backend lento o Cold start
Solución:
1. Verificar Directus está corriendo
2. Segundo request debería ser < 50ms
3. Si persiste, revisar código
```

### GA4 no muestra datos

```
Causa: Evento no está disparando
Solución:
1. En n8n, verificar GA4 Events Tracking workflow
2. Logs deben mostrar "GA4 event sent"
3. En GA4, usar DebugView para ver eventos en tiempo real
```

---

## 🎓 RESULTADO FINAL

```
Pure24 Nutrition - Sistema Monitoreo Completo

🤖 Jules AI
├─ Monitorea: pure24nutrition.cl cada 5 min
├─ Verifica: HTTP, TTFB, backend health
├─ Alerta: Email + PR automático
└─ Histórico: En repo GitHub

📊 Data Studio Dashboard
├─ KPIs centralizados
├─ Auto-refresh cada hora
├─ Compartible con equipo
└─ Histórico 90 días

📧 Email Alertas
├─ Unified inbox
├─ Folder "Alerts"
├─ Revisar diariamente
└─ Sin ruido, solo críticos

✅ Resultado: Visibilidad operativa 24/7
             Respuestas automáticas a problemas
             Histórico para análisis
```

---

**Status:** 📋 Knowledge Pack Completado
**Próximo:** Documentación Final
**Final:** Sistema LIVE en producción ✅
