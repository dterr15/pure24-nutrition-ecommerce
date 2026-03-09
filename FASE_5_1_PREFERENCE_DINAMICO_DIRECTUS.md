# 🚀 FASE 5.1 - Preference Dinámico en n8n (con Directus)

**Status:** ✅ Actualizado para Directus
**Última actualización:** 2026-03-08
**Backend:** Directus (Puerto 8055)
**Objetivo:** Generar link de pago dinámico validando contra BD Directus

---

## 📋 Arquitectura

```
Frontend (Click "Comprar")
    ↓ POST /webhook/create-preference
    ↓ (n8n workflow)
    ├─ Validar input (sku, quantity, email)
    ├─ Fetch producto desde Directus
    ├─ Validar precio y stock (seguridad)
    ├─ Crear Preference en MP API
    └─ Return { preferenceUrl, validPrice }
    ↓
Frontend redirige a MP checkout
```

---

## ✅ PASO 1: Crear Workflow en n8n

### 1.1 - Configurar el Trigger HTTP

En n8n:

1. **Crear nuevo workflow**
   - Nombre: `MP Preference Dinámico`
   - Descripción: `Genera preference de MP validando contra Directus`

2. **Primer nodo: HTTP Request (trigger entrada)**
   - Type: `HTTP Request`
   - Nombre: `Recibir Request`
   - Method: `POST`
   - URL: `http://localhost:5678/webhook/create-preference` (n8n auto-genera)
   - Authentication: `None`
   - Input type: `JSON`

**Body esperado:**
```json
{
  "sku": "P24-OMEGA3-001",
  "quantity": 1,
  "email": "cliente@example.com"
}
```

3. **Guardar y activar webhook**
   - Click: "Start listening"
   - Copiar URL del webhook (la usaremos desde el frontend)

---

### 1.2 - Validar Input

Agregar nodo: **Code (JavaScript)**

```javascript
// Validar que input tenga campos requeridos
if (!$input.first().json.sku) {
  throw new Error('SKU es requerido');
}

if (!$input.first().json.quantity || $input.first().json.quantity < 1) {
  throw new Error('Quantity debe ser >= 1');
}

if (!$input.first().json.email) {
  throw new Error('Email es requerido');
}

return {
  sku: $input.first().json.sku,
  quantity: parseInt($input.first().json.quantity),
  email: $input.first().json.email
};
```

**Conexión:** Recibir Request → Validar Input

---

### 1.3 - Fetch Producto desde Directus

Agregar nodo: **HTTP Request**

- Nombre: `Fetch Producto Directus`
- Method: `GET`
- URL: `http://localhost:8055/items/products?filter[sku][_eq]={{ $nodes["Validar Input"].json.sku }}`
- Authentication: `Bearer Token`
  - Token: `{{ env.DIRECTUS_API_TOKEN }}`

**Headers:**
```
Content-Type: application/json
```

**Respuesta esperada:**
```json
{
  "data": [
    {
      "id": "uuid-producto",
      "sku": "P24-OMEGA3-001",
      "name": "OMEGA 3 + ADEK",
      "price": 17990,
      "stock": 45
    }
  ]
}
```

**Conexión:** Validar Input → Fetch Producto Directus

---

### 1.4 - Validar Precio y Stock

Agregar nodo: **Code (JavaScript)**

```javascript
const response = $input.first().json;

// Validar que Directus retornó datos
if (!response.data || response.data.length === 0) {
  throw new Error('Producto no encontrado en Directus');
}

const product = response.data[0];
const clientQuantity = $nodes["Validar Input"].json.quantity;

// Validar stock
if (product.stock < clientQuantity) {
  throw new Error(
    `Stock insuficiente. Disponible: ${product.stock}, solicitado: ${clientQuantity}`
  );
}

// Validar que el precio sea razonable (seguridad contra manipulación cliente)
if (product.price < 0) {
  throw new Error('Precio inválido en BD');
}

// Retornar datos validados
return {
  sku: product.sku,
  name: product.name,
  price: product.price,
  quantity: clientQuantity,
  totalPrice: product.price * clientQuantity,
  email: $nodes["Validar Input"].json.email,
  productId: product.id
};
```

**Conexión:** Fetch Producto Directus → Validar Precio Stock

---

### 1.5 - Crear Preference en Mercado Pago

Agregar nodo: **HTTP Request**

- Nombre: `Crear Preference MP`
- Method: `POST`
- URL: `https://api.mercadopago.com/checkout/preferences`
- Authentication: `Bearer Token`
  - Token: `{{ env.MP_ACCESS_TOKEN }}`

