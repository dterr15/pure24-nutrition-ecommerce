# 🎯 FASE 5.2: IPN Webhook - Guía Paso a Paso

**Tiempo estimado:** 45-60 minutos
**Dificultad:** 🟠 Intermedio (la infraestructura está lista)
**Prerequisitos:** Backend funcionando, MySQL/PostgreSQL, .env configurado

---

## ✅ PASO 1: Verificar Configuración Email (5 min)

### 1.1 Ejecutar script de validación

```bash
cd /c/Users/danie/pure24-nutrition-ecommerce
npm run setup:webhook
```

**Output esperado:**

```
🔍 Verificando configuración de webhooks y email...

📁 Archivos:
✅ email.service.ts existe
✅ mercadopago.webhook.ts existe
✅ backend/server.ts existe

🔐 Variables de entorno:
✅ MERCADOPAGO_ACCESS_TOKEN configurado
✅ EMAIL_PROVIDER configurado

📧 Email Provider: smtp

✅ SMTP_HOST configurado
✅ SMTP_PORT configurado
✅ SMTP_USER configurado
✅ SMTP_PASSWORD configurado

📦 Paquetes:
✅ nodemailer instalado

✅ ¡Configuración completa! Webhooks listos.
```

### 1.2 Si ves ❌ errores:

**Error: `MERCADOPAGO_ACCESS_TOKEN no configurado`**
```bash
# Editar .env
MERCADOPAGO_ACCESS_TOKEN=APP_USR-41141475-d413-44b3-ba90-681f58d2717f
```

**Error: `EMAIL_PROVIDER no configurado`**
```bash
# Editar .env y agregar:
EMAIL_PROVIDER=smtp
EMAIL_FROM=noreply@pure24nutrition.cl
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASSWORD=tu-app-password
```

**Error: `nodemailer no está instalado`**
```bash
npm install nodemailer @types/nodemailer
```

---

## ✅ PASO 2: Instalar Dependencias Email (2 min)

Elige tu proveedor de email (recomendado: instalar los 3):

### 2.1 Opción A: SMTP (Gmail, Outlook, etc) - RECOMENDADO

```bash
npm install nodemailer
npm install --save-dev @types/nodemailer
```

Luego en `.env`:
```bash
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASSWORD=tu-app-password  # App password, no tu contraseña normal
SMTP_FROM_NAME=Pure24 Nutrition
```

### 2.2 Opción B: SendGrid

```bash
npm install @sendgrid/mail
```

Luego en `.env`:
```bash
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=SG.xxxxx...
```

### 2.3 Opción C: Resend

```bash
npm install resend
```

Luego en `.env`:
```bash
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_xxxxx...
```

### 2.4 Instalar los 3 (máxima flexibilidad)

```bash
npm install nodemailer @sendgrid/mail resend
npm install --save-dev @types/nodemailer
```

---

## ✅ PASO 3: Configurar Webhook en Mercado Pago (5 min)

### 3.1 Ir a Mercado Pago Dashboard

1. Abre https://www.mercadopago.com.ar/developers/panel
2. Login con tu cuenta

### 3.2 Navegar a Webhooks

1. Click en **Configuración** (rueda ⚙️)
2. Click en **Webhooks**

### 3.3 Agregar Nueva URL

1. Click en **Agregar otro webhook**
2. En "URL de notificación" pega:
   ```
   https://api.pure24nutrition.cl/api/webhooks/mercadopago
   ```
3. En "Eventos" selecciona:
   - ✅ `payment.created`
   - ✅ `payment.updated`
4. (Opcional) Token de verificación: Tu `MERCADOPAGO_WEBHOOK_TOKEN`

### 3.4 Guardar

Click en **Guardar cambios**

### 3.5 Para Testing Local

Si quieres testear localmente sin desplegar:

```bash
# En terminal separada, instalar ngrok
brew install ngrok  # macOS
# o descargar de https://ngrok.com

# Exponer tu servidor local
ngrok http 3000

# Esto te da una URL como: https://xxxx-yy-zzz-www.ngrok.io

# En MP Dashboard, usa:
# https://xxxx-yy-zzz-www.ngrok.io/api/webhooks/mercadopago
```

---

## ✅ PASO 4: Iniciar Servidor Backend (3 min)

