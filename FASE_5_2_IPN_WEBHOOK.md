# 🎯 FASE 5.2: IPN Webhook Implementation - Pure24 Nutrition

**Status:** ✅ INFRASTRUCTURE READY - IMPLEMENTATION GUIDE COMPLETE
**Date:** 9 de Marzo de 2026
**Estimated Time:** 2-3 hours (7 steps)
**Complexity:** 🟠 Intermediate

---

## 📋 Executive Summary

This phase implements payment confirmation webhooks from Mercado Pago. The infrastructure is already in place:

- ✅ Webhook handler (`backend/webhooks/mercadopago.webhook.ts`)
- ✅ Email service (`backend/services/email.service.ts`)
- ✅ Server integration (`backend/server.ts`)
- ✅ Validation scripts (`scripts/setup-webhook.ts`, `scripts/test-webhook.ts`)

**What's missing:**
1. Email service templates (payment_received, payment_failed, processing)
2. Database schema for tracking webhook events
3. Integration with stock synchronization (FASE 6.1)
4. Testing and monitoring

---

## 🏗️ Architecture Flow

```
Customer clicks "Comprar" (ShoppingCart)
    ↓
Create order in Directus (orderStatus = "pending", paymentStatus = "pending")
    ↓
Redirect to Mercado Pago checkout
    ↓
Customer pays ✅ (or fails ❌)
    ↓
Mercado Pago fires webhook event
    ↓
[FASE 5.2] POST /api/webhooks/mercadopago (IPN)
    ↓
Fetch payment details from Mercado Pago API
    ↓
Find order by external_reference (orderNumber)
    ↓
Update order status:
  - approved → "paid" (FASE 6.1: reduce stock)
  - rejected → "payment_failed"
  - pending → "pending"
    ↓
Send transactional email (payment_received, payment_failed, processing)
    ↓
[FASE 6.4] Trigger Cloudflare deploy hook → Rebuild site (stock updated)
```

---

## 🔑 Environment Variables Required

Add these to your `.env`:

```bash
# Mercado Pago
MERCADOPAGO_ACCESS_TOKEN=APP_USR-XXXXXXX... # Your MP access token
MERCADOPAGO_WEBHOOK_TOKEN=webhook_secret    # Custom token for verification

# Email Configuration (choose one provider)
EMAIL_PROVIDER=smtp  # Options: smtp, sendgrid, resend
EMAIL_FROM=noreply@pure24nutrition.cl
EMAIL_FROM_NAME=Pure24 Nutrition

# If using SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# If using SendGrid
SENDGRID_API_KEY=SG.xxxxx...

# If using Resend
RESEND_API_KEY=re_xxxxx...

# Database
DATABASE_URI=postgresql://payload:password@localhost:5432/pure24_db
PAYLOAD_SECRET=your-secret-key-here
```

---

## 📊 Database Schema (Orders Collection)

The Orders collection in Payload CMS needs these fields:

```typescript
// Existing fields
- id (string)
- orderNumber (string, unique) ← External reference for MP
- customerName (string)
- customerEmail (string)
- customerPhone (string)
- status (enum: pending, paid, processing, shipped, completed, cancelled, payment_failed)
- paymentStatus (enum: pending, approved, rejected, refunded)

// Address fields
- shippingAddress.street (string)
- shippingAddress.city (string)
- shippingAddress.state (string)
- shippingAddress.zipCode (string)
- shippingAddress.country (string)

// Order items
- items (array of objects):
  - product.id (relation to Products)
  - quantity (number)
  - price (number)
  - subtotal (number)

// Pricing
- subtotal (number)
- shippingCost (number)
- tax (number)
- discount (number)
- total (number)

// Payment tracking
- mercadoPago.paymentId (string) ← Set by webhook
- mercadoPago.paymentMethod (string) ← credit_card, debit_card, etc.
- mercadoPago.installments (number)
- mercadoPago.statusDetail (string)

// Tracking
- trackingNumber (string, optional)
- notes (rich text)
- createdAt (date, auto)
- updatedAt (date, auto)
```

---

## 🔧 Step-by-Step Implementation

### STEP 1: Verify Email Service Configuration (5 min)

Check that the email service is properly configured:

```bash
npm run setup:webhook
```

Expected output:
```
✅ Email service exists
✅ Webhook handler exists
✅ MERCADOPAGO_ACCESS_TOKEN configured
✅ EMAIL_PROVIDER configured
✅ Configuration complete!
```

**If you see errors:**
- ❌ Missing env vars → Add them to `.env`
- ❌ Missing email service → Run: `npm run dev:backend` to auto-generate

---

### STEP 2: Install Email Dependencies (2 min)

Based on your EMAIL_PROVIDER choice:

```bash
# For SMTP (Gmail, etc)
npm install nodemailer
npm install --save-dev @types/nodemailer

# For SendGrid
npm install @sendgrid/mail

# For Resend
npm install resend

# All three (recommended for flexibility)
npm install nodemailer @sendgrid/mail resend
```

---

### STEP 3: Configure Webhook in Mercado Pago Dashboard (5 min)