**Body (JSON):**
```json
{
  "items": [
    {
      "id": "{{ $nodes["Validar Precio Stock"].json.sku }}",
      "title": "{{ $nodes["Validar Precio Stock"].json.name }}",
      "description": "Producto Pure24 Nutrition",
      "quantity": {{ $nodes["Validar Precio Stock"].json.quantity }},
      "currency_id": "CLP",
      "unit_price": {{ $nodes["Validar Precio Stock"].json.price }}
    }
  ],
  "payer": {
    "email": "{{ $nodes["Validar Input"].json.email }}"
  },
  "back_urls": {
    "success": "https://pure24nutrition.cl/success",
    "failure": "https://pure24nutrition.cl/failure",
    "pending": "https://pure24nutrition.cl/pending"
  },
  "external_reference": "{{ $nodes["Validar Precio Stock"].json.sku }}_{{ Date.now() }}",
  "auto_return": "approved",
  "notification_url": "https://[tu-n8n-instance]/webhook/mp-webhook"
}
```

**Respuesta esperada:**
```json
{
  "id": "123456789",
  "init_point": "https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=123456789",
  "sandbox_init_point": "https://sandbox.mercadopago.com.ar/checkout/v1/redirect?pref_id=123456789"
}
```

**Conexión:** Validar Precio Stock → Crear Preference MP

---

### 1.6 - Retornar Preference URL

Agregar nodo: **Code (JavaScript)**

```javascript
const mpResponse = $input.first().json;

// Usar sandbox o production según env
const isSandbox = process.env.NODE_ENV === 'sandbox';
const preferenceUrl = isSandbox
  ? mpResponse.sandbox_init_point
  : mpResponse.init_point;

return {
  success: true,
  preferenceUrl: preferenceUrl,
  preferenceId: mpResponse.id,
  validPrice: $nodes["Validar Precio Stock"].json.totalPrice,
  currency: "CLP"
};
```

**Conexión:** Crear Preference MP → Retornar Preference URL

---

## ✅ PASO 2: Configurar Variables de Entorno en n8n

En **n8n Settings → Environment Variables**, agregar:

```
DIRECTUS_API_TOKEN = [tu-token-de-directus]
MP_ACCESS_TOKEN = [tu-access-token-de-mp]
NODE_ENV = sandbox
```

### Cómo obtener el token de Directus:

```bash
# 1. Ir a http://localhost:8055/admin
# 2. Login con tus credenciales
# 3. Ir a Settings → API Tokens
# 4. Crear nuevo token
# 5. Copiar el token (larga cadena alphanumerica)
```

### Verificar que el token de Directus funciona:

```bash
curl -H "Authorization: Bearer [TU_TOKEN]" \
  http://localhost:8055/items/products?limit=1
```

**Debe retornar productos sin error 401**

### Verificar que el token de MP funciona:

```bash
curl https://api.mercadopago.com/v1/payments/search?access_token=[TU_TOKEN]
```

**Debe retornar JSON sin error 401** (puede estar vacío si nunca pagaste)

---

## ✅ PASO 3: Test Manual con curl

Una vez que el workflow esté **activado en n8n**, obtén la URL del webhook:

```bash
# n8n te da la URL real (ejemplo):
WEBHOOK_URL="https://n8n-instance.com/webhook/create-preference"

# En desarrollo (local):
WEBHOOK_URL="http://localhost:5678/webhook/create-preference"
```

### Test 1: Request válido

```bash
curl -X POST $WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -d '{
    "sku": "P24-OMEGA3-001",
    "quantity": 1,
    "email": "test@example.com"
  }' | jq .
```

**Respuesta esperada:**
```json
{
  "success": true,
  "preferenceUrl": "https://sandbox.mercadopago.com.ar/checkout/v1/redirect?pref_id=...",
  "preferenceId": "123456789",
  "validPrice": 17990,
  "currency": "CLP"
}
```

### Test 2: SKU inexistente (debe fallar)

```bash
curl -X POST $WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -d '{
    "sku": "SKU-INEXISTENTE",
    "quantity": 1,
    "email": "test@example.com"
  }' | jq .
```

**Respuesta esperada:**
```json
{
  "cause": [
    {
      "message": "Producto no encontrado en Directus"
    }
  ]
}
```

### Test 3: Stock insuficiente (debe fallar)

```bash
curl -X POST $WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -d '{
    "sku": "P24-OMEGA3-001",
    "quantity": 999,
    "email": "test@example.com"
  }' | jq .
```

**Respuesta esperada:**
```json
{
  "cause": [
    {
      "message": "Stock insuficiente. Disponible: 45, solicitado: 999"
    }
  ]
}
```

---

## ✅ PASO 4: Conectar desde Frontend

### 4.1 - Crear utility function

Crear archivo: **src/lib/mp-preference.ts**

