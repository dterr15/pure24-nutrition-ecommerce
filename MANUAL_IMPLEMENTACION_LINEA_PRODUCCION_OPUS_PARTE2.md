# MANUAL DE IMPLEMENTACIÓN - PARTE 2
## FASE 4: Headless E-commerce → FASE 7: Deploy y Monitoreo

---

# FASE 4: HEADLESS E-COMMERCE

## 4.1 - Configurar Payload CMS

### Objetivo
Crear backend CMS que sea fuente de verdad para productos.

### Pasos

#### Paso 4.1.1: Crear Proyecto Payload
```bash
cd backend
npx create-payload-app . --template blank --typescript

# Responder a prompts
```

#### Paso 4.1.2: Crear Colección Products
```typescript
// backend/src/collections/Products.ts
import { CollectionConfig } from 'payload/types'

const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'sku', 'price', 'stock']
  },
  access: {
    read: async () => true,
    create: async ({ req }) => req.user?.role === 'admin',
    update: async ({ req }) => req.user?.role === 'admin',
    delete: async ({ req }) => req.user?.role === 'admin'
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Nombre Producto'
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: { position: 'sidebar' }
    },
    {
      name: 'sku',
      type: 'text',
      required: true,
      unique: true,
      label: 'SKU (Código Único)'
    },
    {
      name: 'gtin13',
      type: 'text',
      label: 'Código de Barras (GTIN-13)',
      validate: (val) => {
        if (!val) return true
        if (!/^\d{13}$/.test(val)) return 'GTIN-13 debe ser 13 dígitos'
        return true
      }
    },
    {
      name: 'price',
      type: 'number',
      required: true,
      label: 'Precio (CLP)'
    },
    {
      name: 'stock',
      type: 'number',
      required: true,
      label: 'Stock (unidades)'
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
      label: 'Descripción'
    },
    {
      name: 'descriptionLong',
      type: 'richText',
      label: 'Descripción Larga'
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: true
    },
    {
      name: 'images',
      type: 'array',
      label: 'Galería de Imágenes',
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media'
        }
      ]
    },
    {
      name: 'specifications',
      type: 'array',
      label: 'Especificaciones Técnicas',
      fields: [
        { name: 'key', type: 'text', label: 'Parámetro' },
        { name: 'value', type: 'text', label: 'Valor' }
      ]
    },
    {
      name: 'category',
      type: 'select',
      options: [
        { label: 'Recuperación', value: 'recovery' },
        { label: 'Hidratación', value: 'hydration' },
        { label: 'Inmunidad', value: 'immunity' }
      ]
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: { date: { pickerAppearance: 'dayOnly' } }
    }
  ]
}

export default Products
```

#### Paso 4.1.3: Crear Colección Orders
```typescript
// backend/src/collections/Orders.ts
import { CollectionConfig } from 'payload/types'

const Orders: CollectionConfig = {
  slug: 'orders',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['id', 'mpTransactionId', 'status', 'createdAt']
  },
  access: {
    read: async () => true,
    create: async () => true, // Webhook puede crear
    update: async ({ req }) => req.user?.role === 'admin',
    delete: async ({ req }) => req.user?.role === 'admin'
  },
  fields: [
    {
      name: 'mpTransactionId',
      type: 'text',
      required: true,
      unique: true,
      label: 'ID Transacción Mercado Pago'
    },
    {
      name: 'customerEmail',
      type: 'email',
      required: true
    },
    {
      name: 'customerName',
      type: 'text',
      required: true
    },
    {
      name: 'products',
      type: 'array',
      fields: [
        {
          name: 'sku',
          type: 'text',
          required: true
        },
        {
          name: 'quantity',
          type: 'number',
          required: true
        },
        {
          name: 'unitPrice',
          type: 'number',
          required: true
        }
      ]
    },
    {
      name: 'totalAmount',
      type: 'number',
      required: true,
      label: 'Monto Total (CLP)'
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      options: [
        { label: 'Pendiente', value: 'pending' },
        { label: 'Aprobado', value: 'approved' },
        { label: 'Rechazado', value: 'rejected' },
        { label: 'Cancelado', value: 'cancelled' }
      ]
    },
    {
      name: 'shippingAddress',
      type: 'textarea',
      label: 'Dirección de Envío'
    },
    {
      name: 'trackingNumber',
      type: 'text',
      label: 'Número de Seguimiento'
    }
  ]
}

export default Orders
```

#### Paso 4.1.4: Configurar payload.config.ts
```typescript
// backend/src/payload.config.ts
import { buildConfig } from 'payload/config'
import path from 'path'
import Products from './collections/Products'
import Orders from './collections/Orders'
import Media from './collections/Media'
import Users from './collections/Users'

export default buildConfig({
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: ' - Pure 24 Admin'
    }
  },
  collections: [Users, Products, Orders, Media],
  typescript: {
    outputFile: path.resolve(__dirname, 'payload-types.ts')
  },
  db: {
    mongoURL: process.env.DATABASE_URI,
    // O para PostgreSQL:
    // postgresURL: process.env.DATABASE_URI
  },
  secret: process.env.PAYLOAD_SECRET || 'YOUR_SECRET_KEY_CHANGE_THIS'
})
```

#### Paso 4.1.5: Ejecutar Docker Compose
```bash
docker-compose up

# Logs deben mostrar:
# postgres_1  | database system is ready to accept connections
# payload_1   | listening on 0.0.0.0:3000
```

