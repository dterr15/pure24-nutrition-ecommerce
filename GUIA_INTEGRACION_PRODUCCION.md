# 🚀 GUÍA DEFINITIVA: De Repo a Producción (Sin Lovable)

**Fecha:** 9 de Marzo de 2026
**Status:** ✅ LISTO PARA PRODUCCIÓN
**Objetivo:** Pasar de repo a sitio vivo en dominio real

---

## 📊 CHECKLIST POR ETAPA (Validación de Progreso)

### ✅ ETAPA 1: Codebase (COMPLETADA)
- [x] Frontend Astro configurado (`frontend/src/`)
- [x] Backend Payload CMS configurado (`backend/`)
- [x] 17 páginas estáticas generadas (build exitoso)
- [x] Componentes Astro sin Lovable (puro código)
- [x] Responsive design verificado
- [x] SEO schemas (JSON-LD) en todas las páginas
- [x] Formularios funcionales
- [x] Shopping cart con localStorage
- [x] Producto catalog con SSG (12 productos)

**Verificar:** `npm run build` → "17 page(s) built" ✅

---

### ✅ ETAPA 2: Conexiones Internas (COMPLETADA)
- [x] Layout.astro conectado a todas las páginas
- [x] CSS global con variables funcionales
- [x] Componentes reutilizables (ProductCard, QuoteCard, Schemas)
- [x] Navbar con navegación actualizada
- [x] Footer con contacto y links
- [x] Google Fonts integrado
- [x] GA4 tracking inicializado

**Verificar:** `npm run preview` → Navegar por todas las páginas sin errores 404 ✅

---

### ✅ ETAPA 3: Backend & Bases de Datos (PARCIAL - EN DESARROLLO)
- [x] Payload CMS estructura lista
- [x] PostgreSQL configurado en .env
- [x] 4 Colecciones definidas (Users, Media, Products, Orders)
- [x] Seed data (30 productos) listo
- [ ] Webhook de Mercado Pago (FASE 5.2 - próximo)
- [ ] Email service (FASE 5.2 - próximo)
- [ ] Stock sync automático (FASE 6.1 - próximo)

**Verificar:** `docker-compose up` → Payload CMS accesible en `http://localhost:3000/admin` ✅

---

## 🗺️ MAPA DEL PROYECTO

```
pure24-nutrition-ecommerce/
│
├── 📁 frontend/                    ← TU SITIO WEB
│   └── src/
│       ├── pages/                  ← Páginas Astro (SSG)
│       │   ├── index.astro        (Homepage)
│       │   ├── sobre-nosotros.astro (About)
│       │   ├── contacto.astro     (Contact)
│       │   ├── carrito.astro      (Cart)
│       │   └── productos/
│       │       ├── index.astro    (Catalog)
│       │       └── [slug].astro   (Product detail × 12)
│       │
│       ├── components/            ← Componentes reutilizables
│       │   ├── Layout.astro       (Base template)
│       │   ├── ProductCard.astro
│       │   ├── QuoteCard.astro
│       │   ├── ShoppingCart.tsx   (React)
│       │   └── *Schema.astro      (JSON-LD)
│       │
│       ├── layouts/
│       │   └── Layout.astro       (HTML base)
│       │
│       └── styles/
│           └── main.css           (Estilos globales)
│
├── 📁 backend/                    ← API OPCIONAL (para webhooks, stock sync)
│   ├── server.ts                  (Express + Payload)
│   ├── payload.config.ts          (CMS config)
│   ├── webhooks/
│   │   └── mercadopago.webhook.ts (IPN payments)
│   ├── services/
│   │   └── email.service.ts       (Email sending)
│   └── collections/               (Database schemas)
│
├── 📁 docs/                       ← Documentación
│   ├── FASE_5_1_*.md              (Mercado Pago integration)
│   ├── FASE_5_2_*.md              (Webhook setup)
│   └── ...
│
├── 📄 .env                        ← Secretos (nunca en git)
├── 📄 astro.config.mjs            ← Frontend config
├── 📄 docker-compose.yml          ← Local dev stack
├── 📄 package.json                ← Dependencies

```

---

## 🔄 FLUJO DE DESARROLLO ACTUAL

