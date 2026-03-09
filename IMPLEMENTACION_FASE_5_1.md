# 🛠️ Implementación Paso a Paso - FASE 5.1

**Tiempo estimado:** 45 minutos
**Requisitos previos:**
- ✅ Directus corriendo (puerto 8055)
- ✅ n8n instalado y corriendo (puerto 5678)
- ✅ Frontend Astro setup

---

## 📋 Paso 1: Obtener Token de Directus (5 min)

### 1.1 - Acceder a Directus Admin

```bash
# Abre en navegador
http://localhost:8055/admin
```

### 1.2 - Login con credenciales

Si no recuerdas:
```bash
# Ver en tu docker-compose.yml o archivo .env del backend
# Típicamente es:
usuario: admin@directus.io
contraseña: (la que configuraste)
```

### 1.3 - Navegar a API Tokens

1. Click en tu avatar (abajo a la izquierda)
2. Settings
3. API Tokens
4. Click "Create Token"

### 1.4 - Crear Token para n8n

- **Name:** `n8n-workflow`
- **Admin access:** ☑️ ON (para poder leer productos)
- Click "Save"

### 1.5 - Copiar Token

Verás un string largo tipo:
```
abc123def456ghi789jkl012mno345pqr678stu
```

**GUARDA ESTE TOKEN** - lo necesitas en el siguiente paso.

---

## 📋 Paso 2: Configurar Variables en n8n (5 min)

### 2.1 - Acceder a n8n Settings

```bash
# Abre en navegador
http://localhost:5678
```

Click en tu usuario (abajo a la izquierda) → Settings

### 2.2 - Environment Variables

Click en "Environment Variables"

### 2.3 - Agregar Variables

Click "Add Variable"

**Variable 1:**
```
Name: DIRECTUS_API_TOKEN
Value: [pega-el-token-que-copiaste]
```

Click "Save"

**Variable 2:**
```
Name: MP_ACCESS_TOKEN
Value: [tu-token-de-mercado-pago]
```

Click "Save"

**Variable 3:**
```
Name: NODE_ENV
Value: sandbox
```

Click "Save"

---

## 📋 Paso 3: Crear Workflow en n8n (20 min)

### 3.1 - Nuevo Workflow

1. Click "Workflows"
2. Click "+ Create"
3. Click "Blank Workflow"
4. Nombre: `MP Preference Dinámico`

### 3.2 - Agregar Nodo 1: HTTP Request (Trigger)

1. Click el símbolo + en el canvas
2. Buscar "HTTP Request"
3. Click para agregar

**Configurar:**
- **Method:** POST
- **URL:** `http://localhost:5678/webhook/create-preference`
- **Authentication:** None
- **Click:** "Start listening" (abajo a la izquierda del nodo)

**Verás que n8n genera una URL tipo:**
```
https://n8n.example.com/webhook/abc123def456
```

**COPIA ESTA URL** - la necesitarás para el .env del frontend

### 3.3 - Agregar Nodo 2: Code (Validar Input)

1. Click + → Buscar "Code"
2. Agregar

**Código:**
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

**Conectar:** HTTP Request → Code (arrastra línea)

### 3.4 - Agregar Nodo 3: HTTP Request (Fetch Directus)

1. Click + → HTTP Request

**Configurar:**
- **Method:** GET
- **URL:** `http://localhost:8055/items/products?filter[sku][_eq]={{ $nodes["Code"].json.sku }}`
- **Authentication:** Bearer Token
- **Token:** `{{ env.DIRECTUS_API_TOKEN }}`

**Conectar:** Nodo anterior → HTTP Request

### 3.5 - Agregar Nodo 4: Code (Validar Precio Stock)

1. Click + → Code

**Código:**
```javascript
const response = $input.first().json;

if (!response.data || response.data.length === 0) {
  throw new Error('Producto no encontrado en Directus');
}

const product = response.data[0];
const clientQuantity = $nodes["Code"].json.quantity;

if (product.stock < clientQuantity) {
  throw new Error(
    `Stock insuficiente. Disponible: ${product.stock}, solicitado: ${clientQuantity}`
  );
}

if (product.price < 0) {
  throw new Error('Precio inválido en BD');
}

return {
  sku: product.sku,
  name: product.name,
  price: product.price,
  quantity: clientQuantity,
  totalPrice: product.price * clientQuantity,
  email: $nodes["Code"].json.email,
  productId: product.id
};
```

**Conectar:** Nodo anterior → Code