#### Paso 4.1.6: Seedear Productos
```typescript
// backend/src/seed.ts
import payload from 'payload'

const seed = async () => {
  await payload.connect()

  const products = [
    {
      name: 'OMEGA 3 + ADEK 90 CAPS',
      slug: 'omega3-adek',
      sku: 'P24-OMEGA3-001',
      gtin13: '5901515018197',
      price: 17990,
      stock: 45,
      description: 'Suplemento de recuperación con omega-3 de agua fría...',
      category: 'recovery'
    },
    // ... 29+ productos más
  ]

  for (const product of products) {
    await payload.create({
      collection: 'products',
      data: product
    })
  }

  console.log('✅ Seed completado')
  process.exit(0)
}

seed()
```

```bash
npm run seed
```

#### Paso 4.1.7: Validar API
```bash
# Verificar que API retorna productos:
curl http://localhost:3000/api/products?limit=5

# Debe retornar JSON con productos
```

### Checklist 4.1
- [ ] Payload CMS creado
- [ ] Colección Products creada
- [ ] Colección Orders creada
- [ ] payload.config.ts configurado
- [ ] Docker compose ejecutándose
- [ ] Admin panel accesible (localhost:3000/admin)
- [ ] 30+ productos seededados
- [ ] GET /api/products funcional

**Tiempo:** 90 min
**Status:** ⏳ Pendiente

---

## 4.2 - Conectar Astro a Payload CMS

### Objetivo
Fetch de datos en build time para SSG.

### Pasos

#### Paso 4.2.1: Crear Payload Client
```typescript
// src/lib/payload-client.ts
const API_URL = process.env.VITE_CMS_URL || 'http://localhost:3000'

interface Product {
  id: string
  sku: string
  slug: string
  name: string
  description: string
  price: number
  stock: number
  image: { url: string }
}

export async function getProducts(): Promise<{ docs: Product[] }> {
  const res = await fetch(`${API_URL}/api/products?limit=999`, {
    headers: { 'Content-Type': 'application/json' }
  })

  if (!res.ok) {
    throw new Error(`Failed to fetch products: ${res.status}`)
  }

  return res.json()
}

export async function getProductBySlug(slug: string): Promise<Product> {
  const res = await fetch(
    `${API_URL}/api/products?where[slug][equals]=${slug}`,
    { headers: { 'Content-Type': 'application/json' } }
  )

  if (!res.ok) {
    throw new Error(`Product not found: ${slug}`)
  }

  const { docs } = await res.json()
  return docs[0]
}

export async function getProductBySku(sku: string): Promise<Product> {
  const res = await fetch(
    `${API_URL}/api/products?where[sku][equals]=${sku}`,
    { headers: { 'Content-Type': 'application/json' } }
  )

  if (!res.ok) {
    throw new Error(`Product not found: ${sku}`)
  }

  const { docs } = await res.json()
  return docs[0]
}
```

#### Paso 4.2.2: Crear Página Dinámica
```astro
<!-- src/pages/productos/[slug].astro -->
---
import { getProducts, getProductBySlug } from '@/lib/payload-client'
import ProductLayout from '@/layouts/ProductLayout.astro'
import ProductSchema from '@/components/ProductSchema.astro'

export async function getStaticPaths() {
  const { docs } = await getProducts()
  return docs.map(product => ({
    params: { slug: product.slug },
    props: { product }
  }))
}

const { product } = Astro.props
const imageUrl = typeof product.image === 'object'
  ? product.image.url
  : product.image
---

<ProductLayout title={product.name} description={product.description}>
  <ProductSchema
    sku={product.sku}
    name={product.name}
    description={product.description}
    price={product.price}
    currency="CLP"
    image={imageUrl}
    gtin13={product.gtin13 || ''}
    inStock={product.stock > 0}
  />

  <section id="hero">
    <h1>{product.name}</h1>
    <img
      src={imageUrl}
      alt="Imagen: {product.name}"
      loading="lazy"
      width="1200"
      height="800"
    />
    <p class="price">${product.price.toLocaleString('es-CL')} CLP</p>
  </section>

  <section id="description">
    <p>{product.description}</p>
  </section>

  <section id="buy">
    <button
      class="btn-primary"
      onclick={`window.location.href='/checkout?sku=${product.sku}'`}
    >
      Comprar Ahora
    </button>
  </section>
</ProductLayout>
```

#### Paso 4.2.3: Crear Página de Catálogo
```astro
<!-- src/pages/productos/index.astro -->
---
import { getProducts } from '@/lib/payload-client'

const { docs } = await getProducts()
---

<html lang="es">
  <head>
    <title>Catálogo de Productos - Pure 24 Nutrition</title>
  </head>
  <body>
    <h1>Nuestros Productos</h1>

    <div class="grid">
      {docs.map(product => {
        const imageUrl = typeof product.image === 'object'
          ? product.image.url
          : product.image

        return (
          <div class="product-card">
            <a href={`/productos/${product.slug}`}>
              <img
                src={imageUrl}
                alt={product.name}
                loading="lazy"
              />
              <h2>{product.name}</h2>
              <p class="price">
                ${product.price.toLocaleString('es-CL')} CLP
              </p>
              <span class="stock">
                {product.stock > 0 ? '✓ En Stock' : '✗ Agotado'}
              </span>
            </a>
          </div>
        )
      })}
    </div>
  </body>
</html>
```

#### Paso 4.2.4: Crear Variables de Entorno
```env
# .env
VITE_CMS_URL=http://localhost:3000
```

#### Paso 4.2.5: Build y Verificar
```bash
npm run build

# Debe haber generado:
ls dist/productos/
# omega3-adek.html
# magnesio.html
# ... más archivos

# Verificar contenido:
cat dist/productos/omega3-adek.html | grep "<h1>"
# <h1>OMEGA 3 + ADEK 90 CAPS</h1>
```