### 4.1 Desde la raíz del proyecto

```bash
cd /c/Users/danie/pure24-nutrition-ecommerce

# Opción A: Desarrollo con logs
npm run dev:backend

# Opción B: Producción
npm run build:backend && npm start:backend
```

### 4.2 Verificar que está corriendo

Espera a ver este output:
```
✅ Payload CMS iniciado correctamente
📍 Admin panel: http://localhost:3000/admin
📍 API: http://localhost:3000/api
🔔 Webhook: http://localhost:3000/api/webhooks/mercadopago
🚀 Servidor escuchando en puerto 3000
```

### 4.3 Verificar webhook está vivo

En otra terminal:
```bash
curl http://localhost:3000/api/webhooks/mercadopago/health

# Output esperado:
# {"status":"webhook_active","timestamp":"2026-03-09T..."}
```

---

## ✅ PASO 5: Testear Webhook con Datos Mock (10 min)

### 5.1 Test Manual con cURL

Abre una terminal y ejecuta:

```bash
curl -X POST http://localhost:3000/api/webhooks/mercadopago \
  -H "Content-Type: application/json" \
  -d '{
    "action": "payment.created",
    "type": "payment",
    "data": {
      "id": 123456789
    }
  }'
```

**Response esperada:**
```json
{
  "success": true,
  "orderId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
}
```

**Si ves un error, revisa:**
- ¿El servidor está corriendo? (PASO 4)
- ¿El .env tiene MERCADOPAGO_ACCESS_TOKEN? (PASO 1)
- ¿Existen órdenes en la BD? (crea una primero en PASO 6)

### 5.2 Test Suite Automático

```bash
npm run test:webhook
```

Este script automáticamente:
1. ✅ Crea una orden de test en BD
2. ✅ Simula webhook de Mercado Pago
3. ✅ Verifica que el status cambió a "paid"
4. ✅ Verifica que se redujo el stock
5. ✅ Verifica que se envió email

**Output esperado:**
```
🧪 Testing FASE 5.2 Webhook...

✅ Order created: ORD-1234567890
✅ Webhook simulated: payment.created
✅ Order status updated to: paid
✅ Stock reduced: Proteína -1 unit
✅ Email sent to: test@example.com

✅ All tests passed!
```

### 5.3 Inspeccionar Logs

En el servidor que tiene `npm run dev:backend`, verás logs como:

```
🔔 Webhook Mercado Pago recibido: { action: 'payment.created', type: 'payment', data: { id: 123456789 } }
💳 Procesando pago 123456789 - Estado: approved
✅ Pago aprobado - Orden 550e8400-e29b-41d4-a716-446655440000
✅ Orden 550e8400... actualizada a estado: paid
📧 Enviando email de pago confirmado a test@example.com
📦 Orden 550e8400... actualizada a "processing"
```

---

## ✅ PASO 6: Crear Tabla de Logging de Webhooks (5 min)

Para monitorear todos los webhooks recibidos:

### 6.1 Conectar a PostgreSQL

```bash
# Si usas Docker:
docker-compose exec postgres psql -U payload -d pure24_db

# Si usas PostgreSQL local:
psql -U postgres -d pure24_db
```

### 6.2 Ejecutar SQL

```sql
CREATE TABLE IF NOT EXISTS webhooks_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR(50) NOT NULL,
  mercado_pago_id BIGINT,
  order_id UUID,
  payment_status VARCHAR(50),
  payment_method VARCHAR(50),
  total_amount NUMERIC(12,2),
  payload JSONB,
  response JSONB,
  error_message TEXT,
  http_status_code INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para búsquedas rápidas
CREATE INDEX idx_webhooks_mp_id ON webhooks_log(mercado_pago_id);
CREATE INDEX idx_webhooks_order_id ON webhooks_log(order_id);
CREATE INDEX idx_webhooks_created ON webhooks_log(created_at DESC);
CREATE INDEX idx_webhooks_status ON webhooks_log(payment_status);
```

### 6.3 Agregar Logging al Webhook Handler

Editar `backend/webhooks/mercadopago.webhook.ts`:

```typescript
// Cerca de la línea 107, después de res.status(200).json:

import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URI,
});

// En handleMercadoPagoWebhook, agregar antes de res.status:

await pool.query(
  `INSERT INTO webhooks_log
   (event_type, mercado_pago_id, order_id, payment_status, payload, response, http_status_code)
   VALUES ($1, $2, $3, $4, $5, $6, $7)`,
  [
    body.action,
    paymentData.id,
    order?.id,
    paymentData.status,
    JSON.stringify(req.body),
    JSON.stringify({ success: true, orderId: order?.id }),
    200,
  ]
);
```

### 6.4 Ver Webhooks Recibidos

```sql
-- Ver últimos 10 webhooks
SELECT
  id,
  event_type,
  mercado_pago_id,
  payment_status,
  created_at
FROM webhooks_log
ORDER BY created_at DESC
LIMIT 10;

-- Ver webhooks por status
SELECT
  payment_status,
  COUNT(*) as cantidad,
  SUM(total_amount) as monto_total
FROM webhooks_log
GROUP BY payment_status;

-- Ver webhooks con error
SELECT
  id,
  error_message,
  created_at
FROM webhooks_log
WHERE error_message IS NOT NULL
ORDER BY created_at DESC;
```

---

## ✅ PASO 7: Integrar con Sincronización de Stock (5 min)

El webhook automáticamente reduce stock cuando el pago es aprobado.

### 7.1 Verificar Integración

En `backend/webhooks/mercadopago.webhook.ts`, busca la función `updateOrderFromPayment`:

```typescript
// Línea ~273-297, debe estar este código:

if (newStatus === 'paid') {
  try {
    // Reducir stock para cada item
    for (const item of existingOrder.items) {
      const currentStock = item.product.stock;
      await payload.update({
        collection: 'products',
        id: item.product.id,
        data: {
          stock: currentStock - item.quantity,
        },
      });
      console.log(`📉 Stock reducido: ${item.product.name} -${item.quantity}`);
    }
```

Si no está, agrégalo:

```typescript
import payload from 'payload';

// En updateOrderFromPayment, dentro del case 'approved':
case 'approved':
  newStatus = 'paid';
  shouldSendEmail = true;
  emailTemplate = 'payment_received';

  // ⭐ AGREGAR ESTO:
  try {
    for (const item of existingOrder.items) {
      const product = await payload.findByID({
        collection: 'products',
        id: item.product.id || item.productId,
      });

      await payload.update({
        collection: 'products',
        id: item.product.id || item.productId,
        data: {
          stock: Math.max(0, product.stock - item.quantity),
        },
      });
      console.log(`📉 Stock: ${product.name} → ${product.stock - item.quantity} units`);
    }
  } catch (error) {
    console.error('⚠️ Error reduciendo stock:', error);
  }
  // ⭐ FIN AGREGAR

  console.log(`✅ Pago aprobado - Orden ${orderId}`);
  break;
```

### 7.2 Testear Reducción de Stock

```bash
# 1. Ver stock actual
curl http://localhost:3000/api/collections/products/[PRODUCT_ID]

# 2. Crear orden con 1 unidad
curl -X POST http://localhost:3000/api/collections/orders \
  -H "Content-Type: application/json" \
  -d '{
    "orderNumber": "ORD-TEST",
    "customerEmail": "test@test.com",
    "items": [
      {
        "productId": "[PRODUCT_ID]",
        "quantity": 2,
        "price": 10000
      }
    ],
    "total": 20000
  }'

# 3. Simular webhook
curl -X POST http://localhost:3000/api/webhooks/mercadopago \
  -H "Content-Type: application/json" \
  -d '{
    "action": "payment.created",
    "type": "payment",
    "data": { "id": 999999 }
  }'

# 4. Ver stock nuevamente
curl http://localhost:3000/api/collections/products/[PRODUCT_ID]

# Stock debe haber disminuido en 2 unidades ✅
```

---

## 🧪 ESCENARIOS DE TEST

### Escenario 1: Pago Exitoso

```bash
# Ver órdenes pendientes
curl http://localhost:3000/api/collections/orders?filter[status]=pending

# Simular pago aprobado
curl -X POST http://localhost:3000/api/webhooks/mercadopago \
  -H "Content-Type: application/json" \
  -d '{
    "action": "payment.created",
    "type": "payment",
    "data": { "id": 111111 }
  }'

# Verificar
# - Order status cambió a "paid"
# - Stock reducido
# - Email enviado a customer
```