```
1. FRONTEND (Astro SSG)
   ├─ npm run dev → http://localhost:3000
   ├─ npm run build → dist/ (17 HTML files)
   └─ npm run preview → Preview de build

2. BACKEND (Payload CMS)
   ├─ docker-compose up → PostgreSQL + Payload
   ├─ http://localhost:3000/admin → CMS UI
   └─ API en http://localhost:3000/api/

3. INTEGRACIONES (opcionales ahora, necesarias en producción)
   ├─ Mercado Pago (checkout form) ← YA ESTÁ
   ├─ Webhook (payment confirmation) ← FASE 5.2
   ├─ Email (confirmations) ← FASE 5.2
   └─ GA4 (analytics) ← FASE 6.2

```

---

## 🚀 CÓMO PASAR A PRODUCCIÓN (SIN LOVABLE)

### OPCIÓN 1: Vercel (Recomendado para SSG Astro)

**Por qué Vercel:**
- Optimizado para Astro
- ISR (Incremental Static Regeneration) - rebuild en 30 seg
- Free tier suficiente para esto
- Integración con git automática

**Pasos:**

1. **Conectar repo**
   ```bash
   # Ya tienes el repo en GitHub
   # Solo ve a https://vercel.com
   # Click "New Project" → Conecta GitHub → Select repo
   ```

2. **Configurar build**
   ```
   Framework: Astro
   Build Command: npm run build
   Output Directory: dist
   Node Version: 18.x
   ```

3. **Environment variables**
   ```
   Vite en .env local:
   PUBLIC_DIRECTUS_URL=http://localhost:8055
   PUBLIC_GA4_MEASUREMENT_ID=G-DVHZB93STQ
   MERCADOPAGO_PUBLIC_KEY=APP_USR-...
   ```

4. **Deploy**
   ```bash
   git push origin main
   # Vercel detecta cambios y redeploya automáticamente
   ```

5. **Custom domain**
   ```
   Vercel > Settings > Domains
   Agregar: pure24nutrition.cl
   Actualizar DNS del registrador
   ```

**Resultado:** Tu sitio vive en `https://pure24nutrition.cl` ✅

---

### OPCIÓN 2: Cloudflare Pages (Gratis + CDN global)

**Pasos similares a Vercel pero con Cloudflare:**

1. Ir a https://pages.cloudflare.com
2. Conectar GitHub
3. Config:
   - Build: `npm run build`
   - Output: `dist`
4. Deploy
5. Agregar dominio

---

### OPCIÓN 3: Netlify (Lo que usabas antes)

1. Drag & drop `dist/` folder, o
2. Conectar GitHub
3. Deploy automático en cada push

---

## 📋 CHECKLIST ANTES DE PRODUCCIÓN

### 1. Código Listo ✅
- [x] `npm run build` sin errores
- [x] Todas las páginas generadas (17)
- [x] Links internos funcionan
- [x] Formularios validan
- [x] Mobile responsive verificado
- [x] SEO schemas válidos

**Test:**
```bash
npm run build
npm run preview
# Navegar por todo el sitio
```

### 2. Contenido Actualizado ✅
- [x] Team real (Cristian, Patricia, Dr. Andrés)
- [x] Testimonios (Carlos, Verónica, Felipe)
- [x] Ubicación correcta (Jorge Montt 934)
- [x] Teléfono actualizado (+56 9 7134 5988)
- [x] Email (info@pure24nutrition.cl)
- [x] Productos (12 items con precios reales)

### 3. Integraciones Opcionales (Para después)
- [ ] Mercado Pago sandbox → testing
- [ ] Webhook endpoint (cuando tengas servidor)
- [ ] Email service (SendGrid/Resend)
- [ ] GA4 production tracking

---

## 🔗 CÓMO CONECTAN LOS ARCHIVOS

### Frontend (Lo que VE el usuario)

```
User visits: https://pure24nutrition.cl/productos/omega3-adek

↓

Astro SSG genera 12 archivos:
dist/productos/omega3-adek/index.html (HTML puro)
dist/productos/creatina-hcl/index.html
... etc

↓

El HTML incluye:
- Layout.astro (navbar, footer, estilos)
- ProductCard.astro (componentes reutilizables)
- ShoppingCart.tsx (React interactivo)
- LocalBusinessSchema.astro (JSON-LD para SEO)

↓

CSS global en styles/main.css (variables, reset)

↓

GA4 tracking en script tag (Google Analytics)

↓

Resultado: Fast static HTML + Interactive React components
```

### Backend (Lo que GESTIONA los datos)