### Checklist 4.2
- [ ] Payload client creado
- [ ] getProducts() funcional
- [ ] getProductBySlug() funcional
- [ ] Página [slug].astro creada
- [ ] Página catálogo creada
- [ ] .env configurado
- [ ] Build genera HTML estático para cada producto
- [ ] Contenido correcto en HTML generado

**Tiempo:** 60 min
**Status:** ⏳ Pendiente

---

## 4.3 - Implementar Botón Comprar

### Objetivo
Link directo a Mercado Pago sin carrito (compra rápida).

### Pasos

#### Paso 4.3.1: Crear Componente QuickBuy
```astro
<!-- src/components/QuickBuyButton.astro -->
---
interface Props {
  sku: string
  name: string
  price: number
}

const { sku, name, price } = Astro.props
const checkoutUrl = `/checkout?sku=${sku}`
---

<button
  class="btn-primary btn-buy"
  onclick={`window.location.href='${checkoutUrl}'`}
>
  Comprar: {name} - ${price.toLocaleString('es-CL')} CLP
</button>

<style>
  .btn-buy {
    cursor: pointer;
    padding: 16px 24px;
    font-size: 16px;
    font-weight: 600;
    border: none;
    border-radius: 8px;
    background: var(--color-primary);
    color: white;
    transition: all 0.3s ease;
  }

  .btn-buy:hover {
    background: var(--color-primary-dark);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
  }

  .btn-buy:active {
    transform: translateY(0);
  }
</style>
```

#### Paso 4.3.2: Usar en Página de Producto
```astro
<!-- En src/pages/productos/[slug].astro -->
---
import QuickBuyButton from '@/components/QuickBuyButton.astro'

const { product } = Astro.props
---

<QuickBuyButton
  sku={product.sku}
  name={product.name}
  price={product.price}
/>
```

#### Paso 4.3.3: Test Manual
```bash
# 1. Ir a localhost:3000/productos/omega3-adek (en dev)
# 2. Click en botón "Comprar"
# 3. Debe navegar a: localhost:3000/checkout?sku=P24-OMEGA3-001
```

### Checklist 4.3
- [ ] QuickBuyButton.astro creado
- [ ] Integrado en página producto
- [ ] Click funciona (navega a checkout)
- [ ] URL incluye SKU como parámetro
- [ ] Estilos responsive

**Tiempo:** 30 min
**Status:** ⏳ Pendiente

---

## 📍 GATE 4: Headless E-commerce Conectado

### Validaciones Requeridas
- [ ] Payload CMS corriendo en Docker
- [ ] 30+ productos en BD
- [ ] Astro fetching productos en build time
- [ ] Páginas estáticas generadas para cada producto
- [ ] Botón comprar funcional (navega a checkout)
- [ ] Catálogo página funcional
- [ ] getProducts() y getProductBySlug() sin errores

**Si TODOS los checks ✓ → Continuar a FASE 5**

**Tiempo FASE 4 Total:** ~3 horas

---

# FASE 5: INTEGRACIÓN MERCADO PAGO

## 5.1 - Crear Preference Dinámico en n8n

### Objetivo
Generar link de pago en tiempo real desde n8n.

### Pasos

#### Paso 5.1.1: Crear Workflow en n8n
```
1. Ir a n8n: http://localhost:5678
2. New Workflow
3. Nombre: "Create Preference - Mercado Pago"
```

#### Paso 5.1.2: Nodo 1 - HTTP Trigger
```
Trigger: HTTP REQUEST
├─ Method: POST
├─ Path: /webhook/create-preference
├─ Execution: Immediately
└─ Response Code: 200
```

#### Paso 5.1.3: Nodo 2 - Fetch Product
```
Node: HTTP Request
├─ Method: GET
├─ URL: http://localhost:3000/api/products?where[sku][equals]={{$json.body.sku}}
├─ Headers:
│   ├─ Content-Type: application/json
└─ Output: JSON
```

#### Paso 5.1.4: Nodo 3 - Validate Price
```
Node: If (Condicional)
├─ Condition: Input JSON → sku equals $json.body.sku
├─ True: Continuar
└─ False: Error (price mismatch)
```

#### Paso 5.1.5: Nodo 4 - Create Preference
```
Node: HTTP Request
├─ Method: POST
├─ URL: https://api.mercadopago.com/checkout/preferences
├─ Headers:
│   ├─ Content-Type: application/json
│   └─ Authorization: Bearer {{env.MP_ACCESS_TOKEN}}
├─ Body:
{
  "items": [
    {
      "id": "{{$json.body.sku}}",
      "title": "{{$json.data[0].name}}",
      "quantity": {{$json.body.quantity || 1}},
      "unit_price": {{$json.data[0].price}}
    }
  ],
  "back_urls": {
    "success": "https://pure24nutrition.cl/checkout-success",
    "failure": "https://pure24nutrition.cl/checkout-failure",
    "pending": "https://pure24nutrition.cl/checkout-pending"
  },
  "notification_url": "https://[tu-vps]/webhook/mercadopago-ipn",
  "external_reference": "{{$json.body.sku}}"
}
└─ Output: JSON with preference_id
```

#### Paso 5.1.6: Nodo 5 - Return URL
```
Node: Respond to Webhook
├─ Response Body: {
  "preferenceUrl": "https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id={{$json.body.id}}",
  "validPrice": true
}
└─ Status Code: 200
```

#### Paso 5.1.7: Test con curl
```bash
curl -X POST http://localhost:5678/webhook/create-preference \
  -H "Content-Type: application/json" \
  -d '{"sku": "P24-OMEGA3-001", "quantity": 1}'

# Debe retornar:
# {"preferenceUrl": "https://www.mercadopago.com.ar/checkout/...", "validPrice": true}
```

