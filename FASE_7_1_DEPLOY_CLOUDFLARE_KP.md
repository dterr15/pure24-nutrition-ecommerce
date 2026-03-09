# FASE 7.1: DEPLOY CLOUDFLARE PAGES - KNOWLEDGE PACK

**Status:** ✅ KNOWLEDGE PACK COMPLETADO
**Objetivo:** Documentar deploy repo → Cloudflare Pages → pure24nutrition.cl
**Timeline:** 30-40 minutos (cuando se ejecute post-repo)
**Stack:** Astro + Cloudflare Pages + GitHub

---

## 📋 PREREQUISITOS

### Código existente (ya hecho)
- ✅ Astro proyecto completo (src/pages/, components/, etc)
- ✅ package.json con scripts build/dev
- ✅ astro.config.mjs configurado
- ✅ Todos los documentos FASE 6.4

### Requisitos para ejecutar esta FASE
- ⏳ Repo GitHub creado (será creado post-KP)
- ⏳ Dominio pure24nutrition.cl delegado a Cloudflare (asumido)
- ✅ Cuenta Cloudflare con acceso Pages
- ✅ Node 18.x instalado local

---

## 🏗️ ARQUITECTURA FINAL

```
GitHub (main branch)
    ↓ Push
Cloudflare Pages (auto-detect)
    ↓ npm run build
Edge Network (200+ ciudades)
    ↓
https://pure24nutrition.cl (LIVE)
    ↓ TTFB < 50ms ✅
```

---

## 🔧 PASO 1: CONECTAR REPO A CLOUDFLARE PAGES (10 MIN)

### En Cloudflare Dashboard

1. Ir a: https://dash.cloudflare.com
2. **Pages** → **Create project**
3. **Connect to Git** → Autorizar GitHub
4. **Seleccionar repo:** pure24-nutrition
5. **Build settings:**
   - **Branch:** main
   - **Build command:** `npm run build`
   - **Build output:** `dist/`
6. Click **"Save and Deploy"**

### Resultado esperado

```
Status: In progress → Active (~2-3 min)
URL: https://pure24nutrition.pages.dev (temporal)
     → https://pure24nutrition.cl (con custom domain)
```

✅ **PASO 1 COMPLETADO** cuando ves status "Active"

---

## 🔐 PASO 2: CONFIGURAR VARIABLES DE ENTORNO (5 MIN)

### Development (Local)

En tu máquina, crear `.env.local` (NO commitear):

```bash
cat > .env.local << 'EOF'
VITE_CMS_URL=http://localhost:8055
VITE_GA4_MEASUREMENT_ID=G-SANDBOX-XXXXXXXXXX
NODE_ENV=development
EOF
```

Agregar a `.gitignore`:
```
.env.local
.env.*.local
```

### Production (En Cloudflare)

En Cloudflare Dashboard:
- **Pages** → Proyecto → **Settings** → **Environment variables**

**Ahora (con backend local):**
```
VITE_CMS_URL = http://localhost:8055
NODE_ENV = development
```

**Futuro (cuando backend vaya a producción):**
```
VITE_CMS_URL = https://directus-prod.tu-dominio.com
NODE_ENV = production
```

✅ **PASO 2 COMPLETADO** cuando variables están en Cloudflare Dashboard

---

## 🚀 PASO 3: HACER PUSH A MAIN (5 MIN)

```bash
git add .
git commit -m "feat: setup cloudflare pages deployment"
git push origin main
```

### Qué sucede automáticamente

```
1. Cloudflare detecta push a main
2. Clona repo
3. npm install
4. npm run build (genera dist/)
5. Deploy a Edge Network
6. ~2-3 min: Sitio LIVE ✅
```

Verificar en **Cloudflare Dashboard** → **Deployments** → Status debe ser "Active"

✅ **PASO 3 COMPLETADO** cuando deployment es "Active"

---

## ✓ PASO 4: VERIFICAR SITIO (5 MIN)

### HTTP Status

```bash
curl -o /dev/null -s -w "%{http_code}\n" https://pure24nutrition.cl
# Esperado: 200
```

### Contenido

```bash
curl https://pure24nutrition.cl | head -50
# Debe retornar HTML completo
```