### 3.6 - Agregar Nodo 5: HTTP Request (Crear Preference MP)

1. Click + → HTTP Request

**Configurar:**
- **Method:** POST
- **URL:** `https://api.mercadopago.com/checkout/preferences`
- **Authentication:** Bearer Token
- **Token:** `{{ env.MP_ACCESS_TOKEN }}`

**Body (JSON):**
```json
{
  "items": [
    {
      "id": "{{ $nodes["Code1"].json.sku }}",
      "title": "{{ $nodes["Code1"].json.name }}",
      "description": "Producto Pure24 Nutrition",
      "quantity": {{ $nodes["Code1"].json.quantity }},
      "currency_id": "CLP",
      "unit_price": {{ $nodes["Code1"].json.price }}
    }
  ],
  "payer": {
    "email": "{{ $nodes["Code"].json.email }}"
  },
  "back_urls": {
    "success": "https://pure24nutrition.cl/success",
    "failure": "https://pure24nutrition.cl/failure",
    "pending": "https://pure24nutrition.cl/pending"
  },
  "external_reference": "{{ $nodes["Code1"].json.sku }}_{{ Date.now() }}",
  "auto_return": "approved",
  "notification_url": "https://[tu-n8n-instance]/webhook/mp-webhook"
}
```

**Conectar:** Nodo anterior → HTTP Request

### 3.7 - Agregar Nodo 6: Code (Return)

1. Click + → Code

**Código:**
```javascript
const mpResponse = $input.first().json;

const isSandbox = true; // Cambiar a false en producción
const preferenceUrl = isSandbox
  ? mpResponse.sandbox_init_point
  : mpResponse.init_point;

return {
  success: true,
  preferenceUrl: preferenceUrl,
  preferenceId: mpResponse.id,
  validPrice: $nodes["Code1"].json.totalPrice,
  currency: "CLP"
};
```

**Conectar:** Nodo anterior → Code

### 3.8 - Activar Workflow

Click en el toggle de "Active" arriba a la izquierda

**Estado:** Verde = Activo ✅

---

## 📋 Paso 4: Test con curl (5 min)

Abre terminal y ejecuta:

```bash
# Guardar URL del webhook (desde paso 3.2)
WEBHOOK_URL="http://localhost:5678/webhook/abc123def456"

# Test 1: Request válido
curl -X POST $WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -d '{
    "sku": "P24-OMEGA3-001",
    "quantity": 1,
    "email": "test@example.com"
  }' | jq .
```

**Deberías ver:**
```json
{
  "success": true,
  "preferenceUrl": "https://sandbox.mercadopago.com.ar/checkout/v1/redirect?pref_id=...",
  "preferenceId": "123456789",
  "validPrice": 17990,
  "currency": "CLP"
}
```

Si falla, ver sección Troubleshooting más abajo.

---

## 📋 Paso 5: Configurar Frontend (10 min)

### 5.1 - Crear archivo de utility

**Archivo:** `src/lib/mp-preference.ts`

```typescript
export async function createMPPreference(
  sku: string,
  quantity: number,
  email: string
) {
  const webhookUrl = import.meta.env.PUBLIC_N8N_WEBHOOK_URL;

  if (!webhookUrl) {
    throw new Error('N8N_WEBHOOK_URL not configured in .env');
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

### 5.2 - Crear/Actualizar componente CompraRapida

**Archivo:** `src/components/CompraRapida.tsx`

```typescript
import { useState } from 'react';
import { createMPPreference } from '@/lib/mp-preference';

interface Props {
  sku: string;
  nombre: string;
  precio: number;
}