### Checklist 5.1
- [ ] Workflow creado en n8n
- [ ] 5 nodos conectados
- [ ] Mercado Pago credentials configuradas
- [ ] Test con curl retorna preference URL
- [ ] Workflow guardado

**Tiempo:** 45 min
**Status:** ⏳ Pendiente

---

## 5.2 - Configurar IPN Webhook

### Objetivo
Escuchar confirmación de pago desde Mercado Pago.

### Pasos

#### Paso 5.2.1: Crear Workflow IPN en n8n
```
Nombre: "IPN Webhook - Mercado Pago"
```

#### Paso 5.2.2: Nodo 1 - HTTP Trigger (IPN)
```
Trigger: HTTP REQUEST
├─ Method: POST
├─ Path: /webhook/mercadopago-ipn
├─ Response Code: 200
```

#### Paso 5.2.3: Nodo 2 - Validate HMAC
```
Node: Code
├─ Language: JavaScript
├─ Code:
const crypto = require('crypto');
const secret = process.env.MP_WEBHOOK_SECRET;
const signature = $input.first().json.signature;
const timestamp = $input.first().json.timestamp;
const body = JSON.stringify($input.first().json);

const hmac = crypto
  .createHmac('sha256', secret)
  .update(timestamp + body)
  .digest('hex');

return {
  isValid: hmac === signature,
  status: $input.first().json.status
};
```

#### Paso 5.2.4: Nodo 3 - Get Payment Details
```
Node: HTTP Request
├─ Method: GET
├─ URL: https://api.mercadopago.com/v1/payments/{{$json.id}}
├─ Headers:
│   └─ Authorization: Bearer {{env.MP_ACCESS_TOKEN}}
└─ Output: Payment details with status
```

#### Paso 5.2.5: Nodo 4 - Check if Approved
```
Node: If (Condicional)
├─ Condition: .status === 'approved'
├─ True: Update stock + send email
└─ False: Log only
```

#### Paso 5.2.6: Nodo 5 - Update Stock
```
Node: HTTP Request
├─ Method: PATCH
├─ URL: http://localhost:3000/api/products/{{$json.external_reference}}
├─ Headers:
│   ├─ Content-Type: application/json
│   └─ Authorization: Bearer {{env.PAYLOAD_API_KEY}}
├─ Body:
{
  "stock": {{$json.current_stock - $json.quantity}}
}
└─ Output: Updated product
```

#### Paso 5.2.7: Test IPN
```bash
# Realizar pago simulado en MP sandbox
# IPN debe dispararse automáticamente
# Verificar logs en n8n: Executions → Ver detalles
```

### Checklist 5.2
- [ ] Workflow IPN creado
- [ ] HMAC validation implementado
- [ ] Get payment details funcional
- [ ] Conditional logic por status
- [ ] Update stock funcional
- [ ] Test pago simulado ejecutado
- [ ] Logs muestran ejecución correcta

**Tiempo:** 60 min
**Status:** ⏳ Pendiente

---

## 5.3 - Implementar HMAC Validation

### Objetivo
Verificar que IPN viene realmente de Mercado Pago.

### Pasos

#### Paso 5.3.1: Obtener Webhook Secret
```
1. Ir a: https://www.mercadopago.com.ar/ipn
2. Copiar "Webhook Secret"
3. Guardar en .env: MP_WEBHOOK_SECRET=...
```

#### Paso 5.3.2: Validar en Workflow
```
Ya implementado en Paso 5.2.3:

if (!isValid) {
  return {
    error: 'Invalid HMAC signature',
    status: 403
  }
}
```

#### Paso 5.3.3: Test HMAC
```bash
# n8n mostrará si HMAC es válido en logs
# ✓ isValid: true  →  Procesar pago
# ✗ isValid: false → Rechazar (403)
```

### Checklist 5.3
- [ ] MP Webhook Secret obtenido
- [ ] Secret guardado en .env
- [ ] HMAC validation en workflow
- [ ] Test con pago simulado
- [ ] Validación passing

**Tiempo:** 30 min
**Status:** ⏳ Pendiente

---

## 5.4 - Test End-to-End de Compra

### Objetivo
Verificar flujo completo: Click → Pago → Stock Update → Email.

### Pasos

#### Paso 5.4.1: Test Flujo Completo
```
PASO 1: Ir a https://localhost:3000/productos/omega3-adek
PASO 2: Click botón "Comprar"
PASO 3: Debe ir a /checkout?sku=P24-OMEGA3-001
PASO 4: Click en botón de Mercado Pago
PASO 5: Redirige a MP sandbox
PASO 6: Realizar pago con tarjeta de prueba:
  - Número: 4111 1111 1111 1111
  - Mes/Año: 12/25
  - CVV: 123
  - Email: cualquiera
PASO 7: Confirmar pago
PASO 8: Retorna a sitio (si configured back_url)
```

#### Paso 5.4.2: Verificar Actualizaciones
```bash
# Inmediatamente después del pago:

# 1. Verificar webhook ejecutado:
curl http://localhost:5678/executions
# Debe mostrar ejecución de IPN

# 2. Verificar stock actualizado en Payload:
curl http://localhost:3000/api/products?where[sku][equals]=P24-OMEGA3-001
# stock debe estar reducido en 1

# 3. Verificar orden registrada:
curl http://localhost:3000/api/orders
# Debe haber nueva orden con status 'approved'
```