### Escenario 2: Pago Rechazado

En desarrollo, el webhook simula un pago rechazado:

```bash
NODE_ENV=development \
PAYMENT_STATUS=rejected \
npm run test:webhook
```

Verificar:
- Order status: "payment_failed"
- Email enviado: "⚠️ Pago No Procesado"
- Stock NO se redujo
- Orden disponible para reintentar

### Escenario 3: Timeout de Webhook

```bash
# Desconectar Mercado Pago simuladamente
SKIP_MP_API=true npm run dev:backend

# Enviar webhook
curl -X POST http://localhost:3000/api/webhooks/mercadopago ...

# Resultado:
# - HTTP 500
# - Mercado Pago reintentará después
# - Error aparece en webhooks_log
```

---

## 🔍 TROUBLESHOOTING

### ❌ "Webhook received but no order found"

```bash
# Problema: El external_reference no coincide

# Solución:
# 1. Crear orden con orderNumber único
# 2. Usar ese orderNumber como external_reference en MP
# 3. Webhook buscará la orden por ese number
```

### ❌ "Email service not initialized"

```bash
# Problema: EMAIL_PROVIDER no configurado

# Solución:
npm run setup:webhook
# Revisar los ❌ errores
# Agregar variables a .env
# Reiniciar servidor
```

### ❌ "Payment data fetch failed"

```bash
# Problema: No puede conectar a Mercado Pago API

# En desarrollo: Se simula automáticamente
# En producción: Verificar
# - MERCADOPAGO_ACCESS_TOKEN válido
# - Internet connection
# - Mercado Pago API status (https://status.mercadopago.com)
```

### ❌ "Stock reduction failed"

```bash
# Problema: No puede actualizar producto

# Solución:
# 1. Verificar que el productId existe
# 2. Verificar que existe el producto en BD
# 3. Revisar permisos en Payload
```

---

## 📊 MONITOREO POST-IMPLEMENTACIÓN

### Verificar Webhooks Diarios

```sql
-- Dashboard de webhooks
SELECT
  DATE(created_at) as fecha,
  event_type,
  payment_status,
  COUNT(*) as cantidad,
  SUM(total_amount) as monto_total
FROM webhooks_log
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY DATE(created_at), event_type, payment_status
ORDER BY fecha DESC, event_type;
```

### Alertas de Errores

```sql
-- Webhooks fallidos en última hora
SELECT
  id,
  mercado_pago_id,
  error_message,
  created_at
FROM webhooks_log
WHERE error_message IS NOT NULL
AND created_at > NOW() - INTERVAL '1 hour';
```

### Tasa de Conversión

```sql
-- Conversion rate
SELECT
  COUNT(CASE WHEN payment_status = 'approved' THEN 1 END)::FLOAT /
  COUNT(*) * 100 as conversion_rate
FROM webhooks_log
WHERE created_at > NOW() - INTERVAL '7 days';
```

---

## ✅ CHECKLIST FINAL

Después de completar todos los pasos:

- [ ] PASO 1: Email service verificado ✅
- [ ] PASO 2: Dependencias instaladas ✅
- [ ] PASO 3: Webhook configurado en MP dashboard ✅
- [ ] PASO 4: Backend servidor corriendo ✅
- [ ] PASO 5: Webhook testeado exitosamente ✅
- [ ] PASO 6: Tabla de logging creada ✅
- [ ] PASO 7: Stock sync integrado ✅
- [ ] Email "payment_received" enviado ✅
- [ ] Email "payment_failed" enviado ✅
- [ ] Email "processing" enviado ✅
- [ ] Stock se reduce correctamente ✅
- [ ] Escenarios de error manejados ✅
- [ ] Monitoring configurado ✅
- [ ] Documentación revisada ✅

---

## 🎉 ¡COMPLETADO!

FASE 5.2 implementada exitosamente.

**Próximos pasos:**
1. FASE 5.3: Dashboard Admin (4-5 horas)
2. FASE 6: Automatización Post-Compra
3. GATE 7: Validación Final

**Tiempo total usado:** ~45 minutos