export default function CompraRapida({ sku, nombre, precio }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    try {
      setLoading(true);
      setError(null);

      // Obtener email (implementar según tu lógica)
      const email = 'cliente@example.com'; // TODO: obtener del usuario

      // Crear preference dinámico
      const { preferenceUrl } = await createMPPreference(
        sku,
        1,
        email
      );

      // Redirigir a Mercado Pago
      window.location.href = preferenceUrl;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(message);
      console.error('Error:', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={loading}
        className="btn-primary"
      >
        {loading ? 'Generando link...' : `Comprar: ${nombre} - $${precio}`}
      </button>
      {error && (
        <p className="text-red-600 text-sm mt-2">{error}</p>
      )}
    </div>
  );
}
```

### 5.3 - Configurar .env

**Archivo:** `frontend/.env.local`

```bash
# Directus
PUBLIC_DIRECTUS_URL=http://localhost:8055
PUBLIC_DIRECTUS_API_KEY=tu-token-de-directus

# n8n Webhook (COPIA LA URL DEL PASO 3.2)
PUBLIC_N8N_WEBHOOK_URL=http://localhost:5678/webhook/abc123def456

# Mercado Pago (sandbox)
PUBLIC_MP_PUBLIC_KEY=tu-public-key-sandbox
```

**IMPORTANTE:** Reemplaza `abc123def456` con la URL real de tu webhook

---

## 📋 Paso 6: Test en Navegador (Opcional pero recomendado)

### 6.1 - Iniciar frontend

```bash
cd frontend
npm run dev
```

### 6.2 - Crear página de test (temporal)

**Archivo:** `src/pages/test-compra.astro`

```astro
---
import CompraRapida from '@/components/CompraRapida';
---

<html>
<head>
  <title>Test Compra Rápida</title>
</head>
<body>
  <h1>Test Compra Rápida</h1>
  <CompraRapida
    sku="P24-OMEGA3-001"
    nombre="OMEGA 3 + ADEK"
    precio={17990}
    client:load
  />
</body>
</html>
```

### 6.3 - Acceder a la página

```
http://localhost:3000/test-compra
```

### 6.4 - Click en botón

Debe:
1. Mostrar "Generando link..."
2. Redirigir a Mercado Pago sandbox

---

## 🆘 Troubleshooting

### Error: "401 Unauthorized" en Directus

```bash
# Verificar token
curl -H "Authorization: Bearer $DIRECTUS_API_TOKEN" \
  http://localhost:8055/items/products?limit=1
```

Si retorna 401:
- Token expirado → Crear nuevo en http://localhost:8055/admin
- Token inválido → Copiar de nuevo

### Error: "Producto no encontrado en Directus"

```bash
# Verificar que el SKU existe
curl -H "Authorization: Bearer $DIRECTUS_API_TOKEN" \
  "http://localhost:8055/items/products?filter[sku][_eq]=P24-OMEGA3-001"
```

Si retorna `{"data": []}`:
- El SKU no existe → Crear producto en Directus admin
- Verificar que el SKU es exacto (mayúsculas, espacios, etc.)

### Error: "401 Unauthorized" en MP API

```bash
# Verificar token de MP
curl https://api.mercadopago.com/v1/payments/search?access_token=$MP_ACCESS_TOKEN
```

Si retorna 401:
- Token inválido → Verificar en https://www.mercadopago.com.ar/developers/panel/credentials
- Token expirado → Regenerar

### Error: "Stock insuficiente"

Aumentar stock en Directus:
1. http://localhost:8055/admin
2. Items → Products
3. Buscar producto
4. Aumentar `stock`
5. Guardar

### Error: "N8N_WEBHOOK_URL not configured"

Verificar `.env.local` del frontend:
```bash
PUBLIC_N8N_WEBHOOK_URL=http://localhost:5678/webhook/abc123def456
```

Debe estar presente y ser la URL CORRECTA del webhook.

### CORS Error en navegador

En n8n, en el nodo "Recibir Request":
1. Click en el nodo
2. Additional Fields
3. Enable "CORS"
4. Save

---

## ✅ Checklist Final

- [ ] Token de Directus creado y guardado
- [ ] Variables en n8n configuradas (DIRECTUS_API_TOKEN, MP_ACCESS_TOKEN)
- [ ] Workflow creado con 6 nodos
- [ ] Workflow activado (toggle en verde)
- [ ] Test con curl funciona
- [ ] Archivo `src/lib/mp-preference.ts` creado
- [ ] Componente `CompraRapida.tsx` creado/actualizado
- [ ] `.env.local` configurado con URLs correctas
- [ ] Frontend build sin errores: `npm run build`
- [ ] Test en navegador funciona (opcional)
- [ ] Commit a git

```bash
git add .
git commit -m "FASE 5.1: Preference dinámico con Directus y n8n"
git push
```

---

## 📊 Resumen

| Tarea | Tiempo | Status |
|-------|--------|--------|
| Token Directus | 5 min | ✅ |
| Variables n8n | 5 min | ✅ |
| Workflow n8n | 20 min | ✅ |
| Test curl | 5 min | ✅ |
| Frontend | 10 min | ✅ |
| **TOTAL** | **45 min** | **✅** |

---

**Siguiente:** FASE 5.2 - IPN Webhook + Actualizar Stock + Email

Si todo funciona, procede a FASE 5.2 para recibir confirmación de pagos.