#### Paso 5.4.3: Test Email (si configurado)
```
Verificar en inbox si email de confirmación fue recibido.
Debe contener:
- Número de orden (MP transaction ID)
- Producto comprado
- Monto pagado
- Fecha de envío estimada
```

#### Paso 5.4.4: Verificar GA4 (si configurado)
```
Verificar en GA4 Dashboard:
- Vía: Monetization → Transactions
- Evento 'purchase' debe aparecer
- Conversion rate debe actualizarse
```

### Checklist 5.4
- [ ] Página producto carga
- [ ] Botón comprar navega a checkout
- [ ] MP sandbox checkout abre
- [ ] Pago simulado procesa
- [ ] Stock actualiza en Payload
- [ ] Orden aparece en Payload Orders
- [ ] Email confirmación recibido (si aplica)
- [ ] GA4 evento 'purchase' registrado (si aplica)

**Tiempo:** 45 min
**Status:** ⏳ Pendiente

---

## 📍 GATE 5: Mercado Pago Integrado

### Validaciones Requeridas
- [ ] Preference dinámico se crea sin errores
- [ ] Link de MP abre correctamente
- [ ] Pago en sandbox se procesa
- [ ] IPN webhook recibe notificación
- [ ] Stock se actualiza automáticamente
- [ ] Email de confirmación se envía (si aplica)
- [ ] Orden registrada en Payload CMS
- [ ] GA4 evento enviado (si aplica)

**Si TODOS los checks ✓ → Continuar a FASE 6**

**Tiempo FASE 5 Total:** ~2.5 horas

---

# FASE 6: ORQUESTACIÓN n8n (AUTOMATIZACIÓN)

## 6.1 - Actualizar Stock Post-Compra

Ya implementado en FASE 5.2, Paso 5.2.6.

**Checklist:**
- [ ] Stock reduction en PATCH /api/products/{sku}
- [ ] Cantidad correcta restada
- [ ] Test ejecutado exitosamente

---

## 6.2 - Enviar Evento GA4 Server-Side

### Objetivo
Tracking automático de conversión (no depende de JavaScript del cliente).

### Pasos

#### Paso 6.2.1: Crear Nodo GA4 en Workflow IPN
```
Node: HTTP Request (después de Update Stock)
├─ Method: POST
├─ URL: https://www.google-analytics.com/mp/collect
├─ Headers:
│   └─ Content-Type: application/json
├─ Query Params:
│   ├─ measurement_id={{env.GA4_MEASUREMENT_ID}}
│   └─ api_secret={{env.GA4_API_SECRET}}
├─ Body:
{
  "client_id": "{{$json.customer_email}}",
  "events": [
    {
      "name": "purchase",
      "params": {
        "value": {{$json.total_amount}},
        "currency": "CLP",
        "transaction_id": "{{$json.id}}",
        "items": [
          {
            "item_id": "{{$json.sku}}",
            "item_name": "{{$json.product_name}}",
            "quantity": {{$json.quantity}},
            "price": {{$json.unit_price}}
          }
        ]
      }
    }
  ]
}
└─ Output: GA4 response (usually empty 204)
```

#### Paso 6.2.2: Obtener GA4 Credentials
```
1. Ir a: https://analytics.google.com
2. Admin → Data Streams → Web → Measurement ID
3. Admin → Property Settings → API Secret
4. Guardar en .env:
   GA4_MEASUREMENT_ID=G-XXXXXXX
   GA4_API_SECRET=[secret]
```

#### Paso 6.2.3: Test GA4
```bash
# Después de pago simulado, esperar 24h
# Ir a GA4 Dashboard:
# - Monetization → Transactions
# - Debe mostrar evento 'purchase'
```

**Checklist 6.2:**
- [ ] Nodo HTTP POST a GA4
- [ ] measurement_id correcto
- [ ] api_secret correcto
- [ ] Body estructura correcta
- [ ] Test evento recibido en GA4 (24h después)

---

## 6.3 - Enviar Email de Confirmación

### Objetivo
Notificación al cliente después de pago.

### Pasos

#### Paso 6.3.1: Crear Nodo Email en Workflow IPN
```
Node: Sendgrid / Resend / Mailgun (según servicio)
├─ Service: [Email service de tu elección]
├─ To: {{$json.customer_email}}
├─ From: noreply@pure24nutrition.cl
├─ Subject: Tu compra en Pure 24 Nutrition - Confirmada
├─ Body (HTML):
<h2>¡Compra Confirmada!</h2>
<p>Hola {{$json.customer_name}},</p>
<p>Tu pedido ha sido confirmado:</p>

<h3>Detalles del Pedido</h3>
<ul>
  <li>Número de Orden: {{$json.id}}</li>
  <li>Producto: {{$json.product_name}}</li>
  <li>Cantidad: {{$json.quantity}}</li>
  <li>Monto: ${{$json.total_amount}}</li>
</ul>

<h3>Envío</h3>
<p>Tu pedido será despachado en máximo 48 horas.</p>
<p>Te notificaremos cuando esté en camino.</p>

<p>¡Gracias por confiar en Pure 24 Nutrition!</p>
└─ Response: Success (200) or failure (4xx)
```

#### Paso 6.3.2: Configurar Servicio Email
```
Opciones:
1. Sendgrid (gratis hasta 100/día)
2. Resend (gratis hasta 100/día)
3. Mailgun (gratis hasta 1000/mes)
4. Brevo (ex Sendinblue)

Nuestro recomendado: Resend (simple, confiable, R Argentina-friendly)

1. Ir a: https://resend.com
2. Sign up → crear API key
3. En n8n: Credentials → Resend → API key
```

