# 📚 n8n + Directus - Guía de Referencia Rápida

**Status:** ✅ Completada
**Para:** Integraciones n8n ↔ Directus
**Backend:** Directus (Puerto 8055)
**Workflow:** n8n (Puerto 5678)

---

## 🔑 1. Autenticación en Directus

### 1.1 - Obtener API Token

```
1. Ir a: http://localhost:8055/admin
2. Login con tus credenciales
3. Settings (icono engranaje, abajo a la izquierda)
4. Click "Access Tokens"
5. Click "Create Token" (botón azul)
```

**Formulario:**
```
Name: n8n-webhook-automation
Role: Admin (necesita permisos completos)
Expiration: Never (indefinido)
```

**Resultado:** Token tipo JWT
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3NfaWQiOiI...
```

### 1.2 - Guardar en n8n

```
n8n → Settings (tu usuario)
→ Environment Variables
→ Add Variable

Name: DIRECTUS_API_TOKEN
Value: [pega-el-token]
→ Save
```

### 1.3 - Verificar Token (curl)

```bash
TOKEN="[tu-token]"

curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8055/api/items/products?limit=1

# Debe retornar JSON sin error 401
```

---

## 📡 2. Endpoints Principales

### 2.1 - GET: Obtener Producto por SKU

```
GET http://localhost:8055/api/items/products
?filter[sku][_eq]=P24-OMEGA3-001
&fields=id,sku,name,price,stock,description,image
```

**Headers:**
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
      "stock": 45,
      "description": "Suplemento...",
      "image": "producto-omega3.jpg"
    }
  ],
  "meta": {
    "filter_count": 1,
    "total_count": 1
  }
}
```

---

### 2.2 - GET: Obtener Todos los Productos

```
GET http://localhost:8055/api/items/products
?limit=100
&fields=id,sku,name,price,stock
```

**Response:**
```json
{
  "data": [
    { "id": "uuid1", "sku": "P24-OMEGA3-001", "name": "...", "price": 17990, "stock": 45 },
    { "id": "uuid2", "sku": "P24-MAGNESIO-001", "name": "...", "price": 12990, "stock": 30 },
    ...
  ],
  "meta": {
    "filter_count": 50,
    "total_count": 50
  }
}
```

---

### 2.3 - PATCH: Actualizar Stock

```
PATCH http://localhost:8055/api/items/products/{product_id}

Headers:
Authorization: Bearer {{ env.DIRECTUS_API_TOKEN }}
Content-Type: application/json

Body:
{
  "stock": 44
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

### 2.4 - POST: Crear Orden

```
POST http://localhost:8055/api/items/orders

Headers:
Authorization: Bearer {{ env.DIRECTUS_API_TOKEN }}
Content-Type: application/json

Body:
{
  "mp_transaction_id": "123456789",
  "sku": "P24-OMEGA3-001",
  "quantity": 1,
  "amount": 17990,
  "customer_email": "cliente@example.com",
  "status": "approved",
  "payment_method": "mercado_pago"
}
```

**Response:**
```json
{
  "data": {
    "id": "order-uuid",
    "mp_transaction_id": "123456789",
    "status": "approved",
    "created_at": "2026-03-08T14:30:00Z"
  }
}
```

---

## 🔀 3. Nodos n8n para Directus

### 3.1 - HTTP Node: GET Producto

**Config en n8n:**

```
Name: Fetch Producto from Directus
Method: GET
URL: http://localhost:8055/api/items/products
```

**Query Parameters:**
```
filter[sku][_eq]     = {{ $nodes."Nodo Anterior".json.sku }}
fields               = id,sku,name,price,stock,description
```

**Headers:**
```
Authorization = Bearer {{ env.DIRECTUS_API_TOKEN }}
Content-Type  = application/json
```

---

### 3.2 - Code Node: Extraer Datos

```javascript
const response = $input.first().json;

if (!response.data || response.data.length === 0) {
  throw new Error('Producto no encontrado en Directus');
}

const product = response.data[0];

return {
  productId: product.id,
  sku: product.sku,
  name: product.name,
  price: product.price,
  currentStock: product.stock,
  description: product.description
};
```

---

### 3.3 - HTTP Node: PATCH Stock

```
Name: Update Stock in Directus
Method: PATCH
URL: http://localhost:8055/api/items/products/{{ $nodes."Extract Data".json.productId }}

