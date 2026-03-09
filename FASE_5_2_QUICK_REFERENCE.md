# 🚀 FASE 5.2: Quick Reference Card

## 📋 Quick Checklist

```
Time: 45 min | Difficulty: 🟠 Intermediate | Status: Ready to implement
```

### Essential Environment Variables
```bash
MERCADOPAGO_ACCESS_TOKEN=APP_USR-xxxxx
MERCADOPAGO_WEBHOOK_TOKEN=webhook_secret
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=email@example.com
SMTP_PASSWORD=app-password
```

### Commands to Run (in order)
```bash
# 1. Verify setup
npm run setup:webhook

# 2. Install dependencies
npm install nodemailer @types/nodemailer

# 3. Start backend
npm run dev:backend

# 4. Test webhook
npm run test:webhook

# 5. (Optional) Test manually
curl -X POST http://localhost:3000/api/webhooks/mercadopago \
  -H "Content-Type: application/json" \
  -d '{"action":"payment.created","type":"payment","data":{"id":123456}}'
```

---

## 🔗 Integration Points

| System | Connection | Status |
|--------|-----------|--------|
| Mercado Pago | Webhook POST /api/webhooks/mercadopago | ✅ Ready |
| Directus | Payment → Order update | ✅ Ready |
| Email Service | Payment → Transactional email | ✅ Ready |
| Stock Sync | Payment approved → Reduce inventory | ✅ Ready |
| GA4 | Payment → Purchase event | ⏳ Next |

---

## 📧 Email Triggers

| Event | Template | Subject |
|-------|----------|---------|
| payment.approved | `payment_received` | ✅ Pago Confirmado |
| payment.rejected | `payment_failed` | ⚠️ Pago No Procesado |
| status=processing | `processing` | 📦 Orden Preparándose |

---

## 🧪 Test Scenarios

### ✅ Success Flow
1. Order created (status: pending)
2. Customer pays on MP
3. Webhook received (payment.created)
4. Order → paid → processing
5. Stock reduced
6. Email sent

### ❌ Failure Flow
1. Order created
2. Payment rejected on MP
3. Webhook received (payment.updated)
4. Order → payment_failed
5. Stock NOT reduced
6. Failure email sent

### ⏳ Pending Flow
1. Order created
2. Payment in process
3. Webhook received (payment.updated)
4. Order → pending
5. No stock change
6. No email

---

## 🔐 Security Checklist

- [ ] MERCADOPAGO_ACCESS_TOKEN in .env (never in git)
- [ ] SMTP_PASSWORD in .env (not hardcoded)
- [ ] Webhook verifies external_reference exists
- [ ] Webhook validates amount matches order.total
- [ ] Database connection encrypted
- [ ] Email logs don't contain sensitive data
- [ ] CORS restricted to your domain
- [ ] Rate limiting enabled (optional)

---

## 📊 Database Schema (Orders Collection)

**Required Fields:**
- `orderNumber` (unique, used as external_reference)
- `customerEmail` (for transactional emails)
- `status` (pending, paid, processing, shipped, cancelled, payment_failed)
- `paymentStatus` (pending, approved, rejected, refunded)
- `total` (amount to charge)

**Webhook Updates:**
- `mercadoPago.paymentId`
- `mercadoPago.paymentMethod`
- `mercadoPago.installments`
- `notes` (payment details appended)

---

## 🚨 Error Handling

| Scenario | Status | Action |
|----------|--------|--------|
| Webhook timeout | 500 | MP retries automatically |
| Order not found | 404 | Check external_reference |
| Email fails | 200 | Log warning, don't fail webhook |
| Stock reduction fails | 200 | Log warning, don't fail webhook |
| MP API unreachable | 500 | Retry on next webhook attempt |

---

## 📈 Monitoring

### Check Webhook Health
```bash
curl http://localhost:3000/api/webhooks/mercadopago/health
```

### View Recent Webhooks
```sql
SELECT event_type, payment_status, created_at
FROM webhooks_log
ORDER BY created_at DESC
LIMIT 10;
```

### Conversion Rate
```sql
SELECT
  ROUND(
    COUNT(CASE WHEN payment_status = 'approved' THEN 1 END)::FLOAT /
    COUNT(*) * 100,
    2
  ) as conversion_rate
FROM webhooks_log;
```

---

## 🔄 FASE Integration Map

