# MANUAL DE IMPLEMENTACIÓN - LÍNEA DE PRODUCCIÓN COMPLETA
## Pure24 Nutrition - Stack de Dominancia Orgánica (FASE 0 → FASE 7)

**Versión:** 2.0 Opus Edition
**Fecha:** 9 de Marzo 2026
**Objetivo:** Guía paso-a-paso para Opus implementar el sistema e-commerce completo
**Timeline Total:** ~19 horas de ejecución

---

## 📋 TABLA DE CONTENIDOS

1. [Visión General](#visión-general)
2. [Requisitos Previos](#requisitos-previos)
3. [FASE 0: Pre-Producción](#fase-0-pre-producción)
4. [FASE 1: Technical SEO](#fase-1-technical-seo)
5. [FASE 1.2: Message Lab](#fase-12-message-lab)
6. [FASE 2: GEO & AI Optimization](#fase-2-geo--ai-optimization)
7. [FASE 3: Local SEO](#fase-3-local-seo)
8. [FASE 4: Headless E-commerce](#fase-4-headless-e-commerce)
9. [FASE 5: Mercado Pago Integration](#fase-5-mercado-pago-integration)
10. [FASE 6: Automatización n8n](#fase-6-automatización-n8n)
11. [FASE 7: Deploy y Monitoreo](#fase-7-deploy-y-monitoreo)
12. [Gates de Validación](#gates-de-validación)
13. [Troubleshooting](#troubleshooting)

---

## 🎯 VISIÓN GENERAL

### Qué Construiremos

Un **e-commerce de suplementos de nutrición** completamente funcional con:

```
┌─────────────────────────────────────────────────────┐
│  PÚBLICO: pure24nutrition.cl (Astro + Cloudflare)  │
├─────────────────────────────────────────────────────┤
│  BACKEND: Payload CMS (PostgreSQL)                 │
│  AUTOMATIZACIÓN: n8n Workflows                      │
│  PAGOS: Mercado Pago IPN Integration               │
│  MONITOREO: Jules AI + GA4 + Cloudflare Analytics  │
└─────────────────────────────────────────────────────┘
```

### Stack Técnico

```
Frontend:       Astro (SSG) → Cloudflare Pages
Backend:        Payload CMS v3 (Node.js + PostgreSQL)
Automatización: n8n (5 workflows)
Pagos:          Mercado Pago API + IPN Webhooks
Analytics:      Google GA4 + Cloudflare Analytics
Hosting:        Cloudflare Pages (frontend)
                VPS (backend + n8n)
```

### Fases y Timeline

```
FASE 0: Pre-Producción               1.5h  ← COMIENZA AQUÍ
FASE 1: Technical SEO                2-3h
FASE 1.2: Message Lab                3.5h
FASE 2: GEO & AI Optimization        2-3h
FASE 3: Local SEO                    2.5h
FASE 4: Headless E-commerce          3h
FASE 5: Mercado Pago Integration     2.5h
FASE 6: Automatización n8n           1.5h
FASE 7: Deploy y Monitoreo           2h
────────────────────────────────────────
TOTAL                                ~19h
```

---

## ✅ REQUISITOS PREVIOS

### Información Requerida (Proporciona Usuario)

Antes de comenzar, Opus necesita acceso a:

#### 1. Datos de Productos
```
Lista en CSV o JSON con:
- SKU (código único): P24-OMEGA3-001
- Nombre producto: OMEGA 3 + ADEK 90 CAPS
- Precio: 17990 (CLP)
- Stock: 45 unidades
- Descripción: 200+ caracteres
- GTIN13: Código de barras de 13 dígitos
- Imagen URL: Enlace a imagen en alta res (1200px+)

Ejemplo:
┌────────────────────┬───────────────┬──────┬───────┐
│ SKU                │ Nombre        │ Prec │ Stock │
├────────────────────┼───────────────┼──────┼───────┤
│ P24-OMEGA3-001     │ OMEGA 3+ADEK  │17990 │ 45    │
│ P24-MAG-002        │ MAGNESIO 90   │12990 │ 32    │
└────────────────────┴───────────────┴──────┴───────┘
```

#### 2. Credenciales de Integraciones
```
Mercado Pago:
  - Public Key: APP_[...] (obten de Dashboard)
  - Access Token: APP_USR_[...] (obten de Dashboard)
  - Client ID: [número]

Google Analytics 4:
  - Property ID: [número]
  - Measurement ID: G-[...] (obten de Admin)

Cloudflare:
  - Account ID: [hex string]
  - Zone ID: [hex string, para pure24nutrition.cl]
  - API Token: (crear en dashboard)

Dominio:
  - pure24nutrition.cl (o tu dominio)
  - Debe estar delegado a Cloudflare nameservers
```

#### 3. Información de Negocio
```
Datos de Contacto:
  - Nombre comercial: Pure 24 Nutrition
  - Dirección: Jorge Montt 934, Punta Arenas
  - Teléfono: +56 9 7134 5988
  - Email: info@pure24nutrition.cl

Datos de Google Business Profile:
  - URL exacta desde GBP (para sincronizar NAP)
  - Horarios de atención
  - Fotos de la ubicación
```

#### 4. Ambiente Local
```
Debe estar disponible:
✓ Git (para clonar repo)
✓ Node.js 18+ (para Astro + Payload)
✓ Docker (para PostgreSQL + n8n)
✓ Docker Compose (para orquestación)
✓ GitHub account (para repo)
```

### Stack Pre-requisito (Usuario debe tener)

| Componente | Estado | Responsable |
|-----------|--------|------------|
| GitHub repo (private) | ⏳ Usuario crea | Usuario |
| VPS con Docker | ⏳ Usuario provision | Usuario |
| PostgreSQL running | ⏳ Docker Compose levanta | Opus |
| n8n running | ⏳ Docker Compose levanta | Opus |
| Dominio delegado a CF | ⏳ Usuario configura | Usuario |
| Credenciales MP/GA4/CF | ⏳ Usuario proporciona | Usuario |

---

# FASE 0: PRE-PRODUCCIÓN

## 0.1 - Preparar Infraestructura Base

### Objetivo
Tener estructura de carpetas lista, repo sincronizado y environment variables configuradas.

### Pasos

#### Paso 0.1.1: Crear Repository GitHub
```bash
# En GitHub.com:
1. New Repository → pure24-nutrition-ecommerce
2. Private (recomendado)
3. Initialize with README
4. Clone localmente

git clone https://github.com/[username]/pure24-nutrition-ecommerce.git
cd pure24-nutrition-ecommerce
```

#### Paso 0.1.2: Crear Estructura de Carpetas
```bash
# Usuario ejecuta:
mkdir -p src/{components,layouts,pages,lib}
mkdir -p public/assets/{img,logos}
mkdir -p docs
mkdir -p backend
mkdir -p scripts
mkdir -p .github/workflows

# Estructura resultante:
pure24-nutrition-ecommerce/
├── src/
│   ├── components/        # Componentes Astro/React
│   ├── layouts/           # Plantillas
│   ├── pages/            # Rutas (Astro)
│   │   └── productos/    # [slug].astro (dinámico)
│   └── lib/              # Funciones helpers
├── public/
│   ├── assets/
│   │   ├── img/          # Imágenes optimizadas
│   │   └── logos/
│   ├── robots.txt
│   └── sitemap.xml
├── backend/              # Payload CMS
│   ├── src/
│   ├── collections/
│   └── payload.config.ts
├── scripts/              # Automatización
├── docs/                 # Documentación
├── docker-compose.yml    # Orquestación
├── .env.example          # Variables plantilla
└── package.json
```

#### Paso 0.1.3: Crear .env.example
```env
# .env.example (NO commitear valores reales)

# Frontend - Astro
VITE_CMS_URL=http://localhost:3000
VITE_PUBLIC_GA_ID=G-XXXXXXX

# Backend - Payload CMS
DATABASE_URI=postgresql://postgres:password@postgres:5432/pure24_nutrition
PAYLOAD_SECRET=your-super-secret-key-change-this

# Mercado Pago
VITE_MP_PUBLIC_KEY=APP_USR_[...]
MP_ACCESS_TOKEN=APP_USR_[...]
MP_CLIENT_ID=123456789

# n8n
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=change-me

# Cloudflare
CF_ACCOUNT_ID=hex-string
CF_ZONE_ID=hex-string
CF_API_TOKEN=token-here
VITE_PUBLIC_CF_ZONE_ID=hex-string
```

#### Paso 0.1.4: Crear docker-compose.yml
```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: pure24_nutrition
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

  payload:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      DATABASE_URI: postgresql://postgres:password@postgres:5432/pure24_nutrition
      PAYLOAD_SECRET: your-secret-key
    depends_on:
      postgres:
        condition: service_healthy
    volumes:
      - ./backend:/app

  n8n:
    image: n8nio/n8n:latest
    ports:
      - "5678:5678"
    environment:
      N8N_BASIC_AUTH_ACTIVE: "true"
      N8N_BASIC_AUTH_USER: admin
      N8N_BASIC_AUTH_PASSWORD: change-me
      N8N_HOST: "0.0.0.0"
      WEBHOOK_TUNNEL_URL: "https://[tu-vps-url]/"
    volumes:
      - n8n_data:/home/node/.n8n

volumes:
  postgres_data:
  n8n_data:
```

#### Paso 0.1.5: Crear package.json (Frontend)
```json
{
  "name": "pure24-nutrition-frontend",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "lint": "eslint src/",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "astro": "^4.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@astrojs/react": "^3.0.0",
    "typescript": "^5.0.0"
  }
}
```

#### Paso 0.1.6: Commit a Git
```bash
git add .
git commit -m "FASE 0: Estructura base + environment setup"
git push origin main
```

### Checklist 0.1
- [ ] Repo GitHub creado y clonado
- [ ] Estructura de carpetas creada
- [ ] .env.example configurado
- [ ] docker-compose.yml listo
- [ ] package.json creado
- [ ] Primer commit hecho
- [ ] Repo sincronizado con GitHub

**Tiempo:** 15 min
**Status:** ⏳ Pendiente
**Próximo paso:** 0.2 - Validar Datos de Entrada

---

## 0.2 - Validar Datos de Entrada

### Objetivo
Asegurar que toda la información requerida está disponible y correctamente formateada.

### Pasos

#### Paso 0.2.1: Recopilar Datos de Productos
Usuario debe proporcionar CSV o JSON con estructura:

```csv
SKU,Nombre,Precio,Stock,GTIN13,Descripción,ImageURL
P24-OMEGA3-001,OMEGA 3 + ADEK 90 CAPS,17990,45,5901515018197,Suplemento de alta calidad...,https://example.com/img1.jpg
P24-MAG-002,MAGNESIO PREMIUM 90 CAPS,12990,32,5901515018204,Magnesio de absorción rápida...,https://example.com/img2.jpg
```

**Validaciones:**
- [ ] SKU único (sin duplicados)
- [ ] Precio > 0
- [ ] Stock >= 0
- [ ] GTIN13 es número de 13 dígitos
- [ ] Descripción >= 50 caracteres
- [ ] URL de imagen válida (HTTP/HTTPS)

#### Paso 0.2.2: Recopilar Credenciales
Usuario proporciona en documento seguro (NO en chat):

```
MERCADO PAGO:
  Public Key: [APP_...]
  Access Token: [APP_USR_...]
  Client ID: [número]

GOOGLE GA4:
  Property ID: [número]
  Measurement ID: G-[...]
  API Secret: [...]

CLOUDFLARE:
  Account ID: [...]
  Zone ID: (para pure24nutrition.cl)
  API Token: [...]

INFORMACIÓN NEGOCIO:
  Nombre: Pure 24 Nutrition
  Dirección exacta: Jorge Montt 934, Punta Arenas
  Teléfono: +56 9 7134 5988
  Email: info@pure24nutrition.cl
```

#### Paso 0.2.3: Crear Archivo products.json
```bash
# Usuario convierte CSV a JSON y lo guarda en:
docs/products.json

Formato:
{
  "products": [
    {
      "sku": "P24-OMEGA3-001",
      "name": "OMEGA 3 + ADEK 90 CAPS",
      "price": 17990,
      "stock": 45,
      "gtin13": "5901515018197",
      "description": "Suplemento de alta calidad...",
      "imageUrl": "https://example.com/img1.jpg"
    }
  ]
}
```

### Checklist 0.2
- [ ] CSV de productos con mínimo 30 SKUs
- [ ] Todos los SKUs únicos
- [ ] Precios validados
- [ ] GTIN13 correctos (13 dígitos)
- [ ] Credenciales recopiladas
- [ ] products.json creado
- [ ] products.json validado con jq

**Tiempo:** 30 min
**Status:** ⏳ Pendiente

---

## 0.3 - Validar Access Tokens y Credenciales

### Objetivo
Verificar que todas las credenciales funcionan antes de continuar.

### Pasos

#### Paso 0.3.1: Validar Mercado Pago
```bash
# Test con curl:
curl https://api.mercadopago.com/v1/payments/search?access_token=TU_ACCESS_TOKEN

# Debe retornar JSON sin error 401 (Unauthorized)
# Si retorna 401: Access Token es inválido
```

#### Paso 0.3.2: Validar Google GA4
```
1. Ir a: https://analytics.google.com
2. Admin → Propiedades
3. Verificar que Measurement ID existe
4. Copiar exactamente: G-XXXXXXX
5. Guardar en .env como: VITE_PUBLIC_GA_ID
```

#### Paso 0.3.3: Validar Cloudflare
```bash
# Test API Token:
curl -X GET "https://api.cloudflare.com/client/v4/user/tokens/verify" \
  -H "Authorization: Bearer TU_API_TOKEN" \
  -H "Content-Type: application/json"

# Debe retornar: {"success": true}
```

#### Paso 0.3.4: Crear archivo .env (local)
```bash
# .env (LOCAL - NO commitear a git)
# Copiar .env.example y llenar con valores reales

VITE_CMS_URL=http://localhost:3000
VITE_PUBLIC_GA_ID=G-XXXXXXX
DATABASE_URI=postgresql://postgres:password@postgres:5432/pure24_nutrition
VITE_MP_PUBLIC_KEY=APP_USR_[...]
MP_ACCESS_TOKEN=APP_USR_[...]
# ... etc
```

### Checklist 0.3
- [ ] MP Access Token validado (no retorna 401)
- [ ] GA4 Measurement ID copiado exactamente
- [ ] Cloudflare API Token validado
- [ ] .env creado localmente (NOT committed)
- [ ] .env agregado a .gitignore

**Tiempo:** 20 min
**Status:** ⏳ Pendiente

---

## 📍 GATE 0 - Pre-Producción Completa

### Validaciones Requeridas
- [ ] Repo GitHub creado y sincronizado
- [ ] Estructura de carpetas lista
- [ ] .env.example documentado
- [ ] docker-compose.yml funcional
- [ ] products.json con 30+ SKUs validado
- [ ] Todas las credenciales validadas
- [ ] .gitignore configurado

**Si TODOS los checks ✓ → Continuar a FASE 1**

**Tiempo FASE 0 Total:** ~1.5 horas

---

# FASE 1: TECHNICAL SEO

## 1.1 - Crear Design Token System

### Objetivo
Definir sistema de diseño consistente (colores, tipografía, espaciado).

### Pasos

#### Paso 1.1.1: Definir Design Tokens (Usuario)
Usuario debe proporcionar o Claude define defaults para nutrición:

```json
{
  "colors": {
    "primary": "#2563EB",          // Azul (confianza, ciencia)
    "secondary": "#10B981",        // Verde (salud, crecimiento)
    "neutral_dark": "#1F2937",     // Gris oscuro
    "neutral_light": "#F3F4F6",    // Gris claro
    "success": "#10B981",
    "error": "#EF4444",
    "warning": "#F59E0B"
  },
  "typography": {
    "display_font": "Inter, sans-serif",
    "body_font": "Inter, sans-serif",
    "heading_weights": [600, 700]
  },
  "spacing": {
    "base": 4,                     // 4px
    "xs": 8,
    "sm": 12,
    "md": 16,
    "lg": 24,
    "xl": 32,
    "2xl": 48
  },
  "border_radius": {
    "sm": "4px",
    "md": "8px",
    "lg": "12px",
    "full": "9999px"
  },
  "shadows": {
    "sm": "0 1px 2px 0 rgba(0,0,0,0.05)",
    "md": "0 4px 6px -1px rgba(0,0,0,0.1)",
    "lg": "0 10px 15px -3px rgba(0,0,0,0.1)"
  }
}
```

#### Paso 1.1.2: Crear docs/05_design_tokens.json
```bash
# Opus crea el archivo con tokens validados
# Validar JSON:
jq . < docs/05_design_tokens.json

# Debe retornar JSON sin errores
```

#### Paso 1.1.3: Crear componente CSS
```css
/* src/styles/tokens.css */
:root {
  --color-primary: #2563EB;
  --color-secondary: #10B981;
  --color-neutral-dark: #1F2937;
  --color-neutral-light: #F3F4F6;

  --spacing-xs: 8px;
  --spacing-sm: 12px;
  --spacing-md: 16px;
  --spacing-lg: 24px;

  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;

  --shadow-md: 0 4px 6px -1px rgba(0,0,0,0.1);
}

body {
  font-family: 'Inter', sans-serif;
  color: var(--color-neutral-dark);
  background: var(--color-neutral-light);
}
```

### Checklist 1.1
- [ ] Design tokens definidos en JSON
- [ ] JSON validado sin errores
- [ ] CSS custom properties creadas
- [ ] Colores de marca definidos
- [ ] Tipografía seleccionada (Google Fonts)
- [ ] Espaciado consistente (base 4px)

**Tiempo:** 45 min
**Status:** ⏳ Pendiente

---

## 1.2 - Crear HTML Semántico Base

### Objetivo
Crear estructura HTML sem

ántica sin divitis, con correcta jerarquía de headings.

### Pasos

#### Paso 1.2.1: Crear Plantilla Base Astro
```astro
<!-- src/layouts/ProductLayout.astro -->
---
interface Props {
  title: string
  description: string
}

const { title, description } = Astro.props
---

<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{title} | Pure 24 Nutrition</title>
    <meta name="description" content={description} />
    <link rel="canonical" href={Astro.url.href} />
    <link rel="stylesheet" href="/styles/tokens.css" />
  </head>

  <body>
    <nav role="navigation">
      <a href="/">Pure 24 Nutrition</a>
      <ul>
        <li><a href="/productos">Catálogo</a></li>
        <li><a href="/contacto">Contacto</a></li>
      </ul>
    </nav>

    <main>
      <article>
        <header>
          <h1>{title}</h1>
        </header>
        <slot />
      </article>
    </main>

    <footer>
      <address>
        Pure 24 Nutrition<br />
        Jorge Montt 934<br />
        +56 9 7134 5988<br />
        info@pure24nutrition.cl
      </address>
    </footer>
  </body>
</html>
```

#### Paso 1.2.2: Crear Página de Producto
```astro
<!-- src/pages/productos/[slug].astro -->
---
import ProductLayout from "@/layouts/ProductLayout.astro"

interface Product {
  slug: string
  name: string
  description: string
  price: number
  image: string
}

// Mock data (posteriormente vendrá de Payload CMS)
const products: Product[] = [
  {
    slug: "omega3-adek",
    name: "OMEGA 3 + ADEK 90 CAPS",
    description: "Suplemento de recuperación con ácidos grasos omega 3...",
    price: 17990,
    image: "/assets/img/omega3.jpg"
  }
]

export async function getStaticPaths() {
  return products.map(product => ({
    params: { slug: product.slug },
    props: { product }
  }))
}

const { product } = Astro.props
---

<ProductLayout title={product.name} description={product.description}>
  <header>
    <h1>{product.name}</h1>
    <img
      src={product.image}
      alt="Imagen del producto: {product.name} - Suplemento premium de nutrición"
      loading="lazy"
    />
  </header>

  <section id="specs">
    <h2>Especificaciones Técnicas</h2>
    <dl>
      <dt>Presentación</dt>
      <dd>90 cápsulas</dd>

      <dt>Dosis</dt>
      <dd>2 cápsulas diarias</dd>

      <dt>Certificación</dt>
      <dd>GMP, Libre de OGM</dd>
    </dl>
  </section>

  <section id="benefits">
    <h2>Beneficios Principales</h2>
    <ul>
      <li><strong>Recuperación:</strong> Acelera recuperación post-entrenamiento</li>
      <li><strong>Cardiovascular:</strong> Soporta salud del corazón</li>
      <li><strong>Inflamación:</strong> Reduce inflamación articular</li>
    </ul>
  </section>

  <section id="faq">
    <h2>Preguntas Frecuentes</h2>
    <details>
      <summary>¿Cuál es la biodisponibilidad?</summary>
      <p>La biodisponibilidad es de 99.2% medida según estándares internacionales.</p>
    </details>

    <details>
      <summary>¿Es apto para veganos?</summary>
      <p>No, contiene derivados de pescado.</p>
    </details>
  </section>

  <section id="buy">
    <h2>Comprar Ahora</h2>
    <button class="btn-primary" onclick="window.location.href='/checkout?sku=P24-OMEGA3-001'">
      Comprar - ${product.price} CLP
    </button>
  </section>
</ProductLayout>
```

#### Paso 1.2.3: Validar HTML Semántico
```bash
# Validar con W3C Validator:
# 1. Ir a: https://validator.w3.org/
# 2. Pegar HTML
# 3. Debe mostrar: "Document checking completed. No errors or warnings"

# O con NPM (si está instalado):
npm install --save-dev html-validator-cli
npm run validate
```

#### Paso 1.2.4: Verificar Jerarquía de Headings
```bash
# Debe seguir: H1 → H2 → H3 (sin saltos)
# ✅ Correcto:
  <h1>Producto</h1>
  <h2>Especificaciones</h2>
  <h3>Dosis</h3>

# ❌ Incorrecto:
  <h1>Producto</h1>
  <h3>Salto de H2!</h3>  ← ERROR
```

### Checklist 1.2
- [ ] ProductLayout.astro creado
- [ ] Página de producto creada
- [ ] HTML validado (W3C sin errores)
- [ ] Un solo H1 por página
- [ ] Jerarquía H1 → H2 → H3 sin saltos
- [ ] Todos <img> con alt descriptivo (>5 palabras)
- [ ] <article>, <section>, <nav>, <footer> usados
- [ ] Commit hecho

**Tiempo:** 30 min
**Status:** ⏳ Pendiente

---

## 1.3 - Implementar Core Web Vitals (Performance)

### Objetivo
Optimizar para TTFB <50ms, LCP <2.5s, CLS <0.1.

### Pasos

#### Paso 1.3.1: Configurar Astro para SSG
```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config'

export default defineConfig({
  output: 'static',  // ← SSG (Static Site Generation)
  integrations: [],
  vite: {
    build: {
      minify: 'terser',
      cssCodeSplit: true
    }
  }
})
```

#### Paso 1.3.2: Optimizar Imágenes
```bash
# Instalar herramientas:
npm install --save-dev sharp imagemin imagemin-webp

# Script para convertir a WebP:
# scripts/optimize-images.js
const sharp = require('sharp')
const fs = require('fs')
const path = require('path')

const imgDir = 'public/assets/img'

fs.readdirSync(imgDir).forEach(file => {
  if (file.match(/\.(jpg|jpeg|png)$/i)) {
    const input = path.join(imgDir, file)
    const output = path.join(imgDir, file.replace(/\.\w+$/, '.webp'))

    sharp(input)
      .webp({ quality: 80 })
      .toFile(output)
      .then(() => console.log(`✓ ${output}`))
  }
})

# Ejecutar:
node scripts/optimize-images.js
```

#### Paso 1.3.3: Lazy Loading en Imágenes
```html
<!-- HTML con lazy loading -->
<img
  src="/assets/img/omega3.webp"
  alt="Producto Omega 3"
  loading="lazy"
  width="1200"
  height="800"
/>
```

#### Paso 1.3.4: Minificar CSS y JS
```bash
# Astro ya minifica automáticamente en build
npm run build

# Verificar que dist/ tiene archivos minificados
ls -lh dist/*.js dist/*.css
```

#### Paso 1.3.5: Ejecutar Lighthouse Audit
```bash
# Instalar si no lo tienes:
npm install --save-dev lighthouse

# Ejecutar server de desarrollo:
npm run dev

# En otra terminal, ejecutar Lighthouse:
npx lighthouse http://localhost:3000 \
  --view \
  --output-path ./lighthouse-report.html

# Debe mostrar:
# Performance: 95+
# SEO: 100
# Best Practices: 95+
# Accessibility: 95+
```

#### Paso 1.3.6: Verificar TTFB en Producción
```bash
# Después de deplegar en Cloudflare:
curl -i https://pure24nutrition.cl

# Buscar header: Server-Timing
# Server-Timing: cf-cache-status=HIT, cf-ray=XXX
# TTFB debe ser <50ms
```

### Checklist 1.3
- [ ] Astro configurado para SSG
- [ ] Imágenes convertidas a WebP
- [ ] Lazy loading en <img>
- [ ] CSS minificado
- [ ] JS minificado
- [ ] Lighthouse Performance ≥95
- [ ] Lighthouse SEO = 100
- [ ] TTFB <50ms verificado

**Tiempo:** 60 min
**Status:** ⏳ Pendiente

---

## 1.4 - Configurar Brotli Compression

### Objetivo
Activar compresión Brotli en Cloudflare para reducir tamaño de assets.

### Pasos

#### Paso 1.4.1: Verificar Brotli en Cloudflare
```bash
# En Cloudflare Dashboard:
# 1. Ir a Speed → Optimization
# 2. Brotli compression: ON
# 3. Auto minify: ON
```

#### Paso 1.4.2: Configurar Headers
```bash
# Crear archivo _headers en public/
# public/_headers

/*
  Cache-Control: public, max-age=31536000, immutable
  Accept-Encoding: gzip, deflate, br

/index.html
  Cache-Control: public, max-age=300
```

#### Paso 1.4.3: Test Compresión
```bash
# Test con Brotli:
curl -i -H "Accept-Encoding: br" https://pure24nutrition.cl

# Debe retornar:
# Content-Encoding: br

# Test con gzip:
curl -i -H "Accept-Encoding: gzip" https://pure24nutrition.cl

# Debe retornar:
# Content-Encoding: gzip
```

### Checklist 1.4
- [ ] Brotli habilitado en Cloudflare
- [ ] Auto minify activado
- [ ] Headers configurados
- [ ] Test Brotli ejecutado (Content-Encoding: br)
- [ ] Test gzip ejecutado (Content-Encoding: gzip)

**Tiempo:** 20 min
**Status:** ⏳ Pendiente

---

## 📍 GATE 1: Technical SEO Completo

### Validaciones Requeridas
- [ ] Design Tokens definidos en JSON
- [ ] HTML semántico sin divitis
- [ ] Lighthouse Performance ≥95
- [ ] Lighthouse SEO = 100
- [ ] TTFB medido <50ms en Cloudflare Analytics
- [ ] Brotli compression activo
- [ ] Imágenes optimizadas a WebP
- [ ] Lazy loading en imágenes

**Si TODOS los checks ✓ → Continuar a FASE 1.2 (Message Lab)**

**Tiempo FASE 1 Total:** ~2-3 horas

---

# FASE 1.2: MESSAGE LAB

## Objetivo
Definir y validar el mensaje de marca usando frameworks de marketing.

### ⚠️ ESTE PASO REQUIERE INFORMACIÓN DEL USUARIO

Opus necesita que el usuario responda 5 preguntas clave sobre el negocio.

## Paso 1.2.1: Sesión de Claridad Estratégica (30 min)

### Preguntas para el Usuario

#### P1: ¿Cuál es el resultado específico que entregas?
```
No el servicio, sino la TRANSFORMACIÓN del cliente.

Ejemplo (malo): "Vendemos suplementos de recuperación"
Ejemplo (bueno): "Permitimos que atletas recuperen su cuerpo óptimo
                   en 24-48 horas en lugar de 72-96 horas,
                   extendiendo su carrera deportiva y maximizando su rendimiento"

RESPUESTA DEL USUARIO:
_________________________________________________________
_________________________________________________________
```

#### P2: ¿Quién es tu cliente ideal?
```
Describe:
- Edad, profesión, deporte
- Qué miedos tiene (objeciones)
- Qué desea (aspiración)
- Dónde está ahora vs. dónde quiere estar

RESPUESTA DEL USUARIO:
_________________________________________________________
_________________________________________________________
```

#### P3: ¿Cuáles son tus 3 diferenciadores reales?
```
No "calidad" o "precio" (genérico).
Diferenciadores VERIFICABLES: certificaciones, tiempo, metodología, ubicación.

Ejemplo: "Somos los únicos en Punta Arenas con licencia GMP +
          validación científica en cada lote"

1. _______________________________________________
2. _______________________________________________
3. _______________________________________________
```

#### P4: ¿Cuál es la objeción principal que frena la conversión?
```
El cliente ideal QUIERE comprarte pero tiene una barrera.

Ejemplo: "No saben si realmente funcionan o si es solo marketing"

RESPUESTA:
_________________________________________________________
```

#### P5: ¿Tienes casos de éxito con resultados medibles?
```
Clientes reales con transformaciones específicas.

Caso 1:
- Cliente: [Nombre/Tipo]
- Antes: [Situación inicial]
- Después: [Resultado]
- Números: [Metrics específicas]

Caso 2:
...

Caso 3:
...
```

### Entregable: docs/02_message_lab_output.md

Una vez que usuario responde, Opus crea documento con:

```markdown
# MESSAGE LAB OUTPUT

## 1. CLARIDAD ESTRATÉGICA

### Resultado Específico
[Respuesta P1 procesada]

### Cliente Ideal
[Respuesta P2 procesada]

### 3 Diferenciadores
[Respuesta P3 procesada]

### Objeción Principal
[Respuesta P4 procesada]

### Casos de Éxito
[Respuesta P5 procesada]

## 2. FRAMEWORKS APLICADOS

### AIDA (Attention, Interest, Desire, Action)

**Hero Section:**
- Headline: [headline que captura atención]
- Subheadline: [propuesta de valor en <10 palabras]
- CTA: [botón con urgencia/beneficio claro]

### PAS (Problem, Agitation, Solution)

**Problem:** [Necesidad cliente]
**Agitation:** [Pain points amplificados]
**Solution:** [Cómo lo resuelves]

### StoryBrand

**Hero:** [Quién es cliente]
**Problem:** [Qué enfrenta]
**Guide:** [Quién lo ayuda (tú)]
**Plan:** [Pasos específicos]
**Transformation:** [Resultado final]

### BAB (Before, After, Bridge)

**Case 1:**
- Before: [Estado inicial]
- After: [Transformación]
- Bridge: [Qué cambió]

## 3. COPY REFINADO POR SECCIÓN

### Hero (AIDA)
[Copy optimizado para captar atención]

### Value Proposition (PAS)
[Copy optimizado para resolver problema]

### Foundation (StoryBrand)
[Copy humanizado, cliente-céntrico]

### Social Proof
[Testimonios con contexto]

### CTA Section
[Copy con urgencia/beneficio claro]

## 4. VALIDACIÓN CON CLIENTE

- [ ] Hero aprobado por cliente
- [ ] Value Proposition aprobado
- [ ] Foundation aprobado
- [ ] Social Proof aprobado
- [ ] CTA aprobado
- Aprobado por: [nombre cliente]
- Fecha: [fecha]
```

### Checklist 1.2.1
- [ ] Usuario responde 5 preguntas clave
- [ ] Respuestas documentadas
- [ ] Opus estructura respuestas
- [ ] docs/02_message_lab_output.md creado
- [ ] Cliente valida copy propuesto
- [ ] Todos los frameworks aplicados

**Tiempo:** 3.5 horas (30 min Q&A + 3 horas estructura)
**Status:** ⏳ Pendiente

---

## 📍 GATE 1.2: Message Lab Completo

### Validaciones Requeridas
- [ ] 5 preguntas respondidas completamente
- [ ] Resultado específico articulado
- [ ] Cliente ideal definido
- [ ] 3 diferenciadores documentados
- [ ] Objeción principal identificada
- [ ] 2-3 casos de éxito con números
- [ ] AIDA framework aplicado
- [ ] PAS framework aplicado
- [ ] StoryBrand framework aplicado
- [ ] BAB framework aplicado
- [ ] 100% aprobación de cliente en copy
- [ ] docs/02_message_lab_output.md completado

**Si TODOS los checks ✓ → Continuar a FASE 2**

**Tiempo FASE 1.2 Total:** ~3.5 horas

---

# FASE 2: GEO & AI OPTIMIZATION

## 2.1 - Crear JSON-LD Dinámico (Product Schema)

### Objetivo
Inyectar datos estructurados para que Google entienda los productos.

### Pasos

#### Paso 2.1.1: Crear Componente ProductSchema.astro
```astro
<!-- src/components/ProductSchema.astro -->
---
interface Props {
  sku: string
  name: string
  description: string
  price: number
  currency: string
  image: string
  gtin13: string
  rating?: number
  reviewCount?: number
  inStock: boolean
}

const { sku, name, description, price, currency, image, gtin13, rating, reviewCount, inStock } = Astro.props

const schema = {
  "@context": "https://schema.org/",
  "@type": "Product",
  "name": name,
  "image": [image],
  "description": description,
  "sku": sku,
  "gtin13": gtin13,
  "mpn": sku,
  "brand": {
    "@type": "Brand",
    "name": "Pure 24 Nutrition"
  },
  "offers": {
    "@type": "Offer",
    "url": `https://pure24nutrition.cl/productos/${sku.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
    "priceCurrency": currency,
    "price": price.toString(),
    "priceValidUntil": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    "availability": inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    "shippingDetails": {
      "@type": "OfferShippingDetails",
      "shippingRate": {
        "@type": "MonetaryAmount",
        "currency": currency,
        "value": "3500"
      },
      "shippingDestination": {
        "@type": "DefinedRegion",
        "addressCountry": "CL"
      },
      "deliveryTime": {
        "@type": "ShippingDeliveryTime",
        "handlingTime": {
          "@type": "QuantitativeValue",
          "minValue": 0,
          "maxValue": 1,
          "unitCode": "DAY"
        },
        "transitTime": {
          "@type": "QuantitativeValue",
          "minValue": 1,
          "maxValue": 3,
          "unitCode": "DAY"
        }
      }
    }
  },
  ...(rating && reviewCount && {
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": rating.toString(),
      "reviewCount": reviewCount.toString()
    }
  })
}
---

<script type="application/ld+json" set:html={JSON.stringify(schema)} />
```

#### Paso 2.1.2: Usar Componente en Página de Producto
```astro
<!-- En src/pages/productos/[slug].astro -->
---
import ProductSchema from '@/components/ProductSchema.astro'

const { product } = Astro.props
---

<ProductLayout>
  <ProductSchema
    sku={product.sku}
    name={product.name}
    description={product.description}
    price={product.price}
    currency="CLP"
    image={product.image}
    gtin13={product.gtin13}
    inStock={product.stock > 0}
  />

  {/* ... resto del contenido */}
</ProductLayout>
```

#### Paso 2.1.3: Validar JSON-LD
```bash
# Test con Google Rich Results:
# 1. Ir a: https://search.google.com/test/rich-results
# 2. Copiar URL: https://pure24nutrition.cl/productos/omega3
# 3. Debe mostrar: "Product" schema sin errores

# O validar localmente:
npm install --save-dev jsonld

node -e "
const jsonld = require('jsonld');
const schema = {...}; // tu schema
jsonld.normalize(schema, (err, normalized) => {
  if (err) console.error('ERROR:', err);
  else console.log('✓ Valid');
});
"
```

### Checklist 2.1
- [ ] ProductSchema.astro creado
- [ ] Componente usado en páginas producto
- [ ] JSON-LD sin errores en Google Rich Results Test
- [ ] Todos los productos tienen schema
- [ ] GTIN13 incluido en schema
- [ ] Precios correctos
- [ ] Stock status correcto

**Tiempo:** 45 min
**Status:** ⏳ Pendiente

---

## 2.2 - Crear FAQ Schema

### Objetivo
Inyectar preguntas frecuentes para que aparezcan en featured snippets de Google.

### Pasos

#### Paso 2.2.1: Crear Componente FAQSchema.astro
```astro
<!-- src/components/FAQSchema.astro -->
---
interface Question {
  q: string
  a: string
}

interface Props {
  questions: Question[]
}

const { questions } = Astro.props

const schema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": questions.map(item => ({
    "@type": "Question",
    "name": item.q,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": item.a
    }
  }))
}
---

<div id="faq">
  <h2>Preguntas Frecuentes</h2>
  {questions.map(item => (
    <details>
      <summary>{item.q}</summary>
      <p>{item.a}</p>
    </details>
  ))}
</div>

<script type="application/ld+json" set:html={JSON.stringify(schema)} />
```

#### Paso 2.2.2: Agregar FAQ a Página de Producto
```astro
<!-- En src/pages/productos/[slug].astro -->
---
import FAQSchema from '@/components/FAQSchema.astro'

const faqs = [
  {
    q: "¿Cuál es la biodisponibilidad del producto?",
    a: "La biodisponibilidad es de 99.2% medida según estándares internacionales de absorción."
  },
  {
    q: "¿Es apto para veganos?",
    a: "No, contiene derivados de pescado de agua fría de Noruega."
  },
  {
    q: "¿Cuántas dosis por día se recomiendan?",
    a: "Recomendamos 2 cápsulas diarias post-entrenamiento o con el desayuno."
  }
]
---

<FAQSchema questions={faqs} />
```

#### Paso 2.2.3: Validar FAQ Schema
```bash
# Test con Google Rich Results:
# 1. Ir a: https://search.google.com/test/rich-results
# 2. URL: https://pure24nutrition.cl/productos/omega3
# 3. Debe mostrar: "FAQ Page" schema sin errores
```

### Checklist 2.2
- [ ] FAQSchema.astro creado
- [ ] Mínimo 3 preguntas por producto
- [ ] Preguntas en formato: "¿Cómo...?" "¿Qué...?" "¿Cuál...?"
- [ ] Respuestas: máx 40 palabras
- [ ] FAQ Schema validado sin errores
- [ ] Palabras clave en <strong> dentro de respuestas

**Tiempo:** 45 min
**Status:** ⏳ Pendiente

---

## 2.3 - Crear Information Gain (Datos Únicos)

### Objetivo
Inyectar contenido original que no existe en competitors.

### Pasos

#### Paso 2.3.1: Crear Tabla Comparativa
```astro
<!-- En sección de producto -->
<section id="comparison">
  <h2>Cómo se Compara Pure 24</h2>
  <table>
    <thead>
      <tr>
        <th>Parámetro</th>
        <th>Pure 24 Nutrition</th>
        <th>Competencia A</th>
        <th>Competencia B</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>EPA mg/cápsula</td>
        <td><strong>180 mg</strong></td>
        <td>120 mg</td>
        <td>150 mg</td>
      </tr>
      <tr>
        <td>DHA mg/cápsula</td>
        <td><strong>120 mg</strong></td>
        <td>80 mg</td>
        <td>100 mg</td>
      </tr>
      <tr>
        <td>Pureza</td>
        <td><strong>99.2%</strong></td>
        <td>97%</td>
        <td>98%</td>
      </tr>
      <tr>
        <td>Certificación GMP</td>
        <td><strong>✓ Sí</strong></td>
        <td>✗ No</td>
        <td>✓ Sí</td>
      </tr>
      <tr>
        <td>Precio/cápsula</td>
        <td><strong>$200</strong></td>
        <td>$183</td>
        <td>$210</td>
      </tr>
    </tbody>
  </table>
</section>
```

#### Paso 2.3.2: Crear Calculadora JavaScript
```javascript
// src/lib/dosage-calculator.js
export function calculateDose(bodyWeightKg: number): number {
  // Fórmula: 2mg de omega-3 por kg de peso corporal
  const dosePerKg = 2
  const totalDose = bodyWeightKg * dosePerKg
  const capsulesPerDose = 300 // mg por cápsula
  return Math.ceil(totalDose / capsulesPerDose)
}

export function calculateDuration(capsulesPerDay: number, totalCapsules: number): number {
  return Math.ceil(totalCapsules / capsulesPerDay)
}
```

```astro
<!-- En página de producto -->
<section id="calculator">
  <h2>¿Cuántas Cápsulas Necesitas?</h2>
  <div class="calculator">
    <label>
      Tu peso corporal (kg):
      <input type="number" id="weight" min="40" max="200" value="75" />
    </label>
    <div id="result">
      <p>Recomendamos: <strong id="dosage">2</strong> cápsulas diarias</p>
      <p>Duración por frasco: <strong id="duration">45</strong> días</p>
    </div>
  </div>
</section>

<script>
  import { calculateDose, calculateDuration } from '@/lib/dosage-calculator'

  document.getElementById('weight').addEventListener('input', (e) => {
    const weight = parseFloat(e.target.value)
    const dose = calculateDose(weight)
    const duration = calculateDuration(dose, 90)
    document.getElementById('dosage').textContent = dose
    document.getElementById('duration').textContent = duration
  })
</script>
```

#### Paso 2.3.3: Crear Archivo JSON con Datos Puros
```json
// public/data/productos.json
{
  "products": [
    {
      "sku": "P24-OMEGA3-001",
      "name": "OMEGA 3 + ADEK 90 CAPS",
      "specifications": {
        "epaMg": 180,
        "dhaMg": 120,
        "purity": 99.2,
        "gmp_certified": true,
        "source": "Norwegian Cold Water Fish",
        "capsules_per_bottle": 90,
        "recommended_daily_dose": 2
      },
      "certifications": [
        "GMP (Good Manufacturing Practice)",
        "ISO 9001:2015",
        "Libre de OGM",
        "NSF Certified"
      ],
      "lab_test": {
        "date": "2026-02-15",
        "lab": "SGS Chile",
        "results_url": "https://example.com/lab-report-omega3.pdf"
      }
    }
  ]
}
```

### Checklist 2.3
- [ ] Tabla comparativa creada para cada producto
- [ ] Datos comparativos verificados
- [ ] Calculadora JavaScript funcional
- [ ] JSON con datos puros creado
- [ ] Datos en JSON son únicos vs competitors
- [ ] Laboratorios/certificados linkeados

**Tiempo:** 60 min
**Status:** ⏳ Pendiente

---

## 2.4 - Crear Quote-Bait (Micro-Respuestas)

### Objetivo
Formatear respuestas para que sean citables por ChatGPT/Perplexity/Google AI.

### Pasos

#### Paso 2.4.1: Estructurar Quote-Bait
```html
<!-- En cada sección de producto -->
<section id="quote-bait-benefits">
  <h2>¿Cuáles son los beneficios específicos de la fórmula?</h2>
  <ul>
    <li>
      <strong>Recuperación Acelerada:</strong>
      La combinación EPA/DHA (180mg/120mg) acelera
      la recuperación post-entrenamiento en 24-48 horas
      vs el promedio de 72-96 horas sin suplementación.
    </li>
    <li>
      <strong>Protección Cardiovascular:</strong>
      Estudios muestran que 300mg diarios de omega-3
      reduce triglicéridos en 20-30% en 8 semanas de uso consistente.
    </li>
    <li>
      <strong>Anti-Inflamatorio Natural:</strong>
      Reduce inflamación articular sin efectos secundarios,
      permitiendo entrenar con más consistencia.
    </li>
  </ul>
</section>

<section id="quote-bait-safety">
  <h2>¿Qué garantías de seguridad tiene este producto?</h2>
  <ul>
    <li>
      <strong>Certificación GMP:</strong>
      Fabricado en laboratorio GMP-certificado con controles
      de calidad en cada lote de producción.
    </li>
    <li>
      <strong>Tercera Evaluación:</strong>
      Cada lote es evaluado por laboratorio independiente (SGS)
      para pureza y potencia antes de liberación.
    </li>
    <li>
      <strong>Sin Riesgos Identificados:</strong>
      Más de 500 clientes con uso consistente, sin reportes
      de efectos adversos en 18 meses de operación.
    </li>
  </ul>
</section>
```

#### Paso 2.4.2: Validar Quote-Bait
```bash
# Validaciones:
# ✅ Cada <li> tiene <strong>término:</strong>
# ✅ Cada respuesta <50 palabras
# ✅ Datos son específicos y verificables
# ✅ Incluye números cuando aplica
# ✅ Fuente o autoridad mencionada
```

### Checklist 2.4
- [ ] Quote-Bait estructurado para 3+ secciones
- [ ] Máx 3 puntos por sección
- [ ] Cada punto: <50 palabras
- [ ] Usar <strong> para términos clave
- [ ] Usar listas <ul> no párrafos
- [ ] Datos verificables y citables
- [ ] Números específicos incluidos

**Tiempo:** 30 min
**Status:** ⏳ Pendiente

---

## 📍 GATE 2: GEO & AI Completo

### Validaciones Requeridas
- [ ] JSON-LD Product schema sin errores (Google Rich Results Test)
- [ ] FAQ Schema inyectado en todas las páginas
- [ ] Information Gain visible (tablas, calculadora, datos)
- [ ] Quote-Bait formateado (H2 + listas + strong)
- [ ] Todo validable y citable

**Si TODOS los checks ✓ → Continuar a FASE 3**

**Tiempo FASE 2 Total:** ~2-3 horas

---

# FASE 3: LOCAL SEO

## 3.1 - Sincronizar NAP Byte-por-Byte

### Objetivo
Exactitud absoluta de datos locales (Name, Address, Phone).

### Pasos

#### Paso 3.1.1: Obtener NAP de Google Business Profile
```
1. Ir a: https://business.google.com
2. Seleccionar "Pure 24 Nutrition"
3. Copiar EXACTAMENTE:
   - Nombre: Pure 24 Nutrition
   - Dirección: Jorge Montt 934, Punta Arenas, Chile
   - Teléfono: +56 9 7134 5988
   - Horas: [si aplica]
   - Coordenadas GPS: -53.1627°, -70.9081°

⚠️ IMPORTANTE: Copiar BYTE-POR-BYTE (sin cambios)
```

#### Paso 3.1.2: Crear Componente LocalBusinessSchema
```astro
<!-- src/components/LocalBusinessSchema.astro -->
---
const schema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Pure 24 Nutrition",
  "image": "https://pure24nutrition.cl/logo.png",
  "description": "Suplementos de nutrición premium para atletas",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Jorge Montt 934",
    "addressLocality": "Punta Arenas",
    "addressRegion": "Magallanes",
    "postalCode": "6200000",
    "addressCountry": "CL"
  },
  "telephone": "+56 9 7134 5988",
  "email": "info@pure24nutrition.cl",
  "url": "https://pure24nutrition.cl",
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "-53.16270",
    "longitude": "-70.90810"
  },
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": "Monday",
      "opens": "09:00",
      "closes": "18:00"
    },
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": "Tuesday",
      "opens": "09:00",
      "closes": "18:00"
    }
    // ... resto de días
  ]
}
---

