# Integración Email en CheckoutForm

## Contexto

Actualmente, CheckoutForm.tsx crea una orden en Payload pero **NO envía email de confirmación** automáticamente.

PARTE 4.3 proporciona `emailService` para manejar esto, pero necesita integración en el workflow de checkout.

## Opciones de Integración

### Opción A: Backend Endpoint (RECOMENDADO)

**Ventaja:** Más seguro, centralizado, mejor logging

**Pasos:**

**1. Crear endpoint en `backend/routes/orders.ts`:**

```typescript
import { Request, Response } from 'express';
import payload from 'payload';
import { emailService } from '../services/email.service';

/**
 * POST /api/orders
 * Crea una nueva orden y envía email de confirmación
 */
export async function createOrderWithEmail(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const data = req.body;

    // 1. Validar datos mínimos
    if (!data.orderNumber || !data.customerEmail || !data.items) {
      return res.status(400).json({ error: 'Datos incompletos' });
    }

    // 2. Crear orden en Payload
    const order = await payload.create({
      collection: 'orders',
      data: {
        orderNumber: data.orderNumber,
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        shipping: data.shipping,
        items: data.items,
        subtotal: data.subtotal,
        shippingCost: data.shippingCost || 0,
        discount: data.discount || 0,
        total: data.total,
        status: 'pending',
        // ... resto de datos
      },
    });

    console.log(`✅ Orden creada: ${order.orderNumber}`);

    // 3. Enviar email de confirmación (async, no bloquea response)
    emailService
      .sendOrderConfirmation({
        order,
        customerName: data.customerName,
        customerEmail: data.customerEmail,
      })
      .catch((err) => {
        console.error(`⚠️ Error enviando email para orden ${order.orderNumber}:`, err);
        // No fallar el checkout si falla el email
      });

    // 4. Retornar orden creada inmediatamente
    res.status(201).json({
      success: true,
      order,
      message: 'Orden creada. Procede al pago en Mercado Pago.',
    });
  } catch (error) {
    console.error('❌ Error creando orden:', error);
    res.status(500).json({ error: 'Error al crear orden' });
  }
}
```

**2. Registrar endpoint en `backend/server.ts`:**

```typescript
import { createOrderWithEmail } from './routes/orders';

// ... después de app.use(express.json())

app.post('/api/orders', createOrderWithEmail);
```

**3. Actualizar CheckoutForm.tsx:**

```typescript
// En el handler de submit (cuando usuario completa checkout)

async function handleCheckoutSubmit(e: FormEvent) {
  e.preventDefault();

  try {
    setLoading(true);

    // 1. Crear orden vía backend (que incluye email)
    const orderResponse = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderNumber: generateOrderNumber(), // ej: ORD-20260308-123
        customerName: formData.nombre,
        customerEmail: formData.email,
        customerPhone: formData.telefono,
        shipping: {
          street: formData.calle,
          city: formData.ciudad,
          region: formData.region,
          postalCode: formData.codigoPostal,
          country: 'Chile',
        },
        items: cartState.items.map(item => ({
          product: item.productId,
          quantity: item.quantity,
          priceAtPurchase: item.priceAtTime,
        })),
        subtotal: cartState.subtotal,
        shippingCost: cartState.shippingCost,
        discount: cartState.discount,
        total: cartState.total,
      }),
    });

    if (!orderResponse.ok) {
      throw new Error('Error creando orden');
    }

    const orderData = await orderResponse.json();
    const orderNumber = orderData.order.orderNumber;

    console.log('✅ Orden creada:', orderNumber);
    console.log('📧 Email de confirmación enviado automáticamente');

    // 2. Crear preference de Mercado Pago
    const preferenceResponse = await createMercadoPagoPreference({
      orderNumber,
      amount: cartState.total,
      items: cartState.items,
    });

    // 3. Redirigir a Mercado Pago
    // ... resto del flujo de pago
  } catch (error) {
    console.error('❌ Error:', error);
    setError('Error procesando orden');
  }
}
```

---

### Opción B: Frontend Directo (NO RECOMENDADO)

**Desventaja:** Expone credenciales, menos seguro

No implementar. Usar Opción A.

