# ✅ CHECKLIST DE RECOPILACIÓN DE DATOS — FASE 0B

**Proyecto:** Pure 24 Nutrition E-commerce
**Fecha:** 8 de Marzo de 2026
**Status:** ⏳ Pendiente completar

---

## 📊 RESUMEN

Este checklist especifica EXACTAMENTE qué datos necesitas recopilar antes de pasar a Fase 1 (Knowledge Pack).

| Sección | Descripción | Status |
|---------|-------------|--------|
| **1** | Información de Productos (mínimo 5) | ⏳ |
| **2** | Credenciales Mercado Pago | ⏳ |
| **3** | Google Analytics GA4 | ⏳ |
| **4** | Cloudflare | ⏳ |
| **5** | Directus (local) | ⏳ |
| **6** | N8N | ⏳ |
| **7** | Información del Dominio | ⏳ |
| **8** | Validación Final | ⏳ |

---

## 🟢 SECCIÓN 1: INFORMACIÓN DE PRODUCTOS

**Archivo:** `/data/products.csv`
**Formato:** CSV con las siguientes columnas:

```
SKU,Nombre Producto,Precio (CLP),Stock,Código Barras (GTIN13),Categoría,Descripción,URL Imagen,Ingredientes
```

**Ejemplo de fila:**
```
BETA-ALANINA-2400,BETA ALANINA 2400 MG,29990,100,7798123456789,Aminoácidos,Beta-alanina pura 2400mg por serv,https://tienda.pure24nutrition.cl/images/beta-alanina.jpg,"Beta-alanina 99.5% pureza"
```

**Requisitos:**
- [ ] Mínimo 5 productos
- [ ] Máximo 20 para Fase 0B
- [ ] Todos los campos completados
- [ ] Precios en CLP
- [ ] URL de imágenes accesibles (http/https)
- [ ] SKU únicos (sin duplicados)

**Dónde obtener:** Tienda Pure 24 Nutrition (tienda.pure24nutrition.cl)

**Productos a incluir (sugerencia):**
1. [ ] BETA ALANINA 2400 MG - $29.990
2. [ ] CREATINA HCL 300GR - $36.900
3. [ ] MAGNESIO MALATO 120G - $15.990
4. [ ] OMEGA 3 + ADEK 90 CAPS - $17.990
5. [ ] VITAMINA D3 + K2 + CALCIUM - $24.900

**Status:** ⏳ Pendiente

---

## 🟢 SECCIÓN 2: CREDENCIALES MERCADO PAGO

**Dónde obtener:** https://www.mercadopago.cl/developers/panel

**Pasos:**
1. [ ] Inicia sesión en Mercado Pago
2. [ ] Ve a Configuración → Credenciales
3. [ ] Copia: **Public Key** (APP_USR-...)
4. [ ] Copia: **Access Token** (APP_USR-...)
5. [ ] Pega en `.env`:
   ```
   VITE_PUBLIC_MP_PUBLIC_KEY=APP_USR-xxxxx
   MP_ACCESS_TOKEN=APP_USR-xxxxx
   ```

**Verificación:**
```bash
curl -H "Authorization: Bearer $MP_ACCESS_TOKEN" \
  https://api.mercadopago.com/v1/payments/search
```
Resultado esperado: HTTP 200 ✓

**Status:** ⏳ Pendiente

---

## 🟢 SECCIÓN 3: GOOGLE ANALYTICS GA4

**Dónde obtener:** https://analytics.google.com

**Pasos:**
1. [ ] Crea propiedad GA4 (o usa existente)
2. [ ] Ve a Admin → Detalles de propiedad
3. [ ] Copia: **Measurement ID** (G-XXXXXXXXXX)
4. [ ] Ve a Admin → Credenciales de acceso → Cuenta de servicio
5. [ ] Copia: **API Secret** (xxxxxxxxxxxxxxx)
6. [ ] Pega en `.env`:
   ```
   VITE_PUBLIC_GA4_MEASUREMENT_ID=G-XXXXXXXXXX
   GA4_API_SECRET=xxxxxxxxxxxxxxx
   ```

**Verificación:**
```bash
curl -X POST https://www.google-analytics.com/mp/collect?...
```
Resultado esperado: HTTP 204 ✓

**Status:** ⏳ Pendiente

---

## 🟢 SECCIÓN 4: CLOUDFLARE

**Dónde obtener:** https://dash.cloudflare.com

**Pasos:**
1. [ ] Inicia sesión en Cloudflare
2. [ ] Ve a Mi perfil → Credenciales de API
3. [ ] Copia: **Account ID** (32 caracteres)
4. [ ] Crea Token:
   - Permisos: DNS, Audit Logs, Account Settings
   - Copia el token
