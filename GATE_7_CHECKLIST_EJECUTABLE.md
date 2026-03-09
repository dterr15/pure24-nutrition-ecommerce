# GATE 7: VALIDACIÓN FINAL - CHECKLIST EJECUTABLE

**Duración:** 60-90 minutos
**Status:** Listo para validación
**Objetivo:** Confirmación exhaustiva antes de cierre de proyecto

---

## 📋 4 ÁREAS DE VALIDACIÓN (24 CHECKS TOTALES)

| Área | Checks | Tiempo |
|------|--------|--------|
| TÉCNICO | 8 | 20 min |
| FUNCIONAL | 7 | 30 min |
| SEO LOCAL | 4 | 15 min |
| PRODUCCIÓN | 5 | 20 min |
| **TOTAL** | **24** | **85 min** |

---

## 🔧 PASO 1: VALIDACIÓN TÉCNICA (20 MIN)

### 1.1 HTTPS Funciona

```bash
curl -I https://pure24nutrition.cl
# Esperado:
# HTTP/2 200
# server: cloudflare
# strict-transport-security: max-age=31536000; includeSubDomains
```

**Status:** [ ] PASS / [ ] FAIL

---

### 1.2 TTFB < 50ms

**Opción A:** Cloudflare Dashboard → Analytics → TTFB en gráfico

**Opción B:** Terminal
```bash
curl -w "TTFB: %{time_starttransfer}s (seconds)\n" -o /dev/null -s https://pure24nutrition.cl
# Esperado: 0.020-0.050s
```

**Status:** [ ] PASS / [ ] FAIL

---

### 1.3 Lighthouse Performance 95+

1. Ir a: https://pagespeed.web.dev
2. URL: `https://pure24nutrition.cl`
3. Desktop → Analyze
4. Esperar ~10 segundos

**Esperado:**
- Performance: 95-100
- Accessibility: 95-100
- Best Practices: 90-100
- SEO: 100

**Status:** [ ] PASS / [ ] FAIL

---

### 1.4 Lighthouse SEO 100

**Del test anterior, verificar SEO = 100:**
- [ ] Mobile-friendly: ✓
- [ ] Page experience: ✓
- [ ] Safe browsing: ✓
- [ ] Core Web Vitals: ✓

**Status:** [ ] PASS / [ ] FAIL

---

### 1.5 Sitemap.xml Accesible

```bash
curl https://pure24nutrition.cl/sitemap.xml | head -20
# Esperado:
# <?xml version="1.0" encoding="UTF-8"?>
# <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
#   <url>
#     <loc>https://pure24nutrition.cl/</loc>
#   </url>
#   <url>
#     <loc>https://pure24nutrition.cl/productos/P24N-WHEY-500</loc>
#   </url>
```

**Status:** [ ] PASS / [ ] FAIL

---

### 1.6 robots.txt Accesible

```bash
curl https://pure24nutrition.cl/robots.txt
# Esperado:
# User-agent: *
# Allow: /
# Disallow: /admin
# Sitemap: https://pure24nutrition.cl/sitemap.xml
```

**Status:** [ ] PASS / [ ] FAIL

---

### 1.7 JSON-LD Sin Errores

1. Ir a: https://search.google.com/test/rich-results
2. URL: `https://pure24nutrition.cl`
3. Click "Test"

**Esperado:**
- ✓ Rich results detected
- ✓ No errors
- Tipos: LocalBusiness, Product, Breadcrumb

**Status:** [ ] PASS / [ ] FAIL

---

### 1.8 Favicon Presente

```bash
curl -I https://pure24nutrition.cl/favicon.ico
# Esperado:
# HTTP/2 200
```

**Status:** [ ] PASS / [ ] FAIL

---

## 💳 PASO 2: VALIDACIÓN FUNCIONAL (30 MIN)

### 2.1 Página de Producto Carga

1. Abrir browser: `https://pure24nutrition.cl`
2. Click en un producto (ej: Whey Protein)

**Verificar:**
- [ ] Página carga en < 3 segundos
- [ ] Imagen del producto visible
- [ ] Descripción completa
- [ ] FAQ section presente
- [ ] Botón "Comprar" visible y clickeable

**Status:** [ ] PASS / [ ] FAIL

---

### 2.2 Flujo de Compra Completo

**Parte 1: Redirección a MP**
1. Click "Comprar"
   - [ ] Redirige a Mercado Pago
   - [ ] URL contiene `mercado`
   - [ ] Detalles: producto correcto, precio correcto
   - [ ] Cantidad: 1

