# Implementación PARTE 4.3 - Webhooks + Email

## Checklist de Instalación

### Paso 1: Instalar dependencias

```bash
cd backend

# Email service (elige al menos uno)
npm install nodemailer              # SMTP genérico ✅ REQUIERE
npm install @sendgrid/mail          # SendGrid (opcional)
npm install resend                  # Resend (opcional)
```

### Paso 2: Copiar archivos creados

Los siguientes archivos ya están listos:

```
✅ backend/services/email.service.ts       (750 líneas)
✅ backend/webhooks/mercadopago.webhook.ts (400 líneas)
✅ backend/server.ts                       (modificado)
✅ backend/.env.example                    (variables template)
✅ scripts/test-webhook.ts                 (testing)
✅ scripts/setup-webhook.ts                (verificación)
✅ docs/PARTE_4_3_WEBHOOKS_EMAIL.md        (documentación)
```

### Paso 3: Configurar variables de entorno

**Opción A: Desarrollo (SMTP simulado)**

```bash
# Crear backend/.env.local
cp backend/.env.example backend/.env.local

# Editar con:
NODE_ENV=development
PAYLOAD_SECRET=dev_secret_123456
MERCADOPAGO_ACCESS_TOKEN=TEST_TOKEN_123
EMAIL_PROVIDER=smtp
SMTP_HOST=localhost
SMTP_PORT=1025          # MailHog (ver Paso 4)
SMTP_USER=test
SMTP_PASSWORD=test
EMAIL_FROM=noreply@pure24.cl
```

**Opción B: Producción (Email real)**

```bash
# Si usas SendGrid:
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=SG.abc123def456...

# Si usas Resend:
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_abc123def456...

# Si usas SMTP (Gmail):
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu_email@gmail.com
SMTP_PASSWORD=app_password_no_contrasena
```

### Paso 4 (Desarrollo): Instalar MailHog

Para visualizar emails en desarrollo sin necesidad de servidor SMTP:

**macOS:**
```bash
brew install mailhog
mailhog
# Accede a http://localhost:8025
```

**Linux:**
```bash
# Descargar de https://github.com/mailhog/MailHog/releases
# o usar Docker
docker run -p 1025:1025 -p 8025:8025 mailhog/mailhog
```

**Windows:**
```bash
# Descargar de https://github.com/mailhog/MailHog/releases
# o usar WSL:
wsl
sudo apt install -y golang-go git
go get github.com/mailhog/MailHog
~/go/bin/MailHog
```

### Paso 5: Verificar instalación

```bash
# Desde raíz del proyecto
npm run setup:webhook

# Salida esperada:
# ✅ Email service existe
# ✅ Webhook handler existe
# ✅ Server integración existe
# ✅ Variables de entorno configuradas
```

### Paso 6: Actualizar package.json

Agregar scripts en `package.json`:

```json
{
  "scripts": {
    "setup:webhook": "node scripts/setup-webhook.ts",
    "test:webhook": "node scripts/test-webhook.ts",
    "dev:backend": "node --watch backend/server.ts"
  }
}
```

### Paso 7: Probar en desarrollo

```bash
# Terminal 1: Iniciar servidor backend
npm run dev:backend

# Terminal 2: Simular webhook
npm run test:webhook -- --order-number ORD-1234 --status approved

# Verificar:
# 1. Terminal 1: Debe mostrar logs de webhook y email
# 2. MailHog (http://localhost:8025): Debe mostrar email enviado
# 3. Orden en Payload admin: Status debe cambiar a "paid" → "processing"
```

---

## Integración con CheckoutForm

En `frontend/src/components/CheckoutForm.tsx`, después de crear la orden:

```typescript
// Importar email service desde backend
import { emailService } from '@/backend/services/email.service';

// Después de POST /api/orders exitoso
const createdOrder = response.data;

// IMPORTANTE: Inicializar email service
await emailService.initialize();

// Enviar confirmación de orden
await emailService.sendOrderConfirmation({
  order: createdOrder,
  customerName: formData.nombre,
  customerEmail: formData.email,
});

console.log('✅ Email de confirmación enviado');
```