---

### Opción C: Hook de Payload (ALTERNATIVA)

Si prefieres que Payload maneje automáticamente:

**En `backend/collections/Orders.ts`:**

```typescript
import { emailService } from '../services/email.service';

export const Orders: CollectionConfig = {
  slug: 'orders',
  // ... configuración existing

  // Hook después de crear una orden
  hooks: {
    afterChange: [
      async ({ doc, operation }) => {
        // Solo después de crear (no update)
        if (operation === 'create') {
          console.log(`📧 Hook: Enviando email para orden ${doc.orderNumber}`);

          // Enviar email de confirmación
          await emailService.sendOrderConfirmation({
            order: doc,
            customerName: doc.customerName,
            customerEmail: doc.customerEmail,
          });
        }

        return doc;
      },
    ],
  },

  // ... resto de configuración
};
```

**Ventaja:** Automático, cualquiera que cree orden recibe email

**Desventaja:** Se ejecuta para todos los métodos de creación (admin UI, API, etc.)

---

## Flujo Recomendado (Opción A)

```
CheckoutForm.tsx
    ↓
Usuario completaFormulario()
    ↓
handleCheckoutSubmit()
    ├─ Validar datos locales
    ├─ Mostrar loading=true
    ↓
POST /api/orders (CheckoutForm → Backend)
    ├─ Validar datos (backend)
    ├─ Crear orden en Payload
    ├─ Disparar emailService.sendOrderConfirmation()
    ├─ (Async - no bloquea)
    └─ Retornar orden + orderNumber inmediatamente
    ↓
CheckoutForm recibe respuesta
    ├─ orderNumber confirmado
    ├─ Proceder a Mercado Pago
    ↓
createMercadoPagoPreference()
    ├─ external_reference = orderNumber ← CRÍTICO
    ├─ Retornar checkoutUrl
    ↓
window.location = checkoutUrl
    ↓
[Usuario paga en Mercado Pago]
    ↓
[Mercado Pago webhook a /api/webhooks/mercadopago]
    ├─ Verificar y obtener datos de pago
    ├─ Buscar orden por external_reference (orderNumber)
    ├─ Actualizar orden status=paid
    ├─ Disparar emailService.sendPaymentReceived()
    └─ Cambiar a status=processing (5s después)
```

---

## Datos del Carrito → Orden

**Desde CartState (frontend/src/store/cart.ts):**

```typescript
{
  items: [
    {
      productId: "uuid-123",
      productName: "Whey Protein",
      priceAtTime: 34990,
      quantity: 2,
      mainImage: "url-a-imagen"
    }
  ],
  subtotal: 69980,
  shippingCost: 5000,
  discount: 0,
  total: 74980,
  discountCode: null,
  lastUpdated: "2026-03-08T..."
}
```

**A Orden (Payload):**

```typescript
{
  orderNumber: "ORD-20260308-123456",
  customerName: "Juan Pérez",
  customerEmail: "juan@example.com",
  customerPhone: "+56912345678",
  shipping: {
    street: "Calle Principal 123",
    apartment: "Apto 5",
    city: "Punta Arenas",
    region: "Magallanes y de la Antártica Chilena",
    postalCode: "6200000",
    country: "Chile"
  },
  items: [
    {
      product: "uuid-123",      // Relationship a Products
      quantity: 2,
      priceAtPurchase: 34990    // Snapshot del precio
    }
  ],
  subtotal: 69980,
  shippingCost: 5000,
  discount: 0,
  total: 74980,
  status: "pending",
  mercadoPago: {
    transactionId: null,        // Se llena en webhook
    paymentId: null,
    paymentMethod: null,
    installments: 1
  }
}
```

---

## Email Automático - Timeline

```
T+0s:    Usuario submit checkout
         POST /api/orders
         Orden creada en Payload
         ✉️ EMAIL #1 enviado (async)
         ↓
         Response con orderNumber
         Redirigir a Mercado Pago

T+180s: (ej) Usuario completa pago en Mercado Pago
        Mercado Pago webhook enviado
        ✉️ EMAIL #2 enviado (pago confirmado)
        Status: pending → paid

T+185s: (5s después)
        Status: paid → processing
        ✉️ EMAIL #3 enviado (preparando envío)

T+24h:  (después) Admin actualiza tracking
        ✉️ EMAIL #4 enviado (en camino)

Si el pago falla:
        ✉️ EMAIL #5 enviado (pago fallido)
        Status: pending → payment_failed
```