### TTFB (Time To First Byte)

```bash
curl -w "TTFB: %{time_starttransfer}s\n" -o /dev/null -s https://pure24nutrition.cl
# Esperado: 0.050-0.100s (Edge es rápido)
```

### Headers de Seguridad

```bash
curl -I https://pure24nutrition.cl
# Debe incluir:
# Server: cloudflare
# strict-transport-security: max-age=...
# x-content-type-options: nosniff
```

✅ **PASO 4 COMPLETADO** cuando todos los checks pasan

---

## 🔄 WORKFLOW POST-SETUP (AUTOMÁTICO)

Una vez configurado, es 100% automático:

```
1. Cambio en código → git push origin main
2. Cloudflare detecta automáticamente
3. npm run build iniciado
4. Deploy a Edge Network
5. ~2-3 min: Sitio actualizado ✅

NO HAY mantenimiento manual después.
```

---

## 📊 TRANSICIÓN A PRODUCCIÓN (FUTURO)

Cuando Directus vaya a servidor:

1. **Migrar backend** a Railway/Render
   ```
   Obtener: https://directus-prod.tu-dominio.com
   ```

2. **En Cloudflare Pages Settings:**
   ```
   VITE_CMS_URL = https://directus-prod.tu-dominio.com
   ```

3. **Cloudflare automáticamente:**
   ```
   - Detecta cambio de variable
   - Re-build del sitio
   - Deploy con nueva URL
   ```

4. **Sitio sincronizado con backend producción** ✅

---

## ✅ CHECKLIST FINAL

```
ANTES DE EJECUTAR:
[ ] Repo GitHub creado con Astro código
[ ] astro.config.mjs con output: 'static'
[ ] package.json con scripts: build, dev
[ ] .gitignore incluye .env.local
[ ] Dominio pure24nutrition.cl delegado a Cloudflare

DURANTE EJECUCIÓN:
[ ] PASO 1: Repo conectado a Cloudflare Pages
[ ] PASO 2: Variables de entorno configuradas
[ ] PASO 3: Push a main completado
[ ] PASO 4: Sitio accesible en pure24nutrition.cl
[ ] HTTP 200 retornado
[ ] TTFB < 0.1s
[ ] Headers de seguridad presentes
[ ] SSL automático funcionando

DESPUÉS:
[ ] Workflow automático verificado
[ ] Cambios en código → deploy en 2-3 min
```

---

## 📈 VENTAJAS ESTE SETUP

✅ **Automático:** Deploy en cada push a main
✅ **Global:** Edge network en 200+ ciudades
✅ **Rápido:** TTFB típicamente < 50ms
✅ **Seguro:** SSL automático + HSTS
✅ **Escalable:** Sin preocupación infraestructura
✅ **Flexible:** Cambiar backend URL sin re-code

---

## 🎓 CONOCIMIENTO CAPTURADO

✅ Completamente documentado:
- Estructura repo Astro
- Variables de entorno (dev vs prod)
- Proceso de build
- Conexión a Cloudflare Pages
- Dominio: pure24nutrition.cl
- Backend local vs producción
- Plan de transición a prod

**Listo para:** Crear repo, conectar a Cloudflare, first deploy

---

## 📞 TROUBLESHOOTING

### Build falla en Cloudflare
- Verificar: `npm run build` corre localmente
- Verificar: package.json tiene `"build": "astro build"`
- Verificar: astro.config.mjs tiene `output: 'static'`

### Variables de entorno no se inyectan
- En Cloudflare: Settings → Environment variables
- Nombre exacto: `VITE_CMS_URL` (sin VITE_ prefijo en Astro)
- Re-deploy para aplicar cambios

### TTFB alto
- Normal en primer request (cold start)
- Segundo request: < 50ms
- Si persiste: Revisar código del servidor

### SSL no funciona
- Cloudflare lo proporciona automáticamente
- Esperar 5-10 min después del deploy
- Si sigue: Verificar dominio delegado a Cloudflare

---

**Status:** 📋 Knowledge Pack Completado
**Próximo:** FASE 7.2 (Deploy Backend)
**Final:** FASE 7.3 (Monitoreo Integral)