**Checklist 6.3:**
- [ ] Servicio email elegido
- [ ] API key obtenida y configurada en n8n
- [ ] Nodo Email agregado a workflow
- [ ] Template configurado
- [ ] Test envío ejecutado
- [ ] Email recibido en inbox

---

## 6.4 - Automatizar Deploy en Cambios de Stock

### Objetivo
Sitio siempre reflejado con datos actualizados.

### Pasos

#### Paso 6.4.1: Obtener Deploy Hook URL de Cloudflare
```
1. Ir a: https://dash.cloudflare.com
2. Pages → Seleccionar project pure24nutrition
3. Settings → Build Configuration → Deploy Hook
4. Copiar URL (se ve como: https://api.cloudflare.com/...)
```

#### Paso 6.4.2: Crear Nodo Deploy en Workflow
```
Node: HTTP Request (al final de workflow IPN)
├─ Method: POST
├─ URL: {{env.CF_DEPLOY_HOOK_URL}}
├─ Headers:
│   └─ Content-Type: application/json
├─ Body: {} (vacío, o con metadata)
└─ Response: 200 (deployment initiated)
```

#### Paso 6.4.3: Test Deploy
```bash
# Cambiar stock en Payload (manual)
# n8n debe:
# 1. Recibir webhook (si está configurado)
# 2. Ejecutar workflow
# 3. Llamar Deploy Hook
# 4. Cloudflare inicia rebuild

# Verificar en Cloudflare Dashboard:
# Pages → Deployments → debe haber nuevo deployment iniciado

# Esperar <5 min para que sitio refleje cambios
curl https://pure24nutrition.cl
# HTML debe mostrar stock actualizado
```

**Checklist 6.4:**
- [ ] Deploy Hook URL obtenida
- [ ] URL guardada en .env como CF_DEPLOY_HOOK_URL
- [ ] Nodo HTTP POST agregado a workflow
- [ ] Test manual ejecutado
- [ ] Deploy se inicia en Cloudflare
- [ ] Sitio refleja cambios en <5 min

---

## 📍 GATE 6: Automatización Completa

### Validaciones Requeridas
- [ ] Stock se reduce automáticamente post-compra
- [ ] Evento GA4 enviado server-side
- [ ] Email de confirmación recibido
- [ ] Deploy automático se dispara
- [ ] Sitio refleja datos actualizados en <5 min
- [ ] Workflow ejecutado exitosamente (ver executions en n8n)

**Si TODOS los checks ✓ → Continuar a FASE 7**

**Tiempo FASE 6 Total:** ~1.5 horas

---

# FASE 7: DEPLOY Y MONITOREO

## 7.1 - Deploy Frontend en Cloudflare Pages

### Objetivo
Sitio live en el Edge con TTFB <50ms.

### Pasos

#### Paso 7.1.1: Conectar GitHub a Cloudflare Pages
```
1. Ir a: https://dash.cloudflare.com
2. Pages → Create project → Connect GitHub
3. Seleccionar repositorio: pure24-nutrition-ecommerce
4. Build settings:
   ├─ Build command: npm run build
   ├─ Build output: dist/
   └─ Root directory: (dejar vacío)
5. Environment variables:
   ├─ VITE_CMS_URL=https://[api.tudominio.com] (producción)
   └─ VITE_PUBLIC_GA_ID=G-XXXXXXX
6. Click "Save & Deploy"
```

#### Paso 7.1.2: Esperar Deploy
```bash
# Cloudflare despliega automáticamente
# Timeline:
# - Clona repo
# - Ejecuta npm run build
# - Genera dist/ con HTML estático
# - Sube a edge locations globales
# - Típicamente 2-5 minutos

# Verificar en Cloudflare Dashboard:
# Pages → pure24nutrition → Deployments
# Debe mostrar "Success" en verde
```

#### Paso 7.1.3: Verificar TTFB
```bash
curl -I https://pure24nutrition.cl
# Buscar headers:
# CF-Cache-Status: HIT (desde cache)
# Server-Timing: (TTFB info)
# TTFB debe ser <50ms

# Tool alternativa: https://www.webpagetest.org
```

### Checklist 7.1
- [ ] GitHub conectado a Cloudflare Pages
- [ ] Build command y output configurados
- [ ] Environment variables set
- [ ] Deploy completado exitosamente
- [ ] Sitio accesible en https://pure24nutrition.cl
- [ ] TTFB <50ms verificado
- [ ] Assets servidos desde Cloudflare edge

---

## 7.2 - Configurar DNS en Cloudflare

### Objetivo
Dominio productivo con SSL automático.

### Pasos

#### Paso 7.2.1: Transferir DNS a Cloudflare (si no lo está)
```
1. Si dominio no está en Cloudflare:
   - Ir a: https://dash.cloudflare.com
   - Add site → pure24nutrition.cl
   - Cloudflare te da 2 nameservers
   - Cambiar nameservers en registrador (NIC, GoDaddy, etc)
   - Esperar propagación (15-30 min)

2. Si ya está en Cloudflare, continuar
```

#### Paso 7.2.2: Configurar CNAME para Pages
```
En Cloudflare DNS:

Nombre: www
Tipo: CNAME
Contenido: pure24nutrition.pages.dev
Proxy: Proxied (naranja nube)

Nombre: @ (root)
Tipo: CNAME
Contenido: pure24nutrition.pages.dev
Proxy: Proxied (naranja nube)

(Si no permite CNAME en raíz, usar ALIAS de Cloudflare)
```