<script type="application/ld+json" set:html={JSON.stringify(schema)} />
```

#### Paso 3.1.3: Inyectar en Todas las Páginas
```astro
<!-- En layout/ProductLayout.astro y MainLayout.astro -->
---
import LocalBusinessSchema from '@/components/LocalBusinessSchema.astro'
---

<LocalBusinessSchema />
```

#### Paso 3.1.4: Crear Validador NAP
```javascript
// scripts/validate-nap.js
const fs = require('fs')
const path = require('path')

const EXPECTED_NAP = {
  name: "Pure 24 Nutrition",
  address: "Jorge Montt 934, Punta Arenas, Chile",
  phone: "+56 9 7134 5988"
}

function validateFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8')

  const hasName = content.includes(EXPECTED_NAP.name)
  const hasAddress = content.includes("Jorge Montt 934")
  const hasPhone = content.includes("+56 9 7134 5988")

  return { hasName, hasAddress, hasPhone }
}

// Validar todas las páginas HTML en dist/
const distPath = path.join(__dirname, '../dist')
const files = fs.readdirSync(distPath, { recursive: true })
  .filter(f => f.endsWith('.html'))

let allPassed = true
files.forEach(file => {
  const result = validateFile(path.join(distPath, file))
  if (!result.hasName || !result.hasAddress || !result.hasPhone) {
    console.log(`❌ ${file}: FAILED`)
    allPassed = false
  }
})

