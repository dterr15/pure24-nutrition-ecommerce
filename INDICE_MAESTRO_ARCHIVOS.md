# 🗂️ ÍNDICE MAESTRO: Todos los Archivos del Proyecto

**Fecha:** 9 de Marzo de 2026
**Propósito:** Saber exactamente dónde está cada cosa y qué hace

---

## 📊 TABLA RÁPIDA (¿Dónde está X?)

| Busco | Archivo | Carpeta | Qué Es |
|-------|---------|---------|--------|
| Homepage | `index.astro` | `frontend/src/pages/` | Página principal |
| Sobre Nosotros | `sobre-nosotros.astro` | `frontend/src/pages/` | About page |
| Contacto | `contacto.astro` | `frontend/src/pages/` | Contact form |
| Carrito | `carrito.astro` | `frontend/src/pages/` | Shopping cart |
| Producto individual | `[slug].astro` | `frontend/src/pages/productos/` | Dinámico SSG ×12 |
| Catálogo productos | `index.astro` | `frontend/src/pages/productos/` | Listado |
| Navbar/Footer | `Layout.astro` | `frontend/src/layouts/` | Template base |
| Estilos globales | `main.css` | `frontend/src/styles/` | Variables CSS |
| Tarjeta producto | `ProductCard.astro` | `frontend/src/components/` | Componente |
| Tarjeta testimonios | `QuoteCard.astro` | `frontend/src/components/` | Componente |
| Carrito (React) | `ShoppingCart.tsx` | `frontend/src/components/` | Componente |
| Schema About | `AboutSchema.astro` | `frontend/src/components/` | JSON-LD SEO |
| Schema Contact | `ContactSchema.astro` | `frontend/src/components/` | JSON-LD SEO |
| Schema Local | `LocalBusinessSchema.astro` | `frontend/src/components/` | JSON-LD SEO |
| Schema FAQ | `FAQSchema.astro` | `frontend/src/components/` | JSON-LD SEO |
| API Productos | `payload-client.ts` | `frontend/src/lib/` | Fetch datos |
| Config Astro | `astro.config.mjs` | Raíz | Build config |
| Mercado Pago Webhook | `mercadopago.webhook.ts` | `backend/webhooks/` | IPN handler |
| Email Service | `email.service.ts` | `backend/services/` | Email sending |
| Backend Server | `server.ts` | `backend/` | Express + Payload |
| CMS Config | `payload.config.ts` | `backend/` | Payload setup |

---

## 📁 ESTRUCTURA COMPLETA

### FRONTEND

```
frontend/src/
│
├─ pages/                          ← Cada .astro = 1 página generada
│  ├─ index.astro                  (Homepage)
│  ├─ sobre-nosotros.astro         (About)
│  ├─ contacto.astro               (Contact)
│  ├─ carrito.astro                (Cart)
│  │
│  └─ productos/
│     ├─ index.astro               (Productos page)
│     └─ [slug].astro              (Product detail × 12 SSG)
│
├─ layouts/
│  └─ Layout.astro                 Base HTML (navbar, footer, meta)
│
├─ components/                     Reutilizables
│  ├─ Layout.astro                 Layout (para páginas)
│  ├─ ProductCard.astro            Tarjeta producto
│  ├─ ProductGrid.astro            Grid de productos
│  ├─ QuoteCard.astro              Tarjeta testimonios ⭐
│  │
│  ├─ ShoppingCart.tsx             Carrito (React)
│  ├─ ShoppingCart.css             Estilos carrito
│  │
│  ├─ LocalBusinessSchema.astro    Schema SEO
│  ├─ ContactSchema.astro          Schema SEO
│  ├─ AboutSchema.astro            Schema SEO
│  └─ FAQSchema.astro              Schema SEO
│
├─ lib/
│  └─ payload-client.ts            Fetch API (productos)
│
├─ store/
│  └─ cart.ts                      CartManager (localStorage)
│
├─ styles/
│  └─ main.css                     Estilos globales (variables)
│
└─ env.d.ts                        TypeScript definitions

```

### BACKEND

```
backend/
│
├─ server.ts                       Express + Payload init
├─ payload.config.ts               Configuración CMS
├─ tsconfig.json                   TypeScript config
├─ package.json                    Dependencies
│
├─ webhooks/
│  └─ mercadopago.webhook.ts       IPN payment handler
│
├─ services/
│  └─ email.service.ts             Email sending (SMTP/SendGrid/Resend)
│
├─ collections/                    Database schemas
│  ├─ Users.ts
│  ├─ Media.ts
│  ├─ Products.ts
│  └─ Orders.ts
│
└─ scripts/
   ├─ seed.ts                      Seed 30 productos
   ├─ setup-webhook.ts             Validar configuración
   └─ test-webhook.ts              Testear webhook
```

### DOCUMENTACIÓN

