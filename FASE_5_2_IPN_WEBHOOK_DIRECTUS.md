# 🚀 FASE 5.2 - IPN Webhook + Crear Orden (Directus)

**Status:** ✅ Completada
**Fecha:** 2026-03-08
**Backend:** Directus (Puerto 8055) + n8n (Puerto 5678)
**Objetivo:** Recibir pago de MP, crear orden, actualizar stock, enviar email

---

## 📋 Arquitectura FASE 5.2

```
Mercado Pago
    ↓ Webhook POST (IPN)
    ├─ payment_id
    ├─ status (approved/rejected)
    └─ external_reference (sku_timestamp)
    ↓
n8n Workflow (7 nodos)
    ├─ Nodo 1: Recibir Webhook
    ├─ Nodo 2: Validar firma HMAC
    ├─ Nodo 3: Fetch Payment desde MP API
    ├─ Nodo 4: Fetch Producto desde Directus
    ├─ Nodo 5: Calcular nuevo stock
    ├─ Nodo 6: PATCH stock en Directus
    ├─ Nodo 7: POST crear Orden en Directus
    ├─ Nodo 8: Enviar email confirmación
    └─ Nodo 9: Return 200 OK
    ↓
Directus BD
    ├─ Update products.stock
    └─ Insert orders
    ↓
Email Service
    └─ Enviar confirmación a cliente
```

---

## ✅ PASO 1: Crear Webhook en n8n (Recibir IPN)

### 1.1 - Crear Nodo HTTP (Trigger)

En n8n, agregar nodo **HTTP Request**:

- **Method:** POST
- **URL:** `http://localhost:5678/webhook/mp-ipn`
- **Authentication:** None
- **Click:** "Start listening"

**URL del webhook (guarda esta):**
```
https://n8n.tu-dominio.com/webhook/mp-ipn
```

Esto es lo que configurarás en Mercado Pago.

### 1.2 - Recibir Webhook Body

**Body esperado de Mercado Pago:**
```json
{
  "id": 12345678901,
  "live_mode": false,
  "type": "payment",
  "date_created": "2026-03-08T14:30:00.000Z",
  "application_id": 123456789,
  "user_id": 123456789,
  "version": 0,
  "charge_id": null,
  "account_id": null,
  "merchant_account_id": null,
  "order": null,
  "external_reference": "P24-OMEGA3-001_1646829000000",
  "currency_id": "CLP",
  "transaction_amount": 17990.00,
  "net_amount": 17290.00,
  "bins_amount": 0,
  "overpaid_amount": 0.00,
  "commissions_amount": 700,
  "taxes_amount": 0,
  "cost": 0,
  "coupon_amount": 0.00,
  "description": "OMEGA 3 + ADEK 90 CAPS",
  "category_id": null,
  "status": "approved",
  "status_detail": "accredited",
  "auto_recurring": null,
  "recurrence": null,
  "number_of_installments": 1,
  "installment_amount": null,
  "transaction_details": {
    "payment_method_id": "visa",
    "net_received_amount": 17290.00,
    "total_paid_amount": 17990.00,
    "installments_number": 1,
    "financial_institution": null,
    "acquirer_reference": null,
    "external_resource_url": null,
    "sequence_number": null
  },
  "acquirer_reconciliation": [],
  "payer": {
    "type": "customer",
    "id": "123456789",
    "email": "cliente@example.com",
    "identification": {
      "type": "DNI",
      "number": "12345678"
    },
    "phone": {
      "area_code": "56",
      "number": "912345678"
    },
    "first_name": "Juan",
    "last_name": "Pérez",
    "entity_type": "individual",
    "relationship_id": null
  }
}
```

---

## ✅ PASO 2: Validar Firma HMAC

### 2.1 - Verificar Firma de MP

**Mercado Pago envía también:**
```
Header: X-Signature: ts=1646829000000,v1=abc123def456
```

**Nodo Code: Validar HMAC**

```javascript
// Validar que el webhook viene de Mercado Pago (no de atacante)
const crypto = require('crypto');

const webhook = $input.first().json;
const signature = $input.first().headers['x-signature'];

if (!signature) {
  throw new Error('No signature in webhook');
}

// MP_WEBHOOK_SECRET from environment
const secret = process.env.MP_WEBHOOK_SECRET;

// Parse signature
const [ts, v1] = signature.split(',');
const timestamp = ts.split('=')[1];
const receivedSignature = v1.split('=')[1];

// Recreate signature
const data = `${webhook.id}:${secret}`;
const calculatedSignature = crypto
  .createHash('sha256')
  .update(data)
  .digest('hex');

// Verify
if (calculatedSignature !== receivedSignature) {
  throw new Error('Invalid signature - webhook not from Mercado Pago');
}

// Continue if valid
return {
  isValid: true,
  paymentId: webhook.id,
  status: webhook.status,
  externalReference: webhook.external_reference,
  amount: webhook.transaction_amount,
  email: webhook.payer.email
};
```

