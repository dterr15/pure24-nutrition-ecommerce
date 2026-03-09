# PARTE 4.3 - Webhooks + Email Transaccionales

## Overview

Sistema profesional de webhooks y email transaccionales para Pure24:

- **Webhook Handler**: Recibe notificaciones de Mercado Pago
- **Email Service**: Maneja 5 tipos de emails transaccionales
- **Order Updates**: Automáticamente actualiza estado de órdenes
- **Dev Mode**: Simula webhooks sin necesidad de Internet pública
- **Prod Mode**: Integración real con Mercado Pago + SendGrid/Resend

---

## Arquitectura

### 1. Email Service (`backend/services/email.service.ts`)

**Singleton que gestiona todos los emails transaccionales:**

```typescript
emailService.initialize()           // Inicializar con ENV vars
emailService.send(options)          // Enviar email genérico
emailService.sendOrderConfirmation(data)     // Orden recibida
emailService.sendPaymentReceived(data)       // Pago confirmado ✅
emailService.sendProcessingNotification(data) // Preparando envío 📦
emailService.sendShippingNotification(data)  // Paquete en camino 🚚
emailService.sendPaymentFailed(data, reason) // Pago fallido ⚠️
```

**Soporta 3 proveedores:**
- `SMTP`: Gmail, Mailgun, cualquier SMTP estándar
- `SendGrid`: Enterprise, gran volumen
- `Resend`: Moderno, fácil integración

**HTML Templates:**
- Responsive design
- Colores temáticos por evento
- Detalles de orden completos
- CTAs claras (tracking, reintento, contacto)
- Footer con datos de contacto

---

### 2. Webhook Handler (`backend/webhooks/mercadopago.webhook.ts`)

**Procesa notificaciones de Mercado Pago:**

```typescript
POST /api/webhooks/mercadopago
Content-Type: application/json

{
  "action": "payment.created",
  "type": "payment",
  "data": {
    "id": 12345678
  }
}
```

**Flujo:**

```
Webhook Mercado Pago
    ↓
1. Verificar estructura
2. Obtener detalles del pago
3. Buscar orden por external_reference
4. Mapear estado de pago → estado de orden
5. Actualizar orden en Payload
6. Enviar email transaccional
7. Cambiar a "processing" después de 5s
```

**Estados de pago → Estados de orden:**

| Mercado Pago | Pure24 | Email |
|---|---|---|
| `approved` | `paid` → `processing` | ✅ Pago confirmado |
| `rejected` | `payment_failed` | ⚠️ Pago rechazado |
| `cancelled` | `cancelled` | ⚠️ Pago cancelado |
| `pending` | `pending` | (sin email) |
| `refunded` | `cancelled` | ⚠️ Reembolso |
| Otros | `pending` | (sin email) |

---

## Configuración

### Variables de entorno

**Obligatorias:**
```bash
# Backend
PAYLOAD_SECRET=tu_secret_seguro
MERCADOPAGO_ACCESS_TOKEN=APP_USR_1234567890...
NODE_ENV=production  # development para modo simulado

# Email (elegir uno)
EMAIL_PROVIDER=smtp|sendgrid|resend
EMAIL_FROM=noreply@pure24.cl

# SMTP (si EMAIL_PROVIDER=smtp)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu_email@gmail.com
SMTP_PASSWORD=app_password

# SendGrid (si EMAIL_PROVIDER=sendgrid)
SENDGRID_API_KEY=SG.1234567890...

# Resend (si EMAIL_PROVIDER=resend)
RESEND_API_KEY=re_1234567890...

# Mercado Pago (opcional para webhooks)
MERCADOPAGO_WEBHOOK_TOKEN=tu_webhook_token
```

**Desarrollo (`.env.local`):**
```bash
NODE_ENV=development
EMAIL_PROVIDER=smtp
SMTP_HOST=localhost
SMTP_PORT=1025  # MailHog
PAYLOAD_SECRET=dev_secret
MERCADOPAGO_ACCESS_TOKEN=TEST_TOKEN
```

---

## Integración Mercado Pago

### 1. Obtener Access Token