```typescript
export async function createMPPreference(
  sku: string,
  quantity: number,
  email: string
) {
  const webhookUrl = import.meta.env.PUBLIC_N8N_WEBHOOK_URL;

  if (!webhookUrl) {
    throw new Error('N8N_WEBHOOK_URL not configured');
  }

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      sku,
      quantity,
      email
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      error.cause?.[0]?.message || 'Error creando preference'
    );
  }

  return response.json();
}
```

### 4.2 - Usar en componente CompraRapida

Actualizar: **src/components/CompraRapida.tsx** (o .astro)

```typescript
import { createMPPreference } from '@/lib/mp-preference';

export default function CompraRapida({ sku, nombre, precio }) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    try {
      setLoading(true);

      // Obtener email del cliente (ajustar según tu lógica)
      const email = localStorage.getItem('customerEmail') || 'guest@pure24.cl';

      // Crear preference dinámico
      const { preferenceUrl } = await createMPPreference(
        sku,
        1,
        email
      );

      // Redirigir a Mercado Pago
      window.location.href = preferenceUrl;
    } catch (error) {
      console.error('Error:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="btn-primary"
    >
      {loading ? 'Generando link...' : `Comprar: ${nombre} - $${precio}`}
    </button>
  );
}
```

### 4.3 - Usar en componente Checkout

Actualizar: **src/components/CheckoutForm.tsx**

```typescript
import { createMPPreference } from '@/lib/mp-preference';

export default function CheckoutForm() {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Obtener datos del carrito
      const cart = JSON.parse(localStorage.getItem('pure24_cart') || '[]');

      if (cart.length === 0) {
        alert('El carrito está vacío');
        return;
      }

      // Si es un solo producto, crear preference
      if (cart.length === 1) {
        const { sku, quantity } = cart[0];
        const email = (e.target as any).email.value;

        const { preferenceUrl } = await createMPPreference(
          sku,
          quantity,
          email
        );

        window.location.href = preferenceUrl;
      } else {
        // Si son múltiples productos, necesitas crear una preference con múltiples items
        // (implementar en FASE 5.2)
        alert('Múltiples productos aún no soportado');
      }
    } catch (error) {
      console.error('Error:', error);
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Tu formulario */}
    </form>
  );
}
```

---

## ✅ PASO 5: Variables de Entorno Frontend

### 5.1 - Actualizar .env.example

```bash
# Directus
PUBLIC_DIRECTUS_URL=http://localhost:8055
PUBLIC_DIRECTUS_API_KEY=your-api-key

# n8n Webhook
PUBLIC_N8N_WEBHOOK_URL=http://localhost:5678/webhook/create-preference

# Mercado Pago
PUBLIC_MP_PUBLIC_KEY=your-public-key
```

### 5.2 - Crear .env.local (local development)

```bash
# Directus
PUBLIC_DIRECTUS_URL=http://localhost:8055
PUBLIC_DIRECTUS_API_KEY=[tu-token-de-directus]

# n8n Webhook (local)
PUBLIC_N8N_WEBHOOK_URL=http://localhost:5678/webhook/create-preference

# Mercado Pago (sandbox)
PUBLIC_MP_PUBLIC_KEY=[tu-public-key-sandbox]
```

### 5.3 - Para producción (.env.production)

```bash
# Directus
PUBLIC_DIRECTUS_URL=https://tu-directus.com
PUBLIC_DIRECTUS_API_KEY=[tu-token-produccion]

# n8n Webhook (production)
PUBLIC_N8N_WEBHOOK_URL=https://tu-n8n.com/webhook/create-preference

# Mercado Pago (production)
PUBLIC_MP_PUBLIC_KEY=[tu-public-key-produccion]
```

---

## 📋 Checklist de Validación

- [ ] Workflow n8n creado con 6 nodos
  - [ ] Trigger HTTP POST
  - [ ] Validar Input
  - [ ] Fetch Producto Directus
  - [ ] Validar Precio Stock
  - [ ] Crear Preference MP
  - [ ] Retornar URL
- [ ] Variables de entorno en n8n configuradas
  - [ ] DIRECTUS_API_TOKEN
  - [ ] MP_ACCESS_TOKEN
  - [ ] NODE_ENV = sandbox
- [ ] Webhook activado en n8n
- [ ] Test con curl retorna URL válida
- [ ] URL apunta a sandbox de MP
- [ ] Archivo `src/lib/mp-preference.ts` creado
- [ ] Componente `CompraRapida.tsx` actualizado
- [ ] Componente `CheckoutForm.tsx` actualizado
- [ ] `.env.example` actualizado
- [ ] `.env.local` creado con valores reales
- [ ] Test en navegador:
  - [ ] Botón "Comprar" funciona
  - [ ] Se genera URL válida
  - [ ] Redirige a MP checkout
- [ ] Commit a git