```
docs/ (o raíz)
│
├─ FASE_5_1_*.md                   Mercado Pago integration
├─ FASE_5_2_IPN_WEBHOOK.md         Webhook setup
├─ FASE_5_2_PASO_A_PASO.md         Step-by-step
├─ FASE_5_2_QUICK_REFERENCE.md     Cheat sheet
│
├─ GUIA_INTEGRACION_PRODUCCION.md  ← TÚ ESTÁS AQUÍ
├─ INDICE_MAESTRO_ARCHIVOS.md      ← Este archivo
├─ ROADMAP_FASES_5_6_7.md          Timeline completo
├─ STATUS_20260309.md              Estado del proyecto
│
└─ IMPLEMENTACION_*.md             Resúmenes de cada fase
```

### RAÍZ DEL PROYECTO

```
pure24-nutrition-ecommerce/
│
├─ .env                            Secretos (NO EN GIT)
├─ .env.example                    Template de .env
├─ .gitignore                      Qué ignorar
│
├─ astro.config.mjs                Config Astro (srcDir, alias, etc)
├─ package.json                    Dependencies & scripts
├─ tsconfig.json                   TypeScript
│
├─ docker-compose.yml              Local dev stack
│
├─ frontend/                       TU SITIO WEB
├─ backend/                        API (opcional, para webhooks)
│
└─ dist/                           Build output (17 HTML files)
   └─ (generado por npm run build)
```

---

## 🔄 FLUJOS DE ARCHIVO

### Flujo 1: Desde Usuario a Página

```
User visits: /sobre-nosotros

↓

Astro renders: frontend/src/pages/sobre-nosotros.astro

↓

Lee layout: frontend/src/layouts/Layout.astro
├─ Meta tags
├─ Navbar
├─ Footer
└─ CSS (main.css)

↓

Carga componentes:
├─ AboutSchema.astro (JSON-LD)
├─ QuoteCard.astro (×3)
└─ Inline CSS en astro

↓

Genera HTML estático: dist/sobre-nosotros/index.html

↓

Servido por CDN (Vercel/Netlify/CF) → FAST ⚡
```

### Flujo 2: Desde User → Carrito → Mercado Pago

```
User clicks "Comprar"

↓

JavaScript ejecuta: ShoppingCart.tsx
├─ Llama: cartManager.add(product)
└─ Guarda en localStorage

↓

User clicks "Proceder al pago"

↓

Llama API: n8n webhook (FASE 5.1)
├─ Envía: { sku, quantity }
└─ Recibe: preferenceId

↓

Redirige a: Mercado Pago checkout
├─ User paga
└─ Redirige a success URL

↓

(FASE 5.2) Mercado Pago envía webhook:

POST /api/webhooks/mercadopago
Payload: { paymentId, externalReference, status }

↓

Handler: mercadopago.webhook.ts
├─ Valida firma HMAC
├─ Busca orden en BD
├─ Actualiza stock
├─ Envía email (SendGrid)
└─ Retorna 200 OK

↓

Stock reducido automáticamente ✅
Email enviado ✅
```

### Flujo 3: Admin gestiona productos

```
Admin goes to: /admin (Payload CMS)

↓

Login con credentials

↓

Ve "Products" collection

↓

Edit producto:
├─ Cambiar precio
├─ Cambiar stock
├─ Subir imagen
└─ Save

↓

(FASE 6.4) Trigger deploy hook

↓

Cloudflare rebuild site (ISR):
├─ Regenera /productos/index.html
├─ Regenera /productos/[slug].html
└─ Deploy en 2 min

↓

Site actualizado con nuevos precios ✅
```

---

## 🎯 CÓMO NAVEGAR ESTE PROYECTO

### Si quieres cambiar...

| Cambio | Ir a | Editar |
|--------|------|--------|
| Homepage texto | `pages/index.astro` | Contenido en `<section>` |
| Navbar links | `layouts/Layout.astro` | `<ul class="nav-menu">` |
| Colores sitio | `styles/main.css` | Variables CSS (`:root { --primary: ... }`) |
| Producto individual | `pages/productos/[slug].astro` | Template para 12 productos |
| About page | `pages/sobre-nosotros.astro` | Team, timeline, testimonios |
| Formulario contacto | `pages/contacto.astro` | Form fields, validación |
| Team miembros | `pages/sobre-nosotros.astro` | Array `teamMembers` |
| Testimonios | `pages/sobre-nosotros.astro` | Array `testimonials` |
| Precio producto | `lib/payload-client.ts` | `staticProducts` array |
| Esquema SEO | `components/*Schema.astro` | JSON-LD structure |
| Carrito estilos | `components/ShoppingCart.css` | Estilos CSS |
| Carrito funcionalidad | `store/cart.ts` | CartManager class |

---

## 📋 ARCHIVOS POR PROPÓSITO

### SEO & Social
- `components/LocalBusinessSchema.astro` - Negocio local
- `components/AboutSchema.astro` - Organización
- `components/ContactSchema.astro` - Contacto
- `components/FAQSchema.astro` - Preguntas frecuentes
- `layouts/Layout.astro` - Meta tags globales

### Interfaz Usuario
- `pages/index.astro` - Homepage
- `pages/sobre-nosotros.astro` - About page
- `pages/contacto.astro` - Contact page
- `pages/carrito.astro` - Cart page
- `pages/productos/[slug].astro` - Product pages
- `components/ProductCard.astro` - Tarjeta producto
- `components/QuoteCard.astro` - Testimonios
- `components/ShoppingCart.tsx` - Carrito interactivo

