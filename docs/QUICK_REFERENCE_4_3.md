# PARTE 4.3 - Quick Reference

## 5 Minutos: Qué fue creado

```
✅ Email Service (750 líneas)          - Maneja todos los emails
✅ Webhook Handler (400 líneas)         - Recibe pagos de Mercado Pago
✅ Server Integration (modificado)      - Registra webhook y email
✅ 3 Scripts (test, setup, verificación) - Tools de desarrollo
✅ 4 Documentos (completos, paso a paso) - Guías de referencia
```

## Archivo por Archivo

| Archivo | Función | Líneas | Modificar? |
|---------|---------|--------|-----------|
| `backend/services/email.service.ts` | Enviar emails transaccionales | 750 | Solo ENV vars |
| `backend/webhooks/mercadopago.webhook.ts` | Procesar pagos | 400 | Solo ENV vars |
| `backend/server.ts` | Registrar webhook + email | ~60 | Ya hecho ✅ |
| `backend/.env.example` | Variables template | - | Copiar a `.env.local` |
| `scripts/test-webhook.ts` | Simular webhook | 200 | Usar como-está |
| `scripts/setup-webhook.ts` | Verificar setup | 200 | Usar como-está |

## Instalación: 3 Pasos

```bash
# 1. Dependencias
npm install nodemailer

# 2. Variables de entorno
cp backend/.env.example backend/.env.local
# Editar con tus valores (SMTP host, API keys, etc.)

# 3. Verificar
npm run setup:webhook
```

## Usar: 2 Métodos

### Método A: Backend Endpoint (Recomendado)

```typescript
// En CheckoutForm.tsx
const orderResponse = await fetch('/api/orders', {
  method: 'POST',
  body: JSON.stringify({
    orderNumber: 'ORD-...',
    customerEmail: 'user@example.com',
    // ... resto de datos
  })
});

// Backend automáticamente:
// ✅ Crea orden en Payload
// ✅ Envía email de confirmación
// ✅ Retorna orderNumber
```

### Método B: Webhook Automático

```typescript
// Cuando Mercado Pago paga:
// POST /api/webhooks/mercadopago
// ↓
// ✅ Webhook recibe notificación
// ✅ Busca orden por external_reference
// ✅ Actualiza status (paid → processing)
// ✅ Envía email de pago confirmado
```

## 5 Tipos de Email

| Email | Cuándo | Enviado por |
|-------|--------|------------|
| #1 📋 Confirmación | Checkout completado | `emailService.sendOrderConfirmation()` |
| #2 ✅ Pago confirmado | Webhook `payment.approved` | `emailService.sendPaymentReceived()` |
| #3 📦 Preparando | 5s después de pago | `emailService.sendProcessingNotification()` |
| #4 🚚 En camino | Admin agrega tracking | `emailService.sendShippingNotification()` |
| #5 ⚠️ Pago fallido | Webhook `payment.rejected` | `emailService.sendPaymentFailed()` |

## Estados de Orden

```
pending
  ↓
[Pago aprobado en Mercado Pago]
  ↓
paid (webhook automático)
  ↓ (5 segundos después)
processing (webhook automático)
  ↓
shipped (admin actualiza tracking)
  ↓
delivered (admin confirma entrega)
```

## Testing Rápido

```bash
# Terminal 1: Servidor
npm run dev:backend

# Terminal 2: Simular webhook
npm run test:webhook -- --status approved

# Terminal 3: Ver emails
open http://localhost:8025  # MailHog

# Verificar:
✅ Logs muestran "✅ Pago aprobado"
✅ Emails en MailHog: 2 (pago confirmado + preparando)
✅ Orden en Payload: status = processing
```

## Troubleshooting Rápido

| Error | Solución |
|-------|----------|
| "Cannot find module 'nodemailer'" | `npm install nodemailer` |
| Webhook returns 404 | Verificar `server.ts` tiene `app.post('/api/webhooks/mercadopago', ...)` |
| Emails no llegan | ¿Está `emailService.initialize()` en `server.ts`? |
| "Email transporter no inicializado" | `await emailService.initialize()` en `start()` |
| MailHog no abre | `brew install mailhog && mailhog` luego `http://localhost:8025` |

## Flujo Completo: 6 Pasos

```
1. Cliente completa checkout
   ↓ POST /api/orders

2. Backend crea orden + envía email #1
   ↓ Retorna orderNumber

3. Frontend redirige a Mercado Pago
   ↓ (external_reference = orderNumber)

4. Cliente paga en Mercado Pago
   ↓

5. Mercado Pago envía webhook
   ↓ POST /api/webhooks/mercadopago

6. Backend:
   - Busca orden por orderNumber
   - Actualiza status: pending → paid → processing
   - Envía emails #2 y #3
```

## Comandos Útiles

```bash
# Instalar dependencias
npm install nodemailer @sendgrid/mail resend

# Verificar setup
npm run setup:webhook

# Test webhook (pago aprobado)
npm run test:webhook

# Test webhook (pago rechazado)
npm run test:webhook -- --status rejected

# Iniciar servidor con reload
npm run dev:backend

# Ver logs en tiempo real
tail -f backend.log | grep -E "✅|❌|📧"
```

## Enviroment Variables: Debe-Tener

```bash
MERCADOPAGO_ACCESS_TOKEN=APP_USR_...
PAYLOAD_SECRET=tu_secret
EMAIL_PROVIDER=smtp|sendgrid|resend
EMAIL_FROM=noreply@pure24.cl

# Si SMTP:
SMTP_HOST=smtp.gmail.com  # o localhost para MailHog
SMTP_PORT=587|1025
SMTP_USER=...
SMTP_PASSWORD=...

# Si SendGrid:
SENDGRID_API_KEY=SG...

# Si Resend:
RESEND_API_KEY=re_...
```

## Documentos de Referencia

| Documento | Para qué |
|-----------|----------|
| `PARTE_4_3_WEBHOOKS_EMAIL.md` | Documentación técnica completa |
| `IMPLEMENTACION_4_3.md` | Paso a paso de instalación |
| `INTEGRACION_EMAIL_CHECKOUT.md` | Cómo integrar en CheckoutForm |
| `RESUMEN_PARTE_4_3.md` | Overview de alto nivel |
| `QUICK_REFERENCE_4_3.md` | Este documento (rápido) |

## Mercado Pago: Setup Webhook

```
1. Ir a: https://www.mercadopago.com.ar/developers
2. Dashboard → Configuración → Webhooks
3. Crear webhook:
   - URL: https://api.pure24.cl/api/webhooks/mercadopago
   - Eventos: payment.created, payment.updated
4. Usar external_reference para encontrar orden:
   external_reference = orderNumber (ej: ORD-20260308-123)
```

## Próximos Pasos

✅ PARTE 4.3 Completo
→ **PARTE 4.4 - Producción** (Deploy a Vercel + Railway)
→ **FASE 5** (Dashboard admin)
→ **Productización** (Config extract + CLI)

---

**Creado:** 2026-03-08
**Status:** ✅ LISTO PARA USAR
**Tiempo setup:** ~30 minutos
**Siguiente:** PARTE 4.4 - Production Deploy