#### Paso 7.2.3: Configurar SSL
```
En Cloudflare Dashboard:
SSL/TLS → Overview
├─ Encryption mode: Full Strict (recomendado)
│   ├─ Valida que origin tiene SSL válido
│   └─ Nuestra origin (Pages) es automáticamente HTTPS
└─ Edge Certificates: Crear certificado automático

SSL/TLS → Edge Certificates
├─ Always Use HTTPS: ON
├─ Minimum TLS Version: 1.2
└─ HSTS: Enable (si quieres max security)
```

#### Paso 7.2.4: Esperar Propagación DNS
```bash
# Verificar que DNS apunta a Cloudflare:
nslookup pure24nutrition.cl

# Debe mostrar nameservers de Cloudflare:
# Non-authoritative answer:
# pure24nutrition.cl nameserver = clara.ns.cloudflare.com
# pure24nutrition.cl nameserver = mason.ns.cloudflare.com

# Cuando propagó, acceder a:
# https://pure24nutrition.cl (debe ser HTTPS)
```

### Checklist 7.2
- [ ] DNS delegado a Cloudflare
- [ ] CNAME records configurados (www y root)
- [ ] SSL Full Strict activado
- [ ] Always Use HTTPS: ON
- [ ] Sitio accesible en https://pure24nutrition.cl
- [ ] HTTPS funciona (sin warnings)
- [ ] DNS propagado verificado

---

## 7.3 - Configurar Monitoreo y Alertas

### Objetivo
Visibilidad operativa 24/7.

### Pasos

#### Paso 7.3.1: Uptime Monitoring
```
Opción 1: Better Uptime (recomendado)
1. Ir a: https://betteruptime.com
2. Create Monitor:
   ├─ URL: https://pure24nutrition.cl
   ├─ Check frequency: every 5 minutes
   ├─ Incident notifications: Email
   └─ Status page: Create public status page
3. Configurar escalation:
   ├─ Alert después de 2 fallos consecutivos
   └─ Email + SMS (si quieres)

Opción 2: Uptime Robot (gratis)
1. https://uptimerobot.com
2. Add Monitor → Website
3. URL, frecuencia, notificación
```

#### Paso 7.3.2: TTFB Monitoring
```
En Cloudflare Dashboard:
Analytics → Performance
├─ Metrics: TTFB (Time to First Byte)
├─ Alerta si promedio > 100ms (en Cloudflare Workers)
└─ Revisar reportes diariamente
```

#### Paso 7.3.3: GA4 Monitoring
```
En Google Analytics:
1. Crear Alert:
   ├─ Custom alerts
   ├─ Metric: Conversion rate
   ├─ Alert if: drops 50% below baseline
   └─ Notification: Email
```

#### Paso 7.3.4: n8n Workflow Health
```
En n8n:
1. Crear workflow "Health Check":
   - Trigger: Schedule (cada 24 horas)
   - Node: HTTP GET /api/health (custom)
   - If unhealthy: Email alert

2. Monitorear ejecuciones:
   - Ir a: Executions
   - Ver logs de IPN workflow
   - Buscar errores (status ≠ 200)
```

#### Paso 7.3.5: Crear Dashboard
```
Opción: Google Data Studio (gratis)
1. Crear dashboard con KPIs:
   ├─ Uptime: % (from Uptime Robot)
   ├─ TTFB: ms (from Cloudflare)
   ├─ Conversions: # (from GA4)
   ├─ Stock status: por SKU (from Payload)
   └─ Workflow health: executions/errors (from n8n)

2. Share dashboard con team
```

### Checklist 7.3
- [ ] Uptime monitoring configurado
- [ ] TTFB monitoreado
- [ ] GA4 alerts creadas
- [ ] n8n health check script
- [ ] Dashboard creado y funcional
- [ ] Email alerts funcionando
- [ ] Acceso al dashboard compartido con team

**Tiempo:** 45 min

---

## 7.4 - Validación Final (GATE 7)

### Objetivo
Verificación exhaustiva de sistema completo.

### Validaciones Técnicas
```bash
# 1. HTTPS Certificate válido
curl -I https://pure24nutrition.cl | grep -i "secure"

# 2. TTFB <50ms
curl -w "@curl-format.txt" https://pure24nutrition.cl

# 3. Lighthouse Performance ≥95
# (Ir a: https://pagespeed.web.dev)

# 4. Sitemap accesible
curl https://pure24nutrition.cl/sitemap.xml

# 5. robots.txt presente
curl https://pure24nutrition.cl/robots.txt

# 6. JSON-LD sin errores
# (Usar: https://search.google.com/test/rich-results)

# 7. Favicon presente
curl -I https://pure24nutrition.cl/favicon.ico
```

### Validaciones Funcionales
```bash
# 1. Catálogo carga
curl https://pure24nutrition.cl/productos

# 2. Página producto carga
curl https://pure24nutrition.cl/productos/omega3-adek

# 3. Botón comprar funciona
# (Manual: click en sitio)

# 4. Pago procesable
# (Manual: test en MP sandbox)

# 5. Stock actualiza
# (Manual: monitorear después de pago)
```

### Validaciones Local SEO
```
# 1. NAP en footer
curl https://pure24nutrition.cl | grep -i "Jorge Montt 934"

# 2. LocalBusiness schema
# (Usar: Google Rich Results Test)

# 3. EXIF en imágenes
exiftool https://pure24nutrition.cl/assets/img/omega3.webp | grep -i gps

# 4. Cobertura pages indexables
curl https://pure24nutrition.cl/cobertura/plaza-de-armas
```

### Validaciones Producción
```
# 1. SSL certificado activo
openssl s_client -connect pure24nutrition.cl:443

# 2. Uptime monitoring activo
# (Verificar en Better Uptime dashboard)

# 3. Backups configurados
# (En Cloudflare + Payload DB)

# 4. Alerts activos
# (Recibir test alert email)

# 5. DNS propagado globalmente
# (Usar: https://www.whatsmydns.net/)
```