---

## 🆘 Troubleshooting

### Error: "401 Unauthorized" en MP API

**Solución:** Verificar que MP_ACCESS_TOKEN es correcto

```bash
curl https://api.mercadopago.com/v1/payments/search?access_token=[TOKEN]
```

Debe retornar JSON sin error 401.

---

### Error: "401 Unauthorized" en Directus

**Solución:** Verificar que DIRECTUS_API_TOKEN es válido

```bash
curl -H "Authorization: Bearer [TOKEN]" \
  http://localhost:8055/items/products?limit=1
```

Debe retornar datos sin error 401.

---

### Error: "Producto no encontrado en Directus"

**Solución:** Verificar que el SKU existe en Directus

```bash
curl -H "Authorization: Bearer [TOKEN]" \
  "http://localhost:8055/items/products?filter[sku][_eq]=P24-OMEGA3-001"
```

---

### Error: "Stock insuficiente"

**Solución:** Aumentar stock del producto en Directus

1. Ir a http://localhost:8055/admin
2. Items → Products
3. Buscar producto
4. Aumentar campo `stock`
5. Guardar

---

### La URL del webhook no funciona desde frontend

**Solución:** En desarrollo, usar URL local

```
.env.local:
PUBLIC_N8N_WEBHOOK_URL=http://localhost:5678/webhook/create-preference
```

**En producción, usar URL del servidor n8n remoto**

```
.env.production:
PUBLIC_N8N_WEBHOOK_URL=https://n8n.tu-dominio.com/webhook/create-preference
```

---

### CORS error: "Access to XMLHttpRequest blocked by CORS policy"

**Solución en n8n:** Habilitar CORS en el nodo HTTP Request

1. En el nodo "Recibir Request"
2. Expandir "Additional Fields"
3. Habilitar "CORS"
4. Guardar

---

## 📊 Flujo Completo Visual

```
USUARIO
  ↓
Click "Comprar" button
  ↓
createMPPreference(sku, quantity, email)
  ↓
POST http://localhost:5678/webhook/create-preference
  ↓
n8n Workflow
  ├─ Validar input ✓
  ├─ Fetch de Directus ✓
  ├─ Validar precio/stock ✓
  ├─ Crear preference en MP ✓
  └─ Retornar URL ✓
  ↓
window.location.href = preferenceUrl
  ↓
https://sandbox.mercadopago.com/checkout/...
  ↓
USUARIO completa pago
  ↓
MP webhook notifica a n8n
  ↓
FASE 5.2: Procesar pago, actualizar stock, enviar email
```

---

## 🚀 Próximo Paso: FASE 5.2

Una vez que FASE 5.1 funciona (puedes generar preferences dinámicos):

1. **Configurar IPN Webhook de MP** - Recibir confirmación de pago
2. **Actualizar stock automáticamente** - Reducir stock en Directus
3. **Crear orden en Directus** - Guardar datos de compra
4. **Enviar email de confirmación** - Usar EmailService de PARTE 4.3
5. **Manejar fallos de pago** - Reintentos y notificaciones

---

## 📝 Notas Importantes

### Seguridad

✅ **El precio se valida en el backend (n8n), NO en el cliente**
- Cliente no puede manipular precio antes de enviar a MP
- Directus es la fuente de verdad

✅ **El stock se valida en el backend**
- Cliente no puede comprar más de lo disponible
- Evita sobreventa

✅ **Los tokens están en ENV vars de n8n**
- No expuestos en el código
- Diferentes entre dev y prod

---

### Performance

- Request a Directus: ~200ms
- Request a MP API: ~500ms
- Total: ~700ms (aceptable)
- Cacheable después en FASE 5.2

---

### Testing

Para testear completo:

1. **Sin Directus corriendo:** n8n fallará en "Fetch Producto"
2. **Sin MP token:** n8n fallará en "Crear Preference"
3. **Sin email:** n8n aceptará cualquier email
4. **Stock = 0:** Fallará con "Stock insuficiente"

---

## 📞 Resumen

| Aspecto | Status |
|---------|--------|
| **n8n Workflow** | Listo (6 nodos) |
| **Directus Integration** | Listo |
| **MP API Integration** | Listo |
| **Frontend Connection** | Listo |
| **ENV Configuration** | Listo |
| **Testing** | ✅ Verificable |
| **Security** | ✅ Implementada |
| **Próximo** | FASE 5.2 - IPN Webhook |

---

**Documento:** FASE_5_1_PREFERENCE_DINAMICO_DIRECTUS.md
**Status:** ✅ Completo y listo para implementar
**Fecha:** 2026-03-08
**Backend:** Directus (Puerto 8055)
**Next:** FASE 5.2 - IPN Webhook + Actualizar Stock + Email
