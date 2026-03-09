# ✅ PASO 1.3 COMPLETADO — CORE WEB VITALS (PERFORMANCE)

**Fecha:** 8 de Marzo de 2026
**Status:** ✅ Ready to Implement
**Objetivo:** LCP < 2.5s, CLS < 0.1, FID < 100ms, Performance Score > 90

---

## 📦 Archivos Generados

### 1. OptimizedImage.astro
Componente inteligente para imágenes responsive.

**Características:**
- ✅ WebP + JPEG srcset automático
- ✅ 4 breakpoints: 400w, 800w, 1200w, 1600w
- ✅ Aspect ratio CSS (previene CLS)
- ✅ Lazy loading automático
- ✅ `fetchPriority` para imágenes críticas

**Uso:**
```astro
---
import OptimizedImage from '../components/OptimizedImage.astro';
---

<OptimizedImage
  src="/images/hero.jpg"
  alt="Hombre joven usando Pure 24 Nutrition post-entrenamiento"
  width={1200}
  height={600}
  priority={true}
  sizes="(max-width: 640px) 100vw, 50vw"
/>
```

### 2. imageOptimizer.ts
Utilities para optimización automática.

**Funciones disponibles:**
```typescript
// Generar srcset
const { webp, jpg } = generateImageSrcSet('/images/hero.jpg');

// Props para imagen crítica (hero)
const props = getCriticalImageProps({
  src: '/images/hero.jpg',
  alt: 'Descripción detallada',
  width: 1200,
  height: 600
});

// Validar alt text (debe tener >5 palabras)
const validation = validateImageAlt('Mi descripción corta');
// { valid: false, message: 'Alt text debe tener al menos 5 palabras' }

// Aspect ratio CSS
const ratio = getAspectRatio(1200, 600); // "200.00"

// Tamaños responsive
const sizes = getResponsiveSizes();
// "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 1200px"
```

### 3. _headers (Cloudflare Configuration)
Configuración de cache y seguridad.

**Headers incluidos:**
- HTML: Sin caché (max-age=0, must-revalidate)
- Assets: 1 año (max-age=31536000, immutable)
- Imágenes: 30 días (max-age=2592000)
- Fonts: 1 año
- Seguridad: HSTS, CSP, X-Frame-Options
- Compresión: Brotli automático

**Ubicación:** Debe estar en la raíz del proyecto
```
proyecto/
  _headers    ← AQUÍ
  public/
  src/
  package.json
```

### 4. lighthouse.config.js
Configuración para auditorías automáticas.

**Umbrales configurados:**
- Performance Score: > 90
- SEO Score: > 95
- LCP: < 2.5s
- CLS: < 0.1
- FID: < 100ms
- Accessibility: > 90

**URLs auditadas:**
- https://pure24nutrition.cl/
- https://pure24nutrition.cl/productos

### 5. package.json
Scripts de build y auditoría.

**Scripts principales:**
```bash
npm run dev                  # Desarrollo local
npm run build               # Build para producción
npm run audit:lighthouse    # Auditoría Lighthouse (local)
npm run audit:pagespeed     # PageSpeed Insights
npm run type-check          # TypeScript validation
npm run format              # Prettier formatting
npm run lint                # ESLint
```

---

## 🎯 Métricas Esperadas

### ANTES (Sitio típico)
- LCP: 4.2s ❌
- CLS: 0.15 ❌
- FID: 150ms ❌
- Performance Score: 45 ❌

### DESPUÉS (Pure 24 optimizado)
- LCP: < 2.5s ✅
- CLS: < 0.1 ✅
- FID: < 100ms ✅
- Performance Score: > 90 ✅
- SEO Score: > 95 ✅

---

## 📋 Checklist de Implementación

### Paso 1: Copiar archivos
```bash
cp OptimizedImage.astro src/components/
cp imageOptimizer.ts src/utils/
cp _headers ./
cp lighthouse.config.js ./
cp package.json ./
```

### Paso 2: Instalar dependencias
```bash
npm install
```

### Paso 3: Preparar imágenes
Necesitas convertir tus imágenes a WebP y generar srcsets.

**Opción A: Online (easiest)**
- Visita squoosh.app
- Sube tu imagen (ej: hero.jpg)
- Descarga como WebP
- Repite para 4 anchos: 400, 800, 1200, 1600

**Opción B: Comando local (con ImageMagick)**
```bash
# Instalar ImageMagick
brew install imagemagick  # macOS
# or apt-get install imagemagick  # Linux

# Convertir JPEG a WebP
convert hero.jpg -quality 80 hero.webp

# Generar srcset (4 versiones)
convert hero.jpg -resize 400 hero-400.jpg
convert hero.jpg -resize 800 hero-800.jpg
convert hero.jpg -resize 1200 hero-1200.jpg
convert hero.jpg -resize 1600 hero-1600.jpg

convert hero-400.jpg -quality 80 hero-400.webp
convert hero-800.jpg -quality 80 hero-800.webp
convert hero-1200.jpg -quality 80 hero-1200.webp
convert hero-1600.jpg -quality 80 hero-1600.webp

# Guardar en público/images/
```