**Nota:** Si estás en frontend (Astro), necesitas hacer un POST a un endpoint del backend que maneje esto.

**Mejor opción - Crear endpoint en backend:**

```typescript
// backend/routes/orders.ts
export async function createOrder(req: Request, res: Response) {
  // ... crear orden en Payload
  const order = await payload.create({ collection: 'orders', data: {...} });

  // Enviar email automáticamente
  await emailService.sendOrderConfirmation({
    order,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
  });

  return res.json(order);
}
```

---

## Flujo Completo de Testing

### Escenario 1: Pago Aprobado

```bash
# 1. Crear orden en Payload admin
# Número: ORD-20260308-001
# Cliente: Juan Pérez (juan@example.com)
# Total: $50,000 CLP

# 2. Simular webhook (pago aprobado)
npm run test:webhook -- --order-number ORD-20260308-001 --status approved

# 3. Verificar logs:
# [Backend] 🔔 Webhook Mercado Pago recibido
# [Backend] 💳 Procesando pago 123456789 - Estado: approved
# [Backend] ✅ Pago aprobado - Orden ORD-20260308-001
# [Backend] ✅ Orden actualizada a estado: paid
# [Backend] 📧 Enviando email de pago confirmado...
# [Backend] ✅ Email enviado a juan@example.com
# [Backend] 📦 Orden actualizada a "processing"

# 4. Verificar email en MailHog (http://localhost:8025)
# Subject: ✅ Pago confirmado - Orden #ORD-20260308-001
# To: juan@example.com
# Content: HTML profesional con detalles de orden

# 5. Verificar en Payload admin:
# - Orden status: processing (cambió automáticamente)
# - mercadoPago.paymentId: lleno
```

### Escenario 2: Pago Rechazado

```bash
# 1. Usar misma orden
# 2. Simular webhook (pago rechazado)
npm run test:webhook -- --order-number ORD-20260308-001 --status rejected

# 3. Verificar logs:
# [Backend] ❌ Pago rechazado - Orden ORD-20260308-001 - Razón: insufficient_funds
# [Backend] ✅ Orden actualizada a estado: payment_failed
# [Backend] 📧 Enviando email de pago fallido...

# 4. Email recibido:
# Subject: ⚠️ Problema con tu pago - Orden #ORD-20260308-001
# To: juan@example.com
# Content: Razón del rechazo + instrucciones para reintentar

# 5. Orden status: payment_failed
```

### Escenario 3: Actualizar tracking (Admin)

```bash
# 1. En Payload admin, abrir orden
# 2. Ir a sección "Tracking"
# 3. Ingresar:
#    - Carrier: Starken
#    - Tracking Number: STK123456789
#    - Estimated Delivery: 2026-03-15

# 4. Guardar (esto puede disparar un hook si está configurado)
# O ejecutar manualmente desde backend:

# Línea de código que dispara email:
# await emailService.sendShippingNotification(order, 'STK123456789');

# 5. Email recibido:
# Subject: 🚚 Tu paquete está en camino - #ORD-20260308-001
# Contiene: Número de tracking, empresa, fecha estimada
```

---

## Troubleshooting

### Problema: "Email transporter no inicializado"

**Causa:** `emailService.initialize()` no fue llamado

**Solución:**
```typescript
import { emailService } from '@/services/email.service';

// En server.ts
const start = async () => {
  await emailService.initialize();  // ← Agregar esto
  // ... resto del código
};
```

### Problema: "Cannot find module 'nodemailer'"

**Causa:** Dependencias no instaladas

**Solución:**
```bash
cd backend
npm install nodemailer
npm install
```

### Problema: Webhook retorna 404

**Causa:** Endpoint no está registrado en express

**Solución:** Verificar que `server.ts` tenga:
```typescript
app.post('/api/webhooks/mercadopago', handleMercadoPagoWebhook);
```

### Problema: Email no llega a SendGrid

**Causa:** API key inválida o formato incorrecto