**Parte 2: En Mercado Pago**
2. Usar tarjeta de TEST:
   - **Nº Tarjeta:** `5031 7557 3453 8984`
   - **Vencimiento:** `12/25`
   - **CVV:** `123`
   - **Nombre:** `Test User`

3. Completar pago
   - [ ] Pago procesado
   - [ ] Muestra confirmación

**Parte 3: Redirección**
4. Después del pago
   - [ ] Redirige a: `https://pure24nutrition.cl/?status=success`
   - [ ] Mensaje en pantalla: "¡Pago procesado!"

**Status:** [ ] PASS / [ ] FAIL

---

### 2.3 Stock Se Actualiza

**ANTES del pago:**
```bash
DIRECTUS_API_KEY="tu_api_key"
curl "http://localhost:8055/api/items/products?filter[sku][_eq]=P24N-WHEY-500" \
  -H "Authorization: Bearer $DIRECTUS_API_KEY" | jq '.data[0].stock'
# Anota el número (ej: 50)
```

**DESPUÉS del pago (arriba):**
```bash
curl "http://localhost:8055/api/items/products?filter[sku][_eq]=P24N-WHEY-500" \
  -H "Authorization: Bearer $DIRECTUS_API_KEY" | jq '.data[0].stock'
# Esperado: 49 (reducido en 1)
```

**Si no cambió:**
- [ ] FASE 6.1 (Stock Update) no funcionó
- [ ] Revisar n8n logs
- [ ] Ver audit_logs en Directus

**Status:** [ ] PASS / [ ] FAIL

---

### 2.4 Email de Confirmación Recibido

**DESPUÉS del pago:**
1. Revisar inbox del email usado en test

**Esperado en email:**
- [ ] Asunto: "Tu compra en Pure24 Nutrition"
- [ ] Contiene: número de orden
- [ ] Contiene: nombre del producto
- [ ] Contiene: precio
- [ ] Contiene: fecha
- [ ] Link "Ver mi Pedido" presente
- [ ] Llega en < 2 minutos

**Status:** [ ] PASS / [ ] FAIL

---

### 2.5 Orden Aparece en CMS

1. Directus: `http://localhost:8055`
2. Collections → **orders**
3. Filtrar por: fecha = hoy

**Esperado:**
- [ ] Orden nueva visible
- [ ] Status: `completed`
- [ ] Customer email: correcto
- [ ] Total: igual al precio
- [ ] Items: contiene `P24N-WHEY-500`
- [ ] created_at: timestamp reciente

**Status:** [ ] PASS / [ ] FAIL

---

### 2.6 GA4 Evento Recibido

1. Google Analytics: `https://analytics.google.com`
2. Seleccionar: `pure24nutrition`
3. Reports → Engagement → Events
4. Buscar evento: `purchase`

**Esperado:**
- [ ] Evento purchase en últimas 24h
- [ ] Count: 1
- [ ] Ingresos: igual al precio

**Status:** [ ] PASS / [ ] FAIL

---

## 🔍 PASO 3: VALIDACIÓN SEO LOCAL (15 MIN)

### 3.1 NAP (Name, Address, Phone) Consistente

```bash
curl https://pure24nutrition.cl | grep -i "pure24\|santiago\|phone" | head -10
```

**Verificar en footer:**
- [ ] Name: `Pure24 Nutrition`
- [ ] Address: `Santiago, Chile` (o dirección específica)
- [ ] Phone: `+56 9 XXXX XXXX`

**Status:** [ ] PASS / [ ] FAIL

---

### 3.2 LocalBusiness Schema Validado

1. Google Rich Results: `https://search.google.com/test/rich-results`
2. URL: `https://pure24nutrition.cl`
3. Test

**Esperado:**
- [ ] Tipo: LocalBusiness
- [ ] Name: Pure24 Nutrition
- [ ] Address: Santiago, Chile
- [ ] Phone: +56...
- [ ] URL: https://pure24nutrition.cl

**Status:** [ ] PASS / [ ] FAIL

---

### 3.3 Imágenes con Alt Text

```bash
curl https://pure24nutrition.cl | grep -o '<img[^>]*alt="[^"]*"' | head -5
```

**Esperado:**
```html
<img ... alt="Whey Protein 500g - Pure24 Nutrition">
<img ... alt="Logo Pure24">
```

**NO esto:**
```html
<img src="..." alt="">
<img src="..." >  <!-- sin alt -->
```