---

## Testing

### Test 1: Email de Confirmación

```bash
# 1. Crear orden manualmente en Payload admin
# Datos:
# - orderNumber: ORD-TEST-001
# - customerEmail: test@example.com
# - customerName: Test User

# 2. Email debe enviarse automáticamente
# Verificar en MailHog: http://localhost:8025

# Expected email:
# Subject: Orden #ORD-TEST-001 - Pure24 Nutrition
# To: test@example.com
# Body: HTML con detalles de orden
```

### Test 2: Flujo Completo

```bash
# 1. Abrir http://localhost:3001/checkout
# 2. Completar formulario:
#    - Nombre: Juan Pérez
#    - Email: juan@test.local
#    - Dirección: Jorge Montt 934
#    - Ciudad: Punta Arenas
#
# 3. Click "Proceder al pago"
#
# 4. Backend:
#    ✅ Orden creada
#    ✅ Email #1 enviado
#    ↓ Redirige a Mercado Pago (simulado)
#
# 5. MailHog (http://localhost:8025):
#    📧 Email recibido: "Orden #ORD-... - Pure24 Nutrition"
#
# 6. Mercado Pago (simulado):
#    - En desarrollo, confirma automáticamente
#    - Webhook ejecuta
#
# 7. Backend:
#    ✅ Email #2 (pago confirmado)
#    ✅ Email #3 (preparando envío)
#
# 8. MailHog:
#    📧 Email 2: "✅ Pago confirmado"
#    📧 Email 3: "📦 Preparando tu envío"
```

---

## Variables de Entorno Necesarias

En `backend/.env.local`:

```bash
# Core
NODE_ENV=development
PAYLOAD_SECRET=dev_secret

# Email
EMAIL_PROVIDER=smtp
EMAIL_FROM=noreply@pure24.cl
SMTP_HOST=localhost
SMTP_PORT=1025  # MailHog

# Mercado Pago
MERCADOPAGO_ACCESS_TOKEN=TEST_TOKEN
PUBLIC_MERCADOPAGO_PUBLIC_KEY=TEST_KEY
```

---

## Debugging

**Si el email no se envía:**

```bash
# 1. Verificar logs del backend
# Buscar: "📧 Enviando email de confirmación"

# 2. Verificar MailHog está corriendo
# Accede a http://localhost:8025

# 3. Revisar ENV vars
echo $EMAIL_PROVIDER
echo $SMTP_HOST

# 4. Verificar EMAIL_FROM es válido
# Debe estar en formato: name@domain.com

# 5. Si usas SMTP, verificar conexión
telnet localhost 1025
```

**Si el email llega pero vacío:**

```bash
# 1. Verificar HTML de la plantilla
# Ver en backend/services/email.service.ts

# 2. Revisar datos enviados a emailService
# Loguear objeto "data" antes de llamar
console.log('Email data:', emailData);

# 3. Verificar that emailService está inicializado
# En server.ts: await emailService.initialize()
```

---

## Checklist de Integración

- [ ] Email service instalado y funcionando
- [ ] Endpoint POST /api/orders creado en backend
- [ ] Endpoint registrado en server.ts
- [ ] CheckoutForm.tsx actualizado para POST /api/orders
- [ ] Email #1 (confirmación) se envía
- [ ] orderNumber se retorna del endpoint
- [ ] Mercado Pago preference usa external_reference
- [ ] Webhook recibe y procesa webhook
- [ ] Email #2 (pago confirmado) se envía
- [ ] Email #3 (preparación) se envía automáticamente
- [ ] Status de orden actualiza correctamente

---

## Próximo Paso

Una vez que emails están funcionando:

→ **PARTE 4.4 - Producción**
- Deploy a Vercel (frontend) + Railway (backend)
- Configurar Mercado Pago en producción
- Activar SendGrid/Resend
- Configurar webhook URL real