**Solución:**
```bash
# Verificar API key
echo $SENDGRID_API_KEY
# Debe comenzar con "SG."

# O en .env.local
SENDGRID_API_KEY=SG.ABC123DEF456GHI789JKL012MNO345PQR678STU
```

### Problema: "Connection timeout" en SMTP

**Causa:** Puerto SMTP incorrecto o server no accesible

**Solución:**
```bash
# Verificar puerto
telnet smtp.gmail.com 587

# Si usa MailHog
npm run dev:mailhog
# Luego asegurar .env.local:
SMTP_HOST=localhost
SMTP_PORT=1025
```

---

## Logs Esperados

**Startup correcto:**
```
✅ Payload CMS iniciado correctamente
✅ Email service inicializado: smtp
🔔 Webhook: http://localhost:3000/api/webhooks/mercadopago
🚀 Servidor escuchando en puerto 3000
```

**Webhook exitoso:**
```
🔔 Webhook Mercado Pago recibido: { action: 'payment.updated', ... }
💳 Procesando pago 123456789 - Estado: approved
✅ Pago aprobado - Orden ORD-1234
✅ Orden actualizada a estado: paid
📧 Enviando email de pago confirmado...
✅ Email enviado a customer@example.com
📦 Orden actualizada a "processing"
```

---

## Seguridad

### 1. Validar Webhook (Producción)

En `mercadopago.webhook.ts`, agregar validación:

```typescript
// Verificar token del webhook
const token = req.headers['x-webhook-token'];
if (token !== process.env.MERCADOPAGO_WEBHOOK_TOKEN) {
  return res.status(401).json({ error: 'Unauthorized' });
}
```

### 2. HTTPS en Producción

El webhook URL debe ser HTTPS:
```
https://api.pure24.cl/api/webhooks/mercadopago
```

No localhost ni HTTP sin certificado.

### 3. Secrets en .env

Nunca commitear `.env.local`:
```bash
# .gitignore
.env
.env.local
.env.*.local
```

### 4. Rate Limiting

Opcionalmente, agregar rate limiting:

```typescript
import rateLimit from 'express-rate-limit';

const webhookLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 100, // máx 100 requests por minuto
});

app.post('/api/webhooks/mercadopago', webhookLimiter, handleMercadoPagoWebhook);
```

---

## Próximos Pasos

Una vez que PARTE 4.3 esté funcionando correctamente:

### PARTE 4.4 - Producción
- Deploy backend a Railway/Render
- Deploy frontend a Vercel
- Configurar dominio real
- Activar Mercado Pago en producción
- Activar SendGrid/Resend

### FASE 5 - Dashboard Admin
- Panel de estadísticas
- Gestión de órdenes
- Reportes

### FASE 6 - Productización
- Extraer config a `config/tenant.ts`
- Crear CLI para nuevos clientes
- Documentación para reusabilidad

---

## Archivos de Referencia

**Email Templates HTML:**
- Order Confirmation (confirmación de orden)
- Payment Received (pago confirmado)
- Processing (preparando envío)
- Shipping (paquete en camino)
- Payment Failed (pago fallido)

Cada template:
- Responsive design
- Colores temáticos
- Detalles completos de orden
- CTA clara
- Footer con contacto

**Webhook States:**
- `approved` → `paid` → `processing`
- `rejected` → `payment_failed`
- `cancelled` → `cancelled`
- `pending` → `pending`
- `refunded` → `cancelled`

**Email Providers:**
- SMTP (cualquier servidor)
- SendGrid (escala)
- Resend (moderno)

---

## Checklist Final

- [ ] Dependencias instaladas (`npm install nodemailer`)
- [ ] Variables de entorno en `.env.local`
- [ ] Email service configurado
- [ ] Webhook endpoint registrado en `server.ts`
- [ ] MailHog corriendo (desarrollo)
- [ ] `npm run setup:webhook` pasa todas las checks
- [ ] Webhook de test funciona
- [ ] Email recibido en MailHog
- [ ] Orden status actualizado en Payload
- [ ] Webhook URL configurado en Mercado Pago (producción)
- [ ] SendGrid/Resend API key en `.env`
- [ ] Ready para PARTE 4.4