```
Admin visita: https://pure24nutrition.cl/admin

↓

Payload CMS UI (React SPA)
- Login
- Editar productos
- Ver órdenes
- Gestionar usuarios

↓

API Endpoints:
POST /api/collections/products
GET /api/collections/products/[id]
POST /api/webhooks/mercadopago (cuando implementes)

↓

PostgreSQL Database
├─ users
├─ products
├─ orders
└─ media
```

### Flujo de Integración Actual

```
1. FRONTEND SOLO (Hoy)
   User → Astro SSG HTML → Static files → CDN (Vercel/Netlify/CF)

2. CON CHECKOUT (Después)
   User → Astro HTML → Mercado Pago API → Payment Gateway

3. CON WEBHOOK (Después)
   Mercado Pago → POST /api/webhooks/mercadopago
   → Update Directus/PostgreSQL
   → Send email (SendGrid)
   → Rebuild site (ISR)

4. CON ADMIN (Después)
   Admin → Payload CMS → PostgreSQL
   → Edit products
   → Rebuild site (ISR)
```

---

## 🛠️ COMANDOS ESENCIALES

### Desarrollo Local
```bash
# Frontend
npm run dev              # Astro dev server (http://localhost:3000)
npm run build           # Build para producción
npm run preview         # Preview del build

# Backend (opcional, para después)
docker-compose up       # Start PostgreSQL + Payload
npm run dev:backend     # Start backend server
```

### Verificación
```bash
# Ver si todo está en orden
npm run build           # ✅ Si dice "17 page(s) built" → OK
git status              # ✅ Si solo muestra archivos intencionales → OK
git log --oneline -10   # ✅ Últimos commits en main
```

### Deploy
```bash
# En Vercel/Netlify/CF Pages:
# Solo haz git push origin main y ellos redeploy automáticamente
git push origin main
```

---

## 📊 PROGRESO POR FASE

| FASE | Descripción | Status | Archivos | Build |
|------|------------|--------|---------|-------|
| 1-4 | Frontend + Catálogo | ✅ 100% | 6 páginas | OK |
| 5.1 | Mercado Pago checkout | ✅ 100% | UI lista | OK |
| 5.2 | Webhook + Email | ⏳ Doc ready | Código listo | - |
| 5.3 | Admin dashboard | ⏳ Próximo | Design ready | - |
| 6.1-6.4 | Automation | ⏳ Próximo | Specs ready | - |
| 7 | Final validation | ⏳ Próximo | Checklist ready | - |

**TU SIGUIENTE PASO:** Deploy a Vercel (15 min) o implementar FASE 5.2 (1h)

---

## ⚠️ PROBLEMAS COMUNES & SOLUCIONES

| Problema | Causa | Solución |
|----------|-------|----------|
| "404 en /sobre-nosotros" | Archivo no generado | `npm run build && npm run preview` |
| "CSS no carga" | Path incorrecto | Revisar `astro.config.mjs` → `srcDir` |
| "Imágenes no aparecen" | URL relativa mala | Usar `/assets/` path absoluto |
| "Formulario no valida" | HTML5 validation | Agregar `required` attribute |
| "ShoppingCart no funciona" | React no cargó | Verificar `@astrojs/react` instalado |
| "Mercado Pago error" | Token vencido | Actualizar `MERCADOPAGO_PUBLIC_KEY` en .env |

---

## 🎯 PRÓXIMOS PASOS RECOMENDADOS

### Esta semana:
1. **Deploy a Vercel** (15 min)
   - Conecta repo
   - Configura dominio
   - Verifica que funciona en https://pure24nutrition.cl

2. **Test Mercado Pago** (30 min)
   - Usar sandbox
   - Simular checkout
   - Ver si genera preference

### Próxima semana:
3. **Implementar FASE 5.2** (1h)
   - Webhook receiver
   - Email service
   - Stock sync

4. **Implementar FASE 5.3** (5h)
   - Admin dashboard
   - Order management
   - Reports

---

## 📞 REFERENCIAS RÁPIDAS

**Cuando algo no funcione:**
1. Revisar `/docs/` folder → Guías específicas de cada FASE
2. Ver commit messages → `git log` → Entender qué cambió
3. Revisar `.env` → Verificar que tengas todos los tokens
4. `npm run build` → Ver error exacto
5. Google error message → Solución

---

**Status:** ✅ LISTO PARA PASAR A PRODUCCIÓN
**Próximo:** Deploy a Vercel en 15 minutos

¿Qué prefieres primero: Pasar a producción o implementar FASE 5.2?