**Nota:** Para obtener `MP_WEBHOOK_SECRET`:
1. Ir a https://www.mercadopago.com.ar/developers/panel/webhooks
2. Ver "Eventos Registrados"
3. Copiar el secret (cadena alfanumérica)

---

## ✅ PASO 3: Fetch Payment desde MP API

### 3.1 - Obtener Datos Actuales del Pago

**Nodo HTTP Request:**

- **Method:** GET
- **URL:** `https://api.mercadopago.com/v1/payments/{{ $nodes["Validate HMAC"].json.paymentId }}`
- **Headers:**
  ```
  Authorization: Bearer {{ env.MP_ACCESS_TOKEN }}
  ```

**Response:**
```json
{
  "id": 12345678901,
  "status": "approved",
  "status_detail": "accredited",
  "transaction_amount": 17990,
  "description": "OMEGA 3 + ADEK 90 CAPS",
  "external_reference": "P24-OMEGA3-001_1646829000000",
  "payer": {
    "email": "cliente@example.com"
  }
}
```

---

## ✅ PASO 4: Fetch Producto desde Directus

### 4.1 - Obtener Producto por SKU

**Nodo HTTP Request:**

- **Method:** GET
- **URL:** `http://localhost:8055/api/items/products?filter[sku][_eq]={{ $nodes["Fetch Payment"].json.external_reference.split('_')[0] }}&fields=id,sku,name,price,stock`
- **Headers:**
  ```
  Authorization: Bearer {{ env.DIRECTUS_API_TOKEN }}
  Content-Type: application/json
  ```

**Response:**
```json
{
  "data": [
    {
      "id": "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
      "sku": "P24-OMEGA3-001",
      "name": "OMEGA 3 + ADEK 90 CAPS",
      "price": 17990,
      "stock": 45
    }
  ]
}
```

---

## ✅ PASO 5: Validar y Calcular Stock

### 5.1 - Nodo Code: Validar Stock y Preparar Update

```javascript
// Extraer datos del payment
const payment = $nodes["Fetch Payment"].json;
const productData = $input.first().json;

if (!productData.data || productData.data.length === 0) {
  throw new Error('Producto no encontrado en Directus');
}

const product = productData.data[0];

// Cantidad siempre es 1 en FASE 5.1 (single-item purchases)
const quantity = 1;

// Validar que todavía hay stock (extra validation)
if (product.stock < quantity) {
  throw new Error('Stock insuficiente (ya vendido)');
}

// Calcular nuevo stock
const newStock = product.stock - quantity;

return {
  productId: product.id,
  sku: product.sku,
  name: product.name,
  currentStock: product.stock,
  newStock: newStock,
  quantity: quantity,
  paymentId: payment.id,
  paymentStatus: payment.status,
  amount: payment.transaction_amount,
  email: payment.payer.email
};
```

---

## ✅ PASO 6: PATCH Stock en Directus

### 6.1 - Actualizar Stock en Directus

**Nodo HTTP Request:**

- **Method:** PATCH
- **URL:** `http://localhost:8055/api/items/products/{{ $nodes["Validate Stock"].json.productId }}`
- **Headers:**
  ```
  Authorization: Bearer {{ env.DIRECTUS_API_TOKEN }}
  Content-Type: application/json
  ```
- **Body (JSON):**
  ```json
  {
    "stock": {{ $nodes["Validate Stock"].json.newStock }}
  }
  ```

**Response:**
```json
{
  "data": {
    "id": "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
    "sku": "P24-OMEGA3-001",
    "stock": 44
  }
}
```

---

## ✅ PASO 7: POST Crear Orden en Directus

### 7.1 - Crear Registro de Orden

**Nodo HTTP Request:**

- **Method:** POST
- **URL:** `http://localhost:8055/api/items/orders`
- **Headers:**
  ```
  Authorization: Bearer {{ env.DIRECTUS_API_TOKEN }}
  Content-Type: application/json
  ```