if (allPassed) {
  console.log(`✅ NAP validado en ${files.length} páginas`)
} else {
  process.exit(1)
}
```

#### Paso 3.1.5: Ejecutar Validador
```bash
npm run build
node scripts/validate-nap.js

# Debe output:
# ✅ NAP validado en 40 páginas
```

### Checklist 3.1
- [ ] NAP copiado EXACTAMENTE de Google Business Profile
- [ ] LocalBusinessSchema creado
- [ ] Inyectado en todas las páginas
- [ ] Validador NAP creado y ejecutado
- [ ] Todas las páginas pasan validación
- [ ] Google Rich Results Test muestra LocalBusiness sin errores

**Tiempo:** 30 min
**Status:** ⏳ Pendiente

---

## 3.2 - Inyectar EXIF en Imágenes

### Objetivo
Geolocalizar automáticamente assets con coordenadas del negocio.

### Pasos

#### Paso 3.2.1: Instalar exiftool
```bash
# macOS
brew install exiftool

# Ubuntu/Debian
sudo apt-get install libimage-exiftool-perl

# Windows (usar chocolatey)
choco install exiftool
```

#### Paso 3.2.2: Crear Script inject-exif.sh
```bash
#!/bin/bash
# scripts/inject-exif.sh

LANDMARK_LAT="-53.16270"
LANDMARK_LNG="-70.90810"
LANDMARK_NAME="Pure 24 Nutrition, Punta Arenas"

