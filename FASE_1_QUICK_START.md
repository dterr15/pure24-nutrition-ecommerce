# ⚡ FASE 1 — QUICK START

**Status:** ✅ COMPLETADA

---

## 🚀 Los 3 pasos para ir a producción

### 1️⃣ Preparar imágenes (10 min)
```bash
# Opción A: Online (más fácil)
# 1. Abre squoosh.app
# 2. Sube imagen (ej: hero.jpg)
# 3. Descarga como WebP
# 4. Repite en 4 tamaños: 400w, 800w, 1200w, 1600w
# 5. Guarda en public/images/

# Opción B: Terminal (ImageMagick)
convert hero.jpg -quality 80 hero.webp
convert hero.jpg -resize 400 hero-400.jpg
convert hero.jpg -resize 400 hero-400.jpg -quality 80 hero-400.webp
# ... etc para 800, 1200, 1600
```

### 2️⃣ Actualizar contenido (15 min)
En `src/pages/index.astro`:
- [ ] Reemplaza `PLACEHOLDER_HEADLINE` con tu headline
- [ ] Reemplaza `PLACEHOLDER_SUBHEADLINE` con tu subheadline
- [ ] Reemplaza rutas de imágenes
- [ ] Actualiza URLs en CTAs

En `src/pages/productos/[slug].astro`:
- [ ] Reemplaza placeholders de producto
- [ ] Actualiza imágenes
- [ ] Verifica meta description

### 3️⃣ Validar y deployar (5 min)
```bash
# Build local
npm run build

# Validar Lighthouse (local)
npm run audit:lighthouse

# Debe mostrar > 90 en Performance, SEO

# Deploy a Cloudflare Pages
# (Tu repo ya está conectado según setup anterior)
```

---

## ✅ Validación Post-Deploy (2 min)

**Abre el navegador:**
1. https://pure24nutrition.cl
2. Presiona F12 → Network tab
3. Recarga (F5)
4. Click en cualquier asset (CSS, JS, imagen)
5. Response Headers → Busca `content-encoding: br` ✅

**Si ves Performance Score < 90:**
- Revisa docs/PASO_1.3_CORE_WEB_VITALS.md → Troubleshooting

---

## 📊 Checklist Pre-Deploy

- [ ] Imágenes convertidas a WebP (public/images/)
- [ ] Placeholders reemplazados en index.astro
- [ ] npm run build exitoso (sin errores)
- [ ] npm run audit:lighthouse muestra >90
- [ ] Cache headers validados (F12 → Network)

---

## 🎯 Métricas Esperadas

Después de deploy:
- **Performance Score:** >90
- **LCP:** <2.5s
- **CLS:** <0.1
- **Payload con Brotli:** <50KB

---

## 📞 Soporte Rápido

| Problema | Solución |
|----------|----------|
| Performance Score < 90 | Ver PASO_1.3_CORE_WEB_VITALS.md |
| Imágenes no se cargan | Verifica ruta en public/images/ |
| Cache headers no aparecen | Verifica _headers en raíz (no public/) |
| Brotli no activo | Hard refresh (Ctrl+Shift+R), espera 10 min |
| Build error | npm install, npm run build |

---

## 📋 Documentación Completa

- **Paso 1.1:** Design Tokens → `docs/05_design_tokens.json`
- **Paso 1.2:** HTML Semántico → `src/pages/index.astro`
- **Paso 1.3:** Core Web Vitals → `docs/PASO_1.3_CORE_WEB_VITALS.md`
- **Paso 1.4:** Brotli → `docs/PASO_1.4_BROTLI_COMPRESSION.md`
- **Resumen:** `docs/PASO_1_RESUMEN.md`

---

**¿Preguntas?** → Revisa la documentación específica de cada paso.

**¿Listo?** → Prepara imágenes y content, luego deploy. 🚀