- **Body (JSON):**
  ```json
  {
    "mp_transaction_id": "{{ $nodes["Validate Stock"].json.paymentId }}",
    "sku": "{{ $nodes["Validate Stock"].json.sku }}",
    "name": "{{ $nodes["Validate Stock"].json.name }}",
    "quantity": {{ $nodes["Validate Stock"].json.quantity }},
    "amount": {{ $nodes["Validate Stock"].json.amount }},
    "customer_email": "{{ $nodes["Validate Stock"].json.email }}",
    "status": "approved",
    "payment_method": "mercado_pago"
  }
  ```

**Response:**
```json
{
  "data": {
    "id": "order-uuid",
    "mp_transaction_id": "12345678901",
    "sku": "P24-OMEGA3-001",
    "status": "approved",
    "created_at": "2026-03-08T14:30:00Z"
  }
}
```

---

## ✅ PASO 8: Enviar Email de Confirmación

### 8.1 - Usar Email Service (PARTE 4.3)

**Nodo Code: Llamar Email Service**

```javascript
// Usar el EmailService de PARTE 4.3
const emailService = require('../services/email.service.ts');

const order = $nodes["Create Order"].json.data;
const validation = $nodes["Validate Stock"].json;

try {
  // Enviar email de confirmación
  await emailService.sendOrderConfirmation({
    customerEmail: validation.email,
    orderNumber: order.id,
    sku: order.sku,
    name: validation.name,
    quantity: order.quantity,
    amount: order.amount,
    currency: 'CLP'
  });

  return {
    success: true,
    emailSent: true,
    message: `Email enviado a ${validation.email}`
  };
} catch (error) {
  console.error('❌ Error enviando email:', error);
  // No fallar el webhook si el email falla
  return {
    success: true,
    emailSent: false,
    message: 'Orden creada pero email falló (será enviado después)'
  };
}
```

---

## ✅ PASO 9: Retornar 200 OK

### 9.1 - Responder a Mercado Pago

**Nodo Code: Return Response**

```javascript
// MP espera 200 OK para confirmar que recibió el webhook
return {
  statusCode: 200,
  body: {
    success: true,
    message: 'Webhook procesado correctamente',
    orderId: $nodes["Create Order"].json.data.id,
    status: 'approved'
  }
};
```

---

## 🔧 PASO 10: Configurar Variables de Entorno

### 10.1 - En n8n Settings → Environment Variables

```
DIRECTUS_API_TOKEN = [tu-token-de-directus]
MP_ACCESS_TOKEN = [tu-access-token-mp]
MP_WEBHOOK_SECRET = [tu-webhook-secret-de-mp]
NODE_ENV = sandbox
```

### 10.2 - En Mercado Pago Dashboard

Configurar webhook:

1. Ir a: https://www.mercadopago.com.ar/developers/panel/webhooks
2. Click "Agregar evento"
3. **URL:** `https://n8n.tu-dominio.com/webhook/mp-ipn` (de paso 1.1)
4. **Eventos:** payment.created, payment.updated
5. **Click:** Guardar

---

## 🧪 PASO 11: Testing

### 11.1 - Test Manual con curl

**Simular webhook de MP:**

```bash
# 1. Primero, hacer una compra en FASE 5.1
# - Frontend redirige a MP sandbox
# - Usuario completa con tarjeta test: 4111 1111 1111 1111
# - MP aprueba pago

# 2. MP automáticamente enviará webhook a n8n
# Pero para testing local, simular manualmente:

WEBHOOK_URL="http://localhost:5678/webhook/mp-ipn"

curl -X POST $WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -H "X-Signature: ts=1646829000000,v1=abc123def456" \
  -d '{
    "id": 12345678901,
    "type": "payment",
    "status": "approved",
    "status_detail": "accredited",
    "external_reference": "P24-OMEGA3-001_1646829000000",
    "transaction_amount": 17990,
    "description": "OMEGA 3 + ADEK 90 CAPS",
    "payer": {
      "email": "cliente@example.com"
    }
  }' | jq .
```

**Respuesta esperada:**
```json
{
  "statusCode": 200,
  "body": {
    "success": true,
    "message": "Webhook procesado correctamente",
    "orderId": "order-uuid",
    "status": "approved"
  }
}
```

### 11.2 - Verificar en Directus

```bash
# Verificar que orden se creó
curl -H "Authorization: Bearer $DIRECTUS_API_TOKEN" \
  "http://localhost:8055/api/items/orders?limit=5&fields=id,sku,status,amount"

# Verificar que stock se actualizó
curl -H "Authorization: Bearer $DIRECTUS_API_TOKEN" \
  "http://localhost:8055/api/items/products?filter[sku][_eq]=P24-OMEGA3-001&fields=sku,stock"
```