echo "Inyectando EXIF a imágenes..."

for img in public/assets/img/*.{jpg,jpeg,webp,png}; do
  if [ -f "$img" ]; then
    echo "Procesando: $img"

    exiftool \
      -GPSLatitude="$LANDMARK_LAT" \
      -GPSLongitude="$LANDMARK_LNG" \
      -GPSLatitudeRef="S" \
      -GPSLongitudeRef="W" \
      -Keywords="$LANDMARK_NAME" \
      -ImageDescription="Pure 24 Nutrition - Suplementos premium" \
      -Creator="Pure 24 Nutrition" \
      -Copyright="© Pure 24 Nutrition 2026" \
      "$img"
  fi
done

echo "✅ EXIF inyectado en todas las imágenes"
```

#### Paso 3.2.3: Ejecutar Script
```bash
chmod +x scripts/inject-exif.sh
./scripts/inject-exif.sh
```

#### Paso 3.2.4: Verificar EXIF
```bash
# Verificar que EXIF se inyectó:
exiftool public/assets/img/omega3.webp | grep -i gps

# Debe mostrar:
# GPS Latitude                : 53 deg 9' 45.72" S
# GPS Longitude               : 70 deg 54' 29.16" W
```

### Checklist 3.2
- [ ] exiftool instalado
- [ ] Script inject-exif.sh creado
- [ ] Script ejecutado en todas las imágenes
- [ ] EXIF verificado (GPS visible)
- [ ] Keywords incluyen nombre del negocio
- [ ] Copyright incluido

**Tiempo:** 45 min
**Status:** ⏳ Pendiente

---

## 3.3 - Crear Grafo de Landmarks

### Objetivo
Crear páginas de cobertura geográfica hiperlocal.

### Pasos

#### Paso 3.3.1: Crear Páginas de Cobertura
```astro
<!-- src/pages/cobertura/[barrio].astro -->
---
const barrios = [
  {
    slug: "plaza-de-armas",
    nombre: "Plaza de Armas",
    descripcion: "Centro de Punta Arenas",
    lat: "-53.1631",
    lng: "-70.9099",
    distancia: "1 km",
    tiempo: "15 min"
  },
  {
    slug: "zona-franca",
    nombre: "Zona Franca",
    descripcion: "Centro comercial",
    lat: "-53.1627",
    lng: "-70.8981",
    distancia: "3.5 km",
    tiempo: "25 min"
  },
  {
    slug: "costanera-del-estrecho",
    nombre: "Costanera del Estrecho",
    descripcion: "Sector costero",
    lat: "-53.1601",
    lng: "-70.9156",
    distancia: "2 km",
    tiempo: "18 min"
  },
  {
    slug: "barrio-norte",
    nombre: "Barrio Norte",
    descripcion: "Residencial",
    lat: "-53.1531",
    lng: "-70.9045",
    distancia: "1.2 km",
    tiempo: "12 min"
  },
  {
    slug: "puerto-punta-arenas",
    nombre: "Puerto Punta Arenas",
    descripcion: "Puerto comercial",
    lat: "-53.1639",
    lng: "-70.9245",
    distancia: "2.8 km",
    tiempo: "22 min"
  }
]

export function getStaticPaths() {
  return barrios.map(barrio => ({
    params: { barrio: barrio.slug },
    props: { barrio }
  }))
}

const { barrio } = Astro.props
---

<html lang="es">
  <head>
    <title>Envíos a {barrio.nombre} - Pure 24 Nutrition</title>
    <meta name="description" content="Despachos rápidos a {barrio.nombre} desde Pure 24 Nutrition" />
  </head>
  <body>
    <h1>Cobertura en {barrio.nombre}</h1>

    <section>
      <h2>¿Por Qué Elegir Pure 24 en {barrio.nombre}?</h2>
      <p>
        Disponemos de despachos rápidos desde {barrio.nombre}
        hasta toda el área de Punta Arenas, incluyendo
        Plaza de Armas, Zona Franca, Costanera y Barrio Norte.
      </p>

      <ul>
        <li>Distancia aproximada: <strong>{barrio.distancia}</strong></li>
        <li>Tiempo de envío: <strong>{barrio.tiempo}</strong></li>
        <li>Despacho en <strong>máximo 48 horas</strong></li>
      </ul>
    </section>

    <section>
      <h2>Ubicaciones Cercanas a {barrio.nombre}</h2>
      <ul>
        {barrios.map(b => (
          b.slug !== barrio.slug && (
            <li>
              <a href={`/cobertura/${b.slug}`}>
                {b.nombre} ({b.distancia} desde {barrio.nombre})
              </a>
            </li>
          )
        ))}
      </ul>
    </section>

    <section>
      <h2>Contacta Nuestro Equipo</h2>
      <p>+56 9 7134 5988 • info@pure24nutrition.cl</p>
    </section>
  </body>
</html>
```

#### Paso 3.3.2: Crear Schema GeoCircle
```astro
<!-- Agregar a cada página de cobertura -->
<script type="application/ld+json" set:html={JSON.stringify({
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Pure 24 Nutrition",
  "areaServed": {
    "@type": "GeoCircle",
    "geoMidpoint": {
      "@type": "GeoCoordinates",
      "latitude": "-53.16270",
      "longitude": "-70.90810"
    },
    "geoRadius": "15km"
  }
})} />
```

### Checklist 3.3
- [ ] 5+ páginas de cobertura creadas
- [ ] Cada página con nombre barrio
- [ ] Links internos entre páginas (relevancia)
- [ ] Schema GeoCircle inyectado
- [ ] Imágenes locales con EXIF
- [ ] NAP consistente en todas

**Tiempo:** 60 min
**Status:** ⏳ Pendiente

---

## 📍 GATE 3: Local SEO Completo

### Validaciones Requeridas
- [ ] NAP sincronizado byte-por-byte en todas las páginas
- [ ] EXIF inyectado en todas las imágenes
- [ ] Grafo de landmarks creado (5+ páginas de cobertura)
- [ ] Schema LocalBusiness inyectado
- [ ] Validador NAP ejecutándose en CI/CD

**Si TODOS los checks ✓ → Continuar a FASE 4**

**Tiempo FASE 3 Total:** ~2.5 horas

---

*(continuará en próxima sección)*