1. **Login** en [Mercado Pago Developers](https://www.mercadopago.com.ar/developers)
2. **Crear aplicación** (si no existe)
3. **Copiar** Access Token (comenzará con `APP_USR_`)
4. **Guardarlo** en `.env` → `MERCADOPAGO_ACCESS_TOKEN`

### 2. Configurar Webhook en Dashboard

1. **Dashboard Mercado Pago** → Configuración → Webhooks
2. **Crear webhooks:**
   - **URL**: `https://api.pure24.cl/api/webhooks/mercadopago`
   - **Eventos**: `payment.created`, `payment.updated`
   - **Token** (opcional): Para verificación

3. **Test webhook:**
   ```bash
   POST https://localhost:3000/api/webhooks/mercadopago
   Content-Type: application/json

   {
     "action": "payment.created",
     "type": "payment",
     "data": { "id": 123456789 }
   }
   ```

### 3. External Reference (importante)

En **CheckoutForm.tsx**, al crear preference:

```typescript
const preference = {
  // ...
  external_reference: orderNumber,  // ← CRÍTICO
  // ...
};
```

Esto permite que el webhook encuentre la orden:
```typescript
const orderNumber = paymentData.external_reference;  // "ORD-123456"
const orders = await payload.find({
  collection: 'orders',
  where: { orderNumber: { equals: orderNumber } }
});
```

---

## Flujos de Email

### 1. Orden Recibida (Manual)

**Cuándo:** Cuando usuario completa formulario de checkout

**Implementación en CheckoutForm.tsx:**

```typescript
// Después de crear orden en Payload
await emailService.sendOrderConfirmation({
  order: createdOrder,
  customerName: formData.nombre,
  customerEmail: formData.email,
});
```

**Contenido:**
- Número de orden
- Dirección de envío
- Lista de productos
- Resumen de precios
- "Recibirás email cuando se envíe"

---

### 2. Pago Confirmado (Webhook)

**Cuándo:** Mercado Pago notifica `payment.approved`

**Automático vía webhook:**

```
Mercado Pago → Webhook → fetchPaymentData() →
updateOrderFromPayment() → status=paid →
emailService.sendPaymentReceived() → Email ✅
```

**Contenido:**
- Confirmación de pago (✅)
- Monto pagado
- Próximos pasos (preparación, envío, entrega)
- Estimado de tiempo

---

### 3. Preparando Envío (Automático)

**Cuándo:** 5 segundos después de pago aprobado

**Automático en webhook:**

```typescript
setTimeout(async () => {
  await payload.update(..., { status: 'processing' });
  await emailService.sendProcessingNotification(order);
}, 5000);
```

**Contenido:**
- Orden siendo preparada (📦)
- Productos confirmados
- "Recibiras tracking pronto"
- Tiempo estimado (24-48 horas)

---

### 4. Paquete en Camino (Manual)

**Cuándo:** Admin actualiza `tracking` en orden

**Implementación (hook en Orders.ts o admin UI):**

```typescript
// Cuando admin ingresa trackingNumber
const tracking = order.tracking;
if (tracking.trackingNumber) {
  await emailService.sendShippingNotification(order, tracking.trackingNumber);
}
```

**Contenido:**
- Paquete enviado (🚚)
- Número de tracking
- Empresa de envío
- Dirección
- Fecha estimada

---

### 5. Pago Fallido (Webhook)

**Cuándo:** Mercado Pago notifica `payment.rejected` o `payment.cancelled`

**Automático vía webhook:**

```
Mercado Pago → rejected → status=payment_failed →
emailService.sendPaymentFailed() → Email ⚠️
```

**Contenido:**
- Pago no procesado (⚠️)
- Monto intentado
- Razón posible
- Instrucciones para reintentar
- Tiempo para reintentar (24 horas)

---

## Data Flow

### Creación de Orden (Checkout)

```
CheckoutForm.tsx
    ↓
POST /api/orders (Payload)
    ├─ Crear orden con status=pending
    ├─ Retornar orderNumber
    ↓
emailService.sendOrderConfirmation()
    ├─ Preparar HTML
    ├─ Enviar a SMTP/SendGrid/Resend
    └─ Log a consola (dev)
    ↓
Redirect a Mercado Pago
    ├─ external_reference=orderNumber
    └─ User paga
```

### Confirmación de Pago (Webhook)

```
Mercado Pago (webhook)
    ↓
POST /api/webhooks/mercadopago
    ├─ Validar estructura
    ├─ Obtener paymentData (real o simulado)
    ├─ Buscar orden por external_reference
    ↓
updateOrderFromPayment()
    ├─ Mapear estado (approved → paid)
    ├─ Actualizar mercadoPago.paymentId
    ├─ Guardar en Payload
    ↓
emailService.sendPaymentReceived()
    ├─ Enviar email
    ↓
setTimeout(5s)
    ├─ Status pending → processing
    ├─ emailService.sendProcessingNotification()
    └─ Log completado
```

### Envío Manual (Admin)

```
Admin actualiza tracking en orden
    ↓
Hook de Payload (afterChange)
    ├─ Detectar trackingNumber
    ↓
emailService.sendShippingNotification()
    ├─ Incluir número de tracking
    └─ Enviar a customer
```

---

## Testing

### 1. Desarrollo (Sin Mercado Pago)

**El webhook automáticamente simula pagos:**

```bash
# 1. Crear orden en Payload admin
# 2. Copiar orderNumber (ej: ORD-1234)

# 3. Simular webhook
curl -X POST http://localhost:3000/api/webhooks/mercadopago \
  -H "Content-Type: application/json" \
  -d '{
    "action": "payment.created",
    "type": "payment",
    "data": { "id": 12345678 }
  }'

# 4. Verificar:
# - Orden actualizada a status=paid
# - Email enviado a consola
# - Status automáticamente → processing
```

### 2. Producción (Mercado Pago real)

**Usar sandbox de Mercado Pago:**

```
1. Dashboard Mercado Pago → Settings → Sandcaja
2. Usar tarjeta de prueba: 4111 1111 1111 1111
3. Webhook URL: https://your-domain.com/api/webhooks/mercadopago
4. Los emails se enviarán a SendGrid/Resend reales
```

### 3. Verificar Emails en Desarrollo

**Opción A: MailHog (gratuito)**

```bash
# Instalar
brew install mailhog

# Ejecutar
mailhog

# Configurar .env.local
EMAIL_PROVIDER=smtp
SMTP_HOST=localhost
SMTP_PORT=1025

# Acceder a UI en http://localhost:8025
```

**Opción B: Console logs**

Con `NODE_ENV=development`, los emails se loguean a consola:

```
📧 [EMAIL] ✅ Pago confirmado - Orden #ORD-1234
   To: customer@example.com
   Body: <!DOCTYPE html>...
```

---

## Mantenimiento

### Monitoreo de Webhooks

**Verificar que están llegando:**

```bash
# 1. Ver logs del servidor
tail -f backend.log | grep -i webhook

# 2. Contar webhooks por hora
grep "🔔 Webhook Mercado Pago" backend.log | wc -l

# 3. Buscar errores
grep "❌" backend.log
```

### Reintentos de Email

Si un email falla (servidor de mail caído, etc.):

```typescript
// Implementar retry logic
async function sendWithRetry(
  emailFn: () => Promise<boolean>,
  maxRetries = 3
) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const success = await emailFn();
      if (success) return true;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    } catch (error) {
      console.error(`Email retry ${i + 1}/${maxRetries} failed`);
    }
  }
  return false;
}
```

### Logs

**Estructura de logs:**

```
✅ - Éxito (pago aprobado, email enviado)
⚠️  - Advertencia (webhook sin estructura, email no configurado)
❌ - Error (pago rechazado, orden no encontrada)
📧 - Email (enviado o logeado)
💳 - Pago (procesado, actualizado)
📦 - Orden (actualizada a processing)
🔔 - Webhook (recibido)
🚀 - Sistema (iniciado, configurado)
```

---

## Próximos Pasos

### PARTE 4.4 - Producción

1. **Deploy backend** a Railway/Render
2. **Deploy frontend** a Vercel
3. **Configurar dominio** real
4. **Cambiar URLs** de webhook (dev → prod)
5. **Activar SendGrid** o Resend
6. **Implementar monitoring** (Sentry, DataDog)

### FASE 5 - Admin Dashboard

1. **Panel de estadísticas** (órdenes, ingresos)
2. **Gestión de órdenes** (actualizar tracking)
3. **Reportes** (por período, categoría, etc.)

---

## Archivos Creados

1. `backend/services/email.service.ts` (750 líneas)
   - EmailService singleton
   - 5 plantillas HTML
   - Soporte 3 proveedores

2. `backend/webhooks/mercadopago.webhook.ts` (400 líneas)
   - handleMercadoPagoWebhook()
   - fetchPaymentData()
   - updateOrderFromPayment()
   - sendTransactionalEmail()

3. `backend/server.ts` (modificado)
   - Integración webhook
   - Inicialización email service
   - Express middleware

**Total líneas nuevas:** ~1,200

---

## Checklist de Implementación

- [x] Email service con 3 proveedores
- [x] 5 plantillas HTML profesionales
- [x] Webhook handler para Mercado Pago
- [x] Mapeo de estados de pago
- [x] Integración en server.ts
- [ ] Probar webhook en desarrollo
- [ ] Configurar en Mercado Pago dashboard
- [ ] SendGrid/Resend account
- [ ] Datos de contacto en footer
- [ ] Testing en sandbox Mercado Pago