### Datos
- `lib/payload-client.ts` - API client (fetch productos)
- `store/cart.ts` - Cart state (localStorage)
- `backend/collections/*.ts` - BD schemas

### Integraciones (Próximas)
- `backend/webhooks/mercadopago.webhook.ts` - Pagos
- `backend/services/email.service.ts` - Emails
- `backend/server.ts` - API server

### Estilos
- `styles/main.css` - Global styles
- `components/ShoppingCart.css` - Cart styles
- Inline `<style>` en cada componente

### Configuración
- `astro.config.mjs` - Astro config
- `backend/payload.config.ts` - CMS config
- `.env` - Secretos y credenciales
- `package.json` - Dependencies

---

## ✅ VALIDACIÓN: Archivo está completo si tiene...

| Tipo | Validar |
|------|---------|
| Página Astro | `---` (frontmatter), imports, JSX/HTML, `<style>`, export |
| Componente | Props interface, JSX/HTML, `<style>` |
| Schema JSON-LD | `<script type="application/ld+json">` con estructura válida |
| CSS global | `:root { --variables }`, reset, utility classes |
| API Client | `export function`, async, error handling |
| Config | Exports objeto válido |
| Documentación | Markdown headers, tablas, code blocks |

---

## 🔗 CÓMO ESTÁN CONECTADOS

```
astro.config.mjs
  ↓
  srcDir: './frontend/src'  ← Dónde buscar páginas
  alias: '@': './frontend/src' ← Import shortcuts
  integrations: [react()]   ← Permite .tsx
  ↓
pages/ ← Astro escanea aquí
  ├─ index.astro ← GET /
  ├─ sobre-nosotros.astro ← GET /sobre-nosotros
  └─ productos/[slug].astro ← GET /productos/omega3-adek (×12)

Cada página:
  ├─ Import Layout ← navbar, footer, meta
  ├─ Import componentes ← ProductCard, Schema
  ├─ Import data ← payload-client.ts
  └─ Import estilos ← main.css global + inline

main.css
  ├─ :root variables ← Colores, fuentes
  ├─ Reset ← Normalize
  └─ Utilities ← Grid, flex, etc

Resultado:
  npm run build → dist/
  ├─ dist/index.html
  ├─ dist/sobre-nosotros/index.html
  ├─ dist/productos/omega3-adek/index.html
  └─ (×17 archivos HTML estáticos)

Deploy a Vercel:
  ├─ Push a main
  └─ Vercel detecta → npm run build → Deploy dist/ ✅
```

---

## 🆘 "No encuentro X"

| Necesito | Pregunta | Respuesta |
|----------|----------|-----------|
| Cambiar precio | Dónde están los precios? | `frontend/src/lib/payload-client.ts` → array `staticProducts` |
| Agregar miembro equipo | Dónde está el team? | `frontend/src/pages/sobre-nosotros.astro` → array `teamMembers` |
| Cambiar color primario | Dónde está el color azul? | `frontend/src/styles/main.css` → `--primary: #1d4ed8` |
| Ver estructura BD | Cuál es el schema de Order? | `backend/collections/Orders.ts` |
| Agregar página nueva | Cómo crear página? | Crea `frontend/src/pages/nueva.astro` → Auto genera `/nueva` |
| Ver API endpoints | Cuáles son las rutas? | `backend/server.ts` → `app.post/get/put` routes |
| Cambiar nombre marca | Dónde está "Pure24"? | Search: `grep -r "Pure24" frontend/` |

---

## 📊 ESTADÍSTICAS DEL PROYECTO

| Métrica | Cantidad |
|---------|----------|
| Páginas generadas | 17 |
| Componentes Astro | 6 |
| Componentes React | 1 |
| Schemas JSON-LD | 4 |
| Archivos CSS | 2 |
| Líneas de código | 3,500+ |
| Líneas de documentación | 2,000+ |
| Archivos documentación | 10+ |
| Commits en repo | 15+ |
| Build time | ~4 segundos |
| Tamaño gzip | 1.39 kB |

---

## 🚀 PRÓXIMOS ARCHIVOS A CREAR

| Cuando | Archivo | Propósito |
|--------|---------|-----------|
| FASE 5.2 | `backend/services/email.service.ts` | Email templates |
| FASE 5.2 | `scripts/test-webhook.ts` | Test webhook |
| FASE 5.3 | `pages/admin/orders.astro` | Admin panel |
| FASE 5.3 | `pages/admin/reports.astro` | Reports |
| FASE 6.1 | `backend/hooks/stock-sync.ts` | Auto stock |
| FASE 6.2 | `lib/ga4-client.ts` | Analytics |
| FASE 6.4 | `scripts/webhook-n8n.ts` | Deploy hook |

---

**Status:** ✅ Índice completo
**Uso:** Abre este archivo cuando no encuentres algo
**Next:** Deploy a Vercel (15 min) o FASE 5.2 (1h)