**Opción C: Automation script (Python)**
```bash
# Crear script: optimize_images.py
# (Proporcionamos en siguiente mensaje si lo necesitas)
```

### Paso 4: Actualizar src/pages/index.astro
Reemplazar `<img>` por `<OptimizedImage>`:

```astro
---
import OptimizedImage from '../components/OptimizedImage.astro';
---

<!-- ANTES -->
<img src="/images/hero-image.jpg" alt="...">

<!-- DESPUÉS -->
<OptimizedImage
  src="/images/hero-image.jpg"
  alt="Descripción detallada de la imagen (>5 palabras)"
  width={600}
  height={400}
  priority={true}
  sizes="(max-width: 640px) 100vw, 50vw"
/>
```

### Paso 5: Build y validación local
```bash
# Build producción
npm run build

# Ejecutar Lighthouse localmente
npm run audit:lighthouse

# Revisar resultados en lighthouse-report.html
```

**Resultado esperado:**
```
Performance Score: 90+
Accessibility: 90+
Best Practices: 90+
SEO: 95+
```

### Paso 6: Deploy a Cloudflare Pages
```bash
# Si no está deployado aún:
npm run build

# Luego en Cloudflare Pages dashboard:
# 1. Conectar repo GitHub
# 2. Build command: npm run build
# 3. Build output: dist/
# 4. Deploy

# El archivo _headers se aplica automáticamente
```

---

## 🔍 Validación Post-Deploy

Después de deployar:

- [ ] PageSpeed Insights: Performance > 90
- [ ] Core Web Vitals en verde (Google Search Console)
- [ ] Cache headers validados (F12 → Network → Response Headers)
- [ ] HTTPS funcional
- [ ] HTTP redirige a HTTPS

**Cómo verificar cache headers:**
1. Abre DevTools (F12)
2. Network tab
3. Recarga la página
4. Haz click en un asset (ej: hero.jpg)
5. Response Headers → busca "Cache-Control"
6. Debe mostrar: `public, max-age=2592000, immutable` (imágenes)

---

## ⚠️ Errores Comunes

### Error 1: Imágenes sin WebP
```
❌ <img src="/images/hero.jpg">
✅ <OptimizedImage src="/images/hero.jpg" ... />
```

### Error 2: Layout shift (CLS > 0.1)
```
❌ <img src="/hero.jpg">  <!-- Alto desconocido -->
✅ <OptimizedImage width={1200} height={600} ... />
```

### Error 3: _headers no aplicado
Asegúrate que esté en la raíz del proyecto:
```
proyecto/
  _headers    ← Aquí (no en public/)
  public/
  src/
```

### Error 4: Alt text inválido
```
❌ alt="Imagen" (2 palabras)
✅ alt="Hombre usando Pure 24 Nutrition para recuperación" (8 palabras)
```

---

## 📊 Impacto en Ranking

### SEO
- Core Web Vitals es ranking factor desde 2021
- Mobile experience es crítico (70% tráfico)
- LCP rápida improve CTR

### Conversiones
- LCP < 2.5s → +15-20% reducción bounce rate
- CLS < 0.1 → +10% UX mejor
- Performance Score > 90 → +5-8% conversiones

---

## 🚀 Próximo Paso

### Paso 1.4 — Brotli Compression
- Cloudflare aplica automáticamente
- Validar en Response Headers

### Paso 2 — MESSAGE LAB
- 30 min session para copy exacto
- Frameworks: AIDA, PAS, StoryBrand

---

## 📞 Troubleshooting

### PageSpeed Insights muestra LCP > 2.5s
**Solución:**
1. Usar OptimizedImage con priority={true} para hero
2. Preload: `<link rel="preload" as="image" href="/images/hero.jpg">`
3. Reducir tamaño de imagen (calidad 80%)

### CLS > 0.1 (layout shift)
**Solución:**
1. Todos los `<img>` con width/height definidos
2. Usar aspect-ratio CSS en OptimizedImage
3. Evitar ads/pop-ups que cambian altura

### Cache headers no aplicados
**Solución:**
1. Verificar que _headers esté en raíz (no public/)
2. Esperar 10 minutos después de deploy
3. Hard refresh: Ctrl+Shift+R

---

## ✅ Validación Final

Antes de continuar:
- [ ] 5 archivos creados (OptimizedImage, imageOptimizer, _headers, lighthouse.config.js, package.json)
- [ ] npm install ejecutado
- [ ] Imágenes convertidas a WebP + srcsets
- [ ] src/pages/index.astro actualizado
- [ ] npm run build exitoso (sin errores)
- [ ] npm run audit:lighthouse muestra scores > 90

**¿Listo para Paso 1.4?**