5. [ ] Obtén: **Zone ID** (desde detalles del dominio)
6. [ ] Pega en `.env`:
   ```
   CF_ACCOUNT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   CF_API_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   CF_ZONE_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

**Verificación:**
```bash
curl -H "Authorization: Bearer $CF_API_TOKEN" \
  https://api.cloudflare.com/client/v4/user/tokens/verify
```
Resultado esperado: HTTP 200 + `"success": true` ✓

**Status:** ⏳ Pendiente

---

## 🟢 SECCIÓN 5: DIRECTUS (LOCAL)

**Nota:** Directus se levanta en Docker localmente. Las credenciales se definen en `.env`:

```env
DIRECTUS_ADMIN_EMAIL=dt@sygnode.cl
DIRECTUS_ADMIN_PASSWORD=DirectusPass2024
DIRECTUS_API_TOKEN=cfXikJLTQHbJhva5dGXIaH9yFmmSyCVS
```

**Verificación:**
```bash
curl http://localhost:8055/server/health
```
Resultado esperado: `{"status":"ok"}` ✓

**Status:** ⏳ Pendiente (levanta automáticamente con docker-compose)

---

## 🟢 SECCIÓN 6: N8N

**Dónde obtener:** https://n8n.cloud (o instalación local)

**Pasos:**
1. [ ] Crea cuenta en n8n.cloud
2. [ ] Ve a Settings → API Tokens
3. [ ] Genera nuevo token
4. [ ] Copia el token
5. [ ] Pega en `.env`:
   ```
   N8N_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

**Nota:** N8N es opcional para Fase 0. Puede completarse después.

**Status:** ⏳ Pendiente

---

## 🟢 SECCIÓN 7: INFORMACIÓN DEL DOMINIO

**Datos requeridos:**

| Campo | Valor | Status |
|-------|-------|--------|
| **Dominio principal** | pure24nutrition.cl | ⏳ |
| **Subdomain backend** | api.pure24nutrition.cl | ⏳ |
| **Registrador** | Cloudflare / GoDaddy / Otro | ⏳ |
| **DNS apunta a** | Cloudflare / Otro | ⏳ |

**Pega en `.env`:**
```env
VITE_PUBLIC_DOMAIN=pure24nutrition.cl
BACKEND_DOMAIN=api.pure24nutrition.cl
```

**Status:** ⏳ Pendiente

---

## 🟢 SECCIÓN 8: VALIDACIÓN FINAL

**Ejecutar script de validación:**
```bash
bash scripts/validate-config.sh
```

**Resultado esperado:** Todos los checkmarks en VERDE ✅

```
✓ Mercado Pago: Verificado
✓ Google Analytics GA4: Verificado
✓ Cloudflare: Verificado
✓ Directus: Configurado
✓ N8N: Configurado
✓ Dominio: Configurado
✓ Productos: 5+ en data/products.csv
```

**Status:** ⏳ Pendiente

---

## 📋 CHECKLIST FINAL

Marca cuando cada sección esté completa:

```
SECCIÓN 1: Productos
  [ ] Archivo /data/products.csv creado
  [ ] Mínimo 5 productos agregados
  [ ] Todos los campos completados
  [ ] Sin duplicados de SKU

SECCIÓN 2: Mercado Pago
  [ ] Public Key obtenida
  [ ] Access Token obtenida
  [ ] Agregadas a .env
  [ ] Curl de verificación retorna HTTP 200

SECCIÓN 3: Google Analytics GA4
  [ ] Measurement ID obtenido
  [ ] API Secret obtenido
  [ ] Agregados a .env
  [ ] Curl de verificación retorna HTTP 204

SECCIÓN 4: Cloudflare
  [ ] Account ID obtenido
  [ ] API Token obtenido
  [ ] Zone ID obtenido
  [ ] Agregados a .env
  [ ] Curl de verificación retorna success

SECCIÓN 5: Directus
  [ ] Docker levanta sin errores
  [ ] Curl http://localhost:8055/server/health retorna OK

SECCIÓN 6: N8N
  [ ] API Key obtenida (opcional)
  [ ] Agregada a .env (opcional)

SECCIÓN 7: Dominio
  [ ] Dominio principal configurado
  [ ] Subdomain backend configurado
  [ ] Agregados a .env

SECCIÓN 8: Validación
  [ ] bash scripts/validate-config.sh ejecutado
  [ ] Todos los checkmarks en VERDE
  [ ] Ningún ERROR en output
```

---

## ✅ CUANDO ESTÉ COMPLETADO

Una vez todo está en VERDE:

```bash
# Commit los cambios
git add .
git commit -m "chore: Fase 0B completada - datos y credenciales configuradas"

# Avisar que está listo para Fase 1
echo "Fase 0B completada. Listo para Fase 1"
```

Luego ejecutar:
```bash
bash scripts/start-phase-1.sh
```

---

**Estado:** ⏳ EN PROGRESO
**Responsable:** Usuario
**Bloqueante para:** Fase 1 (Knowledge Pack)