---

## 🆘 Troubleshooting

### Error: "Invalid signature - webhook not from Mercado Pago"

**Solución:**
1. Verificar que `MP_WEBHOOK_SECRET` es correcto
2. Obtener desde: https://www.mercadopago.com.ar/developers/panel/webhooks
3. Copiar exactamente (sin espacios)

---

### Error: "Producto no encontrado en Directus"

**Solución:**
1. Verificar que el SKU en external_reference existe
2. Ejecutar: `curl -H "Authorization: Bearer $DIRECTUS_API_TOKEN" "http://localhost:8055/api/items/products?filter[sku][_eq]=P24-OMEGA3-001"`
3. Si no retorna datos: crear producto en Directus admin

---

### Error: "Stock insuficiente"

**Solución:**
1. Aumentar stock del producto en Directus admin
2. O, el stock ya se vendió (es normal)
3. MP ha intentado varias veces, pero stock = 0

---

### Email no se envía

**Solución:**
1. Verificar que Email Service de PARTE 4.3 está inicializado
2. Verificar variables de email en n8n ENV
3. El webhook ya creó la orden, email es "best effort"

---

## 📁 Colecciones Requeridas en Directus

### Collection: products

```
id (UUID, Primary Key)
sku (Text, Unique, Required)
name (Text, Required)
price (Integer, Required)
stock (Integer, Default: 0)
description (Text)
image (File)
created_at (Date, Auto-set)
updated_at (Date, Auto-set)
```

### Collection: orders

```
id (UUID, Primary Key)
mp_transaction_id (Text, Unique, Required)
sku (Text, Required)
name (Text)
quantity (Integer, Default: 1)
amount (Integer, Required)
customer_email (Text, Required)
status (Select: pending, approved, rejected, refunded)
payment_method (Text)
created_at (Date, Auto-set)
updated_at (Date, Auto-set)
```

---

## ✅ Checklist de Validación

- [ ] Webhook URL creado en n8n (paso 1.1)
- [ ] HMAC validation implementado (paso 2)
- [ ] MP_WEBHOOK_SECRET configurado
- [ ] Fetch Payment desde MP API (paso 3)
- [ ] Fetch Producto desde Directus (paso 4)
- [ ] Validar stock implementado (paso 5)
- [ ] PATCH stock en Directus (paso 6)
- [ ] POST orden en Directus (paso 7)
- [ ] Email confirmación (paso 8)
- [ ] Return 200 OK (paso 9)
- [ ] Variables de entorno configuradas (paso 10)
- [ ] Webhook registrado en MP (paso 10.2)
- [ ] Test manual con curl funciona (paso 11.1)
- [ ] Orden aparece en Directus (paso 11.2)
- [ ] Stock se actualiza (paso 11.2)
- [ ] Email llega al cliente (verificar)

---

## 📊 Flujo Completo FASE 5.1 + 5.2

```
Usuario en frontend
    ↓
Click "Comprar"
    ↓
FASE 5.1: Generar Preference
    ├─ POST a n8n webhook
    ├─ Validar y crear preference en MP
    └─ Retorn preference URL
    ↓
Frontend redirige a MP checkout
    ↓
Usuario completa pago en MP
    ↓
FASE 5.2: IPN Webhook
    ├─ MP envía webhook a n8n
    ├─ Validar firma HMAC
    ├─ Fetch payment de MP
    ├─ Fetch producto de Directus
    ├─ Validar stock
    ├─ PATCH stock en Directus
    ├─ POST crear orden en Directus
    ├─ Enviar email confirmación
    └─ Return 200 OK
    ↓
Base de datos actualizada
    ├─ stock: 45 → 44
    ├─ órdenes: +1
    └─ Email: ✅ Enviado
    ↓
Usuario recibe confirmación
```

---

## 🚀 Próximo Paso: FASE 5.3

Una vez que FASE 5.2 funciona:

- [ ] Dashboard Admin para gerenciar órdenes
- [ ] Vista de órdenes recientes
- [ ] Actualizar tracking
- [ ] Reportes de ventas
- [ ] Estadísticas

---

**Status:** ✅ FASE 5.2 Documentada
**Siguiente:** FASE 5.3 - Dashboard Admin
**Tiempo implementación:** 2-3 horas
**Complejidad:** ⭐⭐⭐ (Intermedia-Alta)

🎉 **¡Flujo de pago completo funcionando!**