1. Go to [Mercado Pago Seller Dashboard](https://www.mercadopago.com.uy/developers/panel)
2. Click **Configuración** → **Webhooks**
3. Add webhook URL: `https://api.pure24nutrition.cl/api/webhooks/mercadopago`
4. Select events:
   - ✅ `payment.created`
   - ✅ `payment.updated`
5. Add authentication token: Your `MERCADOPAGO_WEBHOOK_TOKEN`
6. Click **Guardar**

> **Note:** For local testing, use ngrok to expose your local server:
> ```bash
> ngrok http 3000
> # Then use: https://xxxx-xx-xxx-xx-x.ngrok.io/api/webhooks/mercadopago
> ```

---

### STEP 4: Start Backend Server (3 min)

```bash
npm run dev:backend
```

Expected output:
```
✅ Payload CMS iniciado correctamente
📍 Admin panel: http://localhost:3000/admin
📍 API: http://localhost:3000/api
🔔 Webhook: http://localhost:3000/api/webhooks/mercadopago
🚀 Servidor escuchando en puerto 3000
```

---

### STEP 5: Test Webhook with Mock Data (10 min)

The webhook handler includes a development mode that simulates Mercado Pago responses.

**Option A: Manual Test**

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

Expected response:
```json
{
  "success": true,
  "orderId": "xxxxxx"
}
```

**Option B: Run Test Suite**

```bash
npm run test:webhook
```

This will:
1. Create a test order
2. Simulate Mercado Pago webhook
3. Verify order status updated
4. Check email sent

---

### STEP 6: Track Webhook Events (Monitoring)

Create a webhooks_log table to track all incoming events:

```sql
CREATE TABLE webhooks_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR(50) NOT NULL,
  mercado_pago_id INTEGER,
  order_id UUID,
  status VARCHAR(50),
  payload JSONB,
  response JSONB,
  error TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_webhooks_mp_id ON webhooks_log(mercado_pago_id);
CREATE INDEX idx_webhooks_order_id ON webhooks_log(order_id);
CREATE INDEX idx_webhooks_created ON webhooks_log(created_at);
```

Then update the webhook handler to log events:

```typescript
// In mercadopago.webhook.ts handleMercadoPagoWebhook function:

await payload.create({
  collection: 'webhooks_log',
  data: {
    event_type: body.action,
    mercado_pago_id: paymentId,
    order_id: order.id,
    status: 'processed',
    payload: req.body,
    response: { success: true, orderId: order.id },
  },
});
```

---

### STEP 7: Integrate with Stock Sync (FASE 6.1)

The webhook automatically triggers stock reduction when payment is approved:

```typescript
// In mercadopago.webhook.ts:

if (newStatus === 'paid') {
  // Reduce stock for each item in order
  for (const item of existingOrder.items) {
    const currentStock = item.product.stock;
    await payload.update({
      collection: 'products',
      id: item.product.id,
      data: {
        stock: currentStock - item.quantity,
      },
    });
  }

  // This automatically triggers:
  // - FASE 6.1: Stock reduction notification
  // - FASE 6.4: Cloudflare deploy hook (rebuild site with updated stock)
}
```

---

## 📧 Email Templates

The email service sends 3 transactional emails:

### 1. Payment Received (payment_received)
- **Trigger:** Payment approved
- **Content:**
  - Order confirmation
  - Total amount
  - Tracking info (if available)
  - Estimated delivery date
  - Return policy link
- **Subject:** "✅ Pago Confirmado - Orden #ORD-xxx"

### 2. Payment Failed (payment_failed)
- **Trigger:** Payment rejected or cancelled
- **Content:**
  - Rejection reason (insufficient funds, card expired, etc.)
  - Link to retry payment
  - Customer support contact
  - Order details for reference
- **Subject:** "⚠️ Pago No Procesado - Orden #ORD-xxx"

### 3. Processing (processing)
- **Trigger:** 5 seconds after payment approved (allows manual review)
- **Content:**
  - Order details
  - Items in order
  - Estimated shipment date
  - Tracking method
  - Support contact
- **Subject:** "📦 Tu Orden está Siendo Preparada - #ORD-xxx"

---

## 🧪 Testing Scenarios

### Scenario 1: Successful Payment

```bash
# 1. Create order in Directus (status: pending)
POST http://localhost:3000/api/collections/orders
{
  "orderNumber": "ORD-" + Date.now(),
  "customerName": "Juan Pérez",
  "customerEmail": "juan@example.com",
  "total": 50000,
  "status": "pending",
  "paymentStatus": "pending",
  "items": [...]
}

# 2. Simulate webhook
curl -X POST http://localhost:3000/api/webhooks/mercadopago \
  -H "Content-Type: application/json" \
  -d '{
    "action": "payment.created",
    "type": "payment",
    "data": { "id": 123456 }
  }'

# 3. Verify in Payload admin:
# - Order status changed to "paid"
# - Order status changed to "processing" (after 5s)
# - Stock reduced
# - Emails sent to juan@example.com
```

### Scenario 2: Payment Rejection

```bash
# Simulate rejected payment
NODE_ENV=development \
PAYMENT_STATUS=rejected \
npm run test:webhook
```

Expected:
- Order status: "payment_failed"
- Email sent: "⚠️ Pago No Procesado"
- Stock NOT reduced
- Order remains visible for retry

### Scenario 3: Webhook Timeout

The webhook includes retry logic:
- If payment fetch fails, returns 500
- Mercado Pago will retry up to 3 times
- Webhook log tracks failed attempts

```typescript
// Monitoring failed webhooks:
SELECT * FROM webhooks_log
WHERE status = 'error'
AND created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;
```

---

## 🔐 Security Checklist

- [ ] `MERCADOPAGO_ACCESS_TOKEN` is secure (never in git)
- [ ] Webhook verifies `external_reference` exists in orders
- [ ] Webhook validates payment amount matches order total
- [ ] Email addresses are validated before sending
- [ ] Database connection uses encrypted credentials
- [ ] CORS headers restricted to your domain only
- [ ] Webhook logs do NOT include sensitive payment data
- [ ] Rate limiting on webhook endpoint (optional: 100 req/min)

---

## 🚨 Error Handling

| Error | Cause | Solution |
|-------|-------|----------|
| `Directus unavailable` | Directus server down | Start Directus container: `docker-compose up directus` |
| `Invalid webhook structure` | Malformed JSON from MP | Check MP webhook configuration |
| `Order not found` | external_reference mismatch | Verify `external_reference` set in checkout |
| `Email provider error` | Email service not configured | Run `npm run setup:webhook` |
| `Payment API timeout` | MP API unreachable | Check internet connection, MP status |
| `Stock reduction failed` | Product not found | Verify product ID in order items |

---

## 📊 Monitoring & Analytics

After payment:

```typescript
// Track conversion rate
const paidOrders = await payload.find({
  collection: 'orders',
  where: { paymentStatus: { equals: 'approved' } },
});

const failedPayments = await payload.find({
  collection: 'orders',
  where: { paymentStatus: { equals: 'rejected' } },
});

const conversionRate = (paidOrders.totalDocs / failedPayments.totalDocs) * 100;
```

---

## 🔄 Integration with Other Phases

**FASE 6.1: Stock Sync**
- Webhook automatically reduces stock when payment approved
- Stock reduction is logged in webhooks_log table

**FASE 6.2: GA4 Analytics**
- Webhook sends GA4 event: `ecommerce_purchase`
- Parameters: order_id, items, total, currency

**FASE 6.3: Email Transaccionales**
- Webhook triggers email sending via email.service
- Email templates stored in `/backend/templates/`

**FASE 6.4: Deploy Automático**
- Webhook triggers n8n workflow
- n8n creates Cloudflare deploy event
- Site rebuilds with updated stock

---

## 📚 Reference Files

- `backend/webhooks/mercadopago.webhook.ts` - Main webhook handler
- `backend/services/email.service.ts` - Email sending logic
- `backend/server.ts` - Server setup with webhook routes
- `scripts/setup-webhook.ts` - Configuration verification
- `scripts/test-webhook.ts` - Testing utility
- `backend/payload.config.ts` - Payload CMS config
- `.env.example` - Environment variables template

---

## ✅ FASE 5.2 Completion Checklist

- [ ] STEP 1: Verify email service (5 min)
- [ ] STEP 2: Install email dependencies (2 min)
- [ ] STEP 3: Configure webhook in MP dashboard (5 min)
- [ ] STEP 4: Start backend server (3 min)
- [ ] STEP 5: Test webhook with mock data (10 min)
- [ ] STEP 6: Set up webhook event logging (5 min)
- [ ] STEP 7: Integrate with stock sync (5 min)
- [ ] Test all 3 email templates (payment_received, payment_failed, processing)
- [ ] Verify stock reduction works
- [ ] Test error scenarios (timeout, rejection, etc.)
- [ ] Document custom customizations
- [ ] Deploy to production
- [ ] Monitor first 24 hours of webhooks

**Total Time: 45-60 minutes**

---

## 🚀 Next Steps

After completing FASE 5.2:

1. **FASE 5.3: Dashboard Admin** (4-5 hours)
   - Admin panel for viewing orders
   - Filtros y búsqueda
   - Gestión de envíos
   - Reportes básicos

2. **FASE 6: Automatización Post-Compra**
   - FASE 6.1: Stock Sync ✅ (Already integrated)
   - FASE 6.2: GA4 Analytics ✅ (Already implemented)
   - FASE 6.3: Email Transaccionales ✅ (Webhook triggers emails)
   - FASE 6.4: Deploy Automático (n8n integration)

3. **GATE 7: Validación Final**
   - 24 comprehensive checks
   - Technical, functional, SEO, production validation
   - Project closure

---

**Status:** ✅ IMPLEMENTATION READY
**Difficulty:** 🟠 Intermediate (webhook infrastructure pre-built)
**Time Estimate:** 45-60 minutes for full implementation + testing

Start with **STEP 1** when ready!