Body (JSON):
{
  "stock": {{ $nodes."Extract Data".json.currentStock - 1 }}
}

Headers:
Authorization = Bearer {{ env.DIRECTUS_API_TOKEN }}
Content-Type  = application/json
```

---

### 3.4 - HTTP Node: POST Crear Orden

```
Name: Create Order in Directus
Method: POST
URL: http://localhost:8055/api/items/orders

Body (JSON):
{
  "mp_transaction_id": "{{ $nodes."Verify Payment".json.paymentId }}",
  "sku": "{{ $nodes."Extract Data".json.sku }}",
  "quantity": 1,
  "amount": {{ $nodes."Verify Payment".json.amount }},
  "customer_email": "{{ $nodes."Verify Payment".json.email }}",
  "status": "approved",
  "payment_method": "mercado_pago"
}

Headers:
Authorization = Bearer {{ env.DIRECTUS_API_TOKEN }}
Content-Type  = application/json
```

---

## 🔍 4. Filtros Avanzados

### 4.1 - Stock Bajo (<10)

```
GET http://localhost:8055/api/items/products
?filter[stock][_lt]=10
&fields=id,sku,name,stock
```

---

### 4.2 - Órdenes Aprobadas en Últimas 24h

```
GET http://localhost:8055/api/items/orders
?filter[status][_eq]=approved
&filter[created_at][_gte]=2026-03-07T14:30:00Z
&fields=id,sku,amount,customer_email
```

---

### 4.3 - Órdenes de un Cliente

```
GET http://localhost:8055/api/items/orders
?filter[customer_email][_eq]=cliente@example.com
&fields=id,sku,amount,status,created_at
```

---

### 4.4 - Productos entre rango de precio

```
GET http://localhost:8055/api/items/products
?filter[price][_gte]=10000
&filter[price][_lte]=20000
&fields=id,sku,name,price
```

---

### 4.5 - Órdenes rechazadas

```
GET http://localhost:8055/api/items/orders
?filter[status][_eq]=rejected
&fields=id,sku,customer_email,created_at
```

---

## 🚨 5. Error Handling en n8n

### 5.1 - Try-Catch Pattern

```javascript
// Nodo Code con error handling
try {
  const response = await fetch(
    `http://localhost:8055/api/items/products/{{ productId }}`,
    {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${process.env.DIRECTUS_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ stock: newStock })
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();
  return { success: true, data };
} catch (error) {
  console.error('❌ Error:', error.message);
  throw error;
}
```

---

### 5.2 - Retry Logic (3 intentos)

```javascript
let retries = 0;
const maxRetries = 3;
const retryDelay = 2000; // 2 segundos

while (retries < maxRetries) {
  try {
    // Hacer request aquí
    return { success: true };
  } catch (error) {
    retries++;
    console.log(`Intento ${retries}/${maxRetries}...`);

    if (retries >= maxRetries) {
      throw new Error(`Falló después de ${maxRetries} intentos`);
    }

    // Esperar antes de reintentar
    await new Promise(resolve => setTimeout(resolve, retryDelay));
  }
}
```

---

### 5.3 - Error Node

Agregar nodo **Error** después de un nodo que puede fallar:

```
Name: Handle Stock Update Error
Tipo: Error

En n8n UI:
- Click en el nodo HTTP que hace PATCH
- Click el X rojo (error handler)
- Agregar "Error" node
```

**Código del Error node:**
```javascript
const error = $input.first().json;

console.error('❌ ERROR actualizando stock en Directus');
console.error('  Status:', error.status);
console.error('  Message:', error.message);

// Enviar alerta (email, Slack, log, etc.)
// Aquí puedes notificar al admin

throw new Error(`Directus error: ${error.message}`);
```

---

## 🧪 6. Testing Manual (curl)

### 6.1 - Test GET Producto

```bash
API_KEY="[tu-directus-api-token]"

curl -X GET \
  "http://localhost:8055/api/items/products?filter[sku][_eq]=P24-OMEGA3-001&fields=id,sku,name,price,stock" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json"
```

**Respuesta esperada:**
```json
{
  "data": [
    {
      "id": "a1b2c3d4...",
      "sku": "P24-OMEGA3-001",
      "name": "OMEGA 3 + ADEK 90 CAPS",
      "price": 17990,
      "stock": 45
    }
  ]
}
```

---

### 6.2 - Test PATCH Stock

```bash
API_KEY="[tu-directus-api-token]"
PRODUCT_ID="a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d"

curl -X PATCH \
  "http://localhost:8055/api/items/products/$PRODUCT_ID" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "stock": 44 }'