```
FASE 5.1: Checkout (Mercado Pago form)
         ↓
FASE 5.2: Webhook (IPN from MP) ← YOU ARE HERE
         ↓
FASE 6.1: Stock Sync (Auto-reduce inventory)
         ↓
FASE 6.2: GA4 Analytics (Track ecommerce_purchase)
         ↓
FASE 6.3: Email (Payment confirmations)
         ↓
FASE 6.4: Deploy (Rebuild site with updated stock)
```

---

## 📚 Key Files

| File | Purpose |
|------|---------|
| `backend/webhooks/mercadopago.webhook.ts` | Main webhook handler |
| `backend/services/email.service.ts` | Email sending |
| `backend/server.ts` | Server setup + webhook route |
| `scripts/setup-webhook.ts` | Configuration verification |
| `scripts/test-webhook.ts` | Testing utility |

---

## 🎯 Success Criteria

- [ ] Webhook endpoint returns 200 OK
- [ ] Order status changes on payment
- [ ] Stock reduces on approved payment
- [ ] Customer receives confirmation email
- [ ] Failed payments show retry option
- [ ] All errors logged in webhooks_log
- [ ] Monitoring dashboard operational

---

## ⏱️ Timing Breakdown

| Step | Time | Notes |
|------|------|-------|
| 1. Verify setup | 5 min | npm run setup:webhook |
| 2. Install deps | 2 min | npm install nodemailer |
| 3. Configure MP | 5 min | Dashboard setup |
| 4. Start server | 3 min | npm run dev:backend |
| 5. Test webhook | 10 min | curl + npm test |
| 6. Logging table | 5 min | SQL setup |
| 7. Stock sync | 5 min | Code verification |
| **Buffer** | **10 min** | **Troubleshooting** |
| **TOTAL** | **45 min** | |

---

## 🆘 Common Issues

### Webhook not received?
→ Check MP dashboard webhook URL
→ Check ngrok tunnel running (for local testing)
→ Check server logs for errors

### Email not sending?
→ `npm run setup:webhook`
→ Verify SMTP credentials
→ Check EMAIL_PROVIDER set in .env

### Order not found?
→ Verify orderNumber set on order creation
→ Check external_reference matches orderNumber
→ Check database connection

### Stock not reducing?
→ Check productId exists
→ Check items array in order
→ Check Payload permissions

---

## 📞 Support

| Issue | Docs |
|-------|------|
| Step-by-step setup | FASE_5_2_PASO_A_PASO.md |
| Full reference | FASE_5_2_IPN_WEBHOOK.md |
| Email templates | See section below |
| Troubleshooting | FASE_5_2_IPN_WEBHOOK.md § Error Handling |

---

## 📧 Email Templates

### Template 1: Payment Received (payment_received)
```
Subject: ✅ Pago Confirmado - Orden #ORD-xxx

Hola {{customerName}},

Tu pago por ${{total}} ha sido procesado correctamente.

Detalles de orden:
- Orden: #{{orderNumber}}
- Total: ${{total}}
- Método: {{paymentMethod}}
- Fecha: {{createdAt}}

Tu orden está siendo preparada para envío.
Tracking disponible en: {{trackingLink}}

¡Gracias por tu compra!

Pure24 Nutrition
{{supportEmail}}
```

### Template 2: Payment Failed (payment_failed)
```
Subject: ⚠️ Pago No Procesado - Orden #ORD-xxx

Hola {{customerName}},

Lamentablemente, tu pago no pudo procesarse.

Razón: {{statusDetail}}

Para completar tu compra:
1. Click aquí: {{retryLink}}
2. Intenta con otro método de pago
3. Contacta soporte si el problema persiste

Soporte: {{supportPhone}}

Pure24 Nutrition
```

### Template 3: Processing (processing)
```
Subject: 📦 Tu Orden está Siendo Preparada - #ORD-xxx

Hola {{customerName}},

Tu pago fue confirmado. ¡Estamos preparando tu orden!

Detalles:
- Orden: #{{orderNumber}}
- Items: {{itemCount}}
- Total: ${{total}}

Envío estimado: {{estimatedShipDate}}
Envío gratis (compra > $100k): {{isShippingFree}}

Recibirás actualización de tracking pronto.

Pure24 Nutrition
```

---

## ✅ Final Verification

After implementation, verify:

```bash
# 1. Health check
curl http://localhost:3000/api/webhooks/mercadopago/health

# 2. Email working
npm run test:webhook

# 3. Stock syncing
# (Create order → Pay → Check stock)

# 4. Logs clean
SELECT COUNT(*) FROM webhooks_log;

# Result should show recent entries with status='processed'
```

---

**Next Phase:** FASE 5.3 - Admin Dashboard (Order management, filters, shipping)

**Status:** ✅ Ready to implement