**Status:** [ ] PASS / [ ] FAIL

---

### 3.4 Nombres de Archivo Descriptivos

```bash
curl https://pure24nutrition.cl | grep -o 'src="[^"]*"' | grep -E "\.(jpg|png|webp)" | head -5
```

**Esperado:**
- ✅ `whey-protein-500g.jpg`
- ✅ `product-P24N-WHEY-500.png`

**NO esto:**
- ❌ `image_1.jpg`
- ❌ `photo.png`
- ❌ `/uploads/123456.jpg`

**Status:** [ ] PASS / [ ] FAIL

---

## 🚀 PASO 4: VALIDACIÓN PRODUCCIÓN (20 MIN)

### 4.1 DNS Correcto

```bash
nslookup -type=NS pure24nutrition.cl
# Esperado:
# pure24nutrition.cl nameserver = ns1.cloudflare.com
# pure24nutrition.cl nameserver = ns2.cloudflare.com
```

**Status:** [ ] PASS / [ ] FAIL

---

### 4.2 SSL Certificado Activo

```bash
curl -vI https://pure24nutrition.cl 2>&1 | grep -i "SSL certificate verify"
# Esperado:
# SSL certificate verify ok
```

**Status:** [ ] PASS / [ ] FAIL

---

### 4.3 Uptime Monitoring Activo

**GitHub Actions (Jules AI):**
1. Ir a: `https://github.com/your-org/pure24-nutrition`
2. Actions → Jules Monitoring
3. Verificar:
   - [ ] Ejecuciones cada 5 minutos
   - [ ] Última ejecución hace < 5 min
   - [ ] Status: ✅ (verde)

**O Uptime Robot:**
- [ ] Dashboard muestra: UP

**Status:** [ ] PASS / [ ] FAIL

---

### 4.4 Backups Configurados

**Base de datos:**
1. Hosting provider (Railway, Render, VPS)
2. Buscar: Settings → Backups

**Verificar:**
- [ ] Backups automáticos: ON
- [ ] Frecuencia: diario (24h)
- [ ] Últimos backups: hace < 24h
- [ ] Retención: mínimo 7 días

**Código (GitHub):**
- [ ] Repo existe
- [ ] Últimos pushes: hace < 24h

**Status:** [ ] PASS / [ ] FAIL

---

### 4.5 Alertas Configuradas

**Verificar que están activas:**
- [ ] Email alertas configurado
- [ ] GA4: alerta si conversion rate baja
- [ ] Cloudflare: alerta si TTFB > 100ms
- [ ] n8n: alerta si workflow falla
- [ ] Jules AI: monitoreo cada 5 min

**Status:** [ ] PASS / [ ] FAIL

---

## 📊 MATRIZ FINAL

```
TÉCNICO:        [ ] [ ] [ ] [ ] [ ] [ ] [ ] [ ]  =  _/8
FUNCIONAL:      [ ] [ ] [ ] [ ] [ ] [ ] [ ]      =  _/7
SEO LOCAL:      [ ] [ ] [ ] [ ]                  =  _/4
PRODUCCIÓN:     [ ] [ ] [ ] [ ] [ ]              =  _/5

TOTAL:          ___/24  ✅ = GATE PASSED si 24/24
```

---

## 🎯 RESULTADO

### Si TODO pasa (24/24) ✅

```
GATE 7 CLOSED ✅

Sistema completamente validado y listo para producción:
  ✅ Frontend: Cloudflare Pages
  ✅ Backend: Directus
  ✅ Pagos: Mercado Pago
  ✅ Orquestación: n8n
  ✅ Monitoreo: Jules AI + Data Studio
  ✅ DNS: Cloudflare
  ✅ SSL: Automático
  ✅ Performance: TTFB < 50ms
  ✅ Uptime: 99.9%+
  ✅ SEO: Schema validado

🚀 PROYECTO FINALIZADO
```

### Si algo falla (< 24/24)

**Proceder así:**

1. **Identificar qué falló**
   - Test específico que falló
   - Valor esperado vs actual

2. **Reportar**
   - Número del check
   - Error exacto

3. **Arreglar**
   - Claude Code lo corrige
   - Puede tardar 10-60 min extra

4. **Revalidar**
   - Ese item nuevamente

5. **Cuando TODO pase** → GATE CIERRA ✅

---

**Status:** Ready for validation ✅
**Responsable:** Usuario valida, Claude Code corrige si falla
**Final:** Gate 7 Closed = Proyecto Completado