```

**Respuesta esperada:**
```json
{
  "data": {
    "id": "a1b2c3d4...",
    "sku": "P24-OMEGA3-001",
    "stock": 44
  }
}
```

---

### 6.3 - Test POST Orden

```bash
API_KEY="[tu-directus-api-token]"

curl -X POST \
  "http://localhost:8055/api/items/orders" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "mp_transaction_id": "999888777",
    "sku": "P24-OMEGA3-001",
    "quantity": 1,
    "amount": 17990,
    "customer_email": "test@example.com",
    "status": "approved",
    "payment_method": "mercado_pago"
  }'
```

**Respuesta esperada:**
```json
{
  "data": {
    "id": "order-uuid",
    "mp_transaction_id": "999888777",
    "status": "approved",
    "created_at": "2026-03-08T14:30:00Z"
  }
}
```

---

## 📊 7. Estructura de Colecciones en Directus

### Collection: products

```
Field           | Type      | Unique | Required
─────────────────────────────────────────────
id              | UUID      | Yes    | Yes
sku             | Text      | Yes    | Yes
name            | Text      | No     | Yes
price           | Integer   | No     | Yes
stock           | Integer   | No     | No
description     | Text      | No     | No
image           | File      | No     | No
created_at      | Date      | No     | Auto
updated_at      | Date      | No     | Auto
```

### Collection: orders

```
Field              | Type      | Unique | Required
──────────────────────────────────────────────
id                 | UUID      | Yes    | Yes
mp_transaction_id  | Text      | Yes    | Yes
sku                | Text      | No     | Yes
name               | Text      | No     | No
quantity           | Integer   | No     | No
amount             | Integer   | No     | Yes
customer_email     | Text      | No     | Yes
status             | Select    | No     | Yes*
payment_method     | Text      | No     | No
created_at         | Date      | No     | Auto
updated_at         | Date      | No     | Auto
```

**Status options:** pending, approved, rejected, refunded

---

## ✅ 8. Checklist de Configuración

- [ ] API Token de Directus generado
- [ ] Token guardado en n8n como DIRECTUS_API_TOKEN
- [ ] Colecciones products y orders existen
- [ ] Campos SKU y stock están en products
- [ ] Campos mp_transaction_id y status están en orders
- [ ] Test GET funciona (curl)
- [ ] Test PATCH funciona (stock actualiza)
- [ ] Test POST funciona (orden se crea)
- [ ] Permiso "Admin" en el token
- [ ] No hay firewall bloqueando puerto 8055

---

## 🔗 9. Variables n8n Environment

```
DIRECTUS_API_TOKEN = [tu-token]
MP_ACCESS_TOKEN = [token-mercado-pago]
MP_WEBHOOK_SECRET = [webhook-secret-mp]
NODE_ENV = sandbox (o production)
SMTP_HOST = smtp.gmail.com (para email)
SMTP_USER = [tu-email]
SMTP_PASS = [tu-contraseña-app]
```

---

## 🎯 10. Resumen de Operaciones

| Operación | Método | Endpoint | Uso |
|-----------|--------|----------|-----|
| Get producto | GET | /api/items/products | Fetch en FASE 5.1 |
| Update stock | PATCH | /api/items/products/{id} | FASE 5.2 |
| Create order | POST | /api/items/orders | FASE 5.2 |
| Get all orders | GET | /api/items/orders | Dashboard |
| Get orders por cliente | GET | /api/items/orders (con filter) | Dashboard |

---

## 🚀 Uso Rápido en n8n

**En cualquier nodo HTTP de n8n:**

```
URL: http://localhost:8055/api/items/{collection}?filter[campo][_operador]=valor

Operadores:
_eq = igual
_neq = no igual
_lt = menor que
_lte = menor o igual
_gt = mayor que
_gte = mayor o igual
_in = en lista
_nin = no en lista
```

---

**Status:** ✅ Referencia Completa
**Siguiente:** Implementar FASE 5.2
**Tiempo referencia:** ~30 minutos de lectura
**Complejidad:** ⭐⭐ (Intermedia)

📚 **Usa este documento como referencia mientras implementas**