### Checklist GATE 7
- [ ] Sitio carga en HTTPS
- [ ] TTFB <50ms medido
- [ ] Lighthouse Performance ≥95
- [ ] Lighthouse SEO = 100
- [ ] Sitemap.xml accesible
- [ ] robots.txt accesible
- [ ] JSON-LD sin errores
- [ ] Favicon presente
- [ ] Todas las páginas producto cargadas
- [ ] FAQ visible en cada producto
- [ ] Botón comprar visible y funcional
- [ ] Pago de prueba procesable
- [ ] Stock actualiza automáticamente
- [ ] Orden aparece en Payload CMS
- [ ] Email confirmación recibido
- [ ] GA4 evento registrado
- [ ] NAP en footer consistente
- [ ] LocalBusiness Schema validado
- [ ] EXIF en imágenes verificado
- [ ] Páginas de cobertura indexables
- [ ] DNS apuntando correctamente
- [ ] SSL certificado activo
- [ ] Uptime monitoring activo
- [ ] Backups configurados
- [ ] Alerts funcionando

---

# 🎉 SISTEMA COMPLETAMENTE DEPLOYADO

**Si TODOS los checks pasan → PUESTA EN VIVO EXITOSA**

---

## TROUBLESHOOTING

### Problema: TTFB > 50ms
```
Soluciones:
1. Verificar que Cloudflare está cachando:
   curl -I https://pure24nutrition.cl | grep CF-Cache-Status
   Debe ser: HIT (no MISS)

2. Si es MISS, Cloudflare no caché. Causas:
   - No-Cache header en origen (revisar astro.config.mjs)
   - Cache rules no configuradas

3. Si es HIT pero TTFB sigue alto:
   - Problema en origin (VPS backend)
   - Reducir tamaño HTML (minify mejor)
```

### Problema: Stock no actualiza
```
Soluciones:
1. Verificar workflow n8n ejecutó:
   - n8n Dashboard → Executions
   - Buscar última ejecución
   - Ver error en logs

2. Verificar PATCH endpoint:
   curl -X PATCH http://localhost:3000/api/products/P24-OMEGA3-001 \
     -H "Content-Type: application/json" \
     -d '{"stock": 44}'

3. Verificar Payload API key:
   - Ir a Payload admin
   - Settings → API Tokens
   - Crear/copiar token
   - Guardar en n8n
```

### Problema: Email no llega
```
Soluciones:
1. Verificar nodo email en n8n:
   - Executions → ver si nodo ejecutó
   - Buscar "email sent" en logs

2. Si nodo falló:
   - Verificar API key Resend/Sendgrid/etc
   - Verificar email "To" no está vacío
   - Verificar template HTML es válido

3. Si email se envió pero no llega:
   - Revisar spam/junk folder
   - Verificar SPF/DKIM records en DNS
```

### Problema: GA4 evento no llega
```
Soluciones:
1. Verificar parámetros corretos:
   - measurement_id (G-XXXXX)
   - api_secret (20 caracteres)

2. En nodo HTTP de n8n:
   - Response debe ser 204 (No Content)
   - Si es 400: revisar estructura JSON

3. En GA4 Dashboard:
   - Esperar 24h (eventos no aparecen inmediatamente)
   - Ir a: Monetization → Transactions
   - Si nada, revisar Real-time report
```

### Problema: Deploy no se dispara
```
Soluciones:
1. Verificar Deploy Hook URL:
   curl -X POST <TU_DEPLOY_HOOK_URL>
   Debe retornar 200 (o crear deployment)

2. Verificar en Cloudflare:
   Pages → pure24nutrition → Deployments
   Debería mostrar nuevo deployment manual

3. Si no, revisar:
   - URL es válida (no expiró)
   - n8n HTTP nodo tiene correcgit la URL
   - n8n puede alcanzar Internet (firewall)
```

---

## SIGUIENTES PASOS

Una vez GATE 7 completo:

1. **Mantenimiento continuo:**
   - Monitorear dashboards diariamente
   - Revisar logs n8n cada 48h
   - Actualizar stock en Payload según ventas

2. **Optimización:**
   - Analizar GA4 para entender user behavior
   - A/B test copy y CTAs
   - Optimizar imágenes según performance

3. **Escala:**
   - Agregar más productos (hasta 1000)
   - Implementar categorías avanzadas
   - Agregar reseñas de clientes
   - Implementar sistema de cupones

4. **Marketing:**
   - Configurar ads en Google/Facebook
   - Email marketing campaigns
   - Influencer partnerships

---

## RESUMEN TIMELINE FINAL

| Fase | Nombre | Duración | Status |
|------|--------|----------|--------|
| 0 | Pre-Producción | 1.5h | ⏳ |
| 1 | Technical SEO | 2.5h | ⏳ |
| 1.2 | Message Lab | 3.5h | ⏳ |
| 2 | GEO & AI | 2.5h | ⏳ |
| 3 | Local SEO | 2.5h | ⏳ |
| 4 | Headless E-comm | 3h | ⏳ |
| 5 | Mercado Pago | 2.5h | ⏳ |
| 6 | Automatización | 1.5h | ⏳ |
| 7 | Deploy & Monitor | 2h | ⏳ |
| **TOTAL** | **Sistema Completo** | **~21 horas** | **✅** |

---

**Manual Creado:** 9 de Marzo 2026
**Versión:** 2.0 Opus Edition
**Status:** Listo para Implementación

**ADELANTE CON OPUS 🚀**

