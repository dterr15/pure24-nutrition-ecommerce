# 🚀 Jules AI - Guía de Setup y Primer Test

**Fecha:** 11 Marzo 2026
**Objetivo:** Configurar mantenimiento autónomo con Jules AI (Google Gemini 2.5 Pro)

---

## Resumen Ejecutivo

Jules AI es un agente autónomo creado por Google que puede:
- Leer GitHub Issues
- Entender requisitos
- Hacer cambios en código
- Crear Pull Requests automáticas
- Reportar errores en tiempo real

Para Pure24 Nutrition, Jules manejará:
- ✅ Actualizar precios de productos
- ✅ Agregar productos nuevos
- ✅ Corregir bugs CSS/layout
- ✅ Corregir errores ortográficos
- ✅ Reportar errores en producción

---

## PARTE 1: Configuración Inicial (15 minutos)

### Paso 1: Acceder a Jules AI

1. Abre tu navegador: https://jules.google.com
2. Haz clic en **"Sign in with Google"**
3. Usa tu cuenta Google (la misma del Proyecto)
4. Espera a que cargue el dashboard

### Paso 2: Conectar GitHub

1. En Jules AI Dashboard, busca **"Connect Repository"** o similar
2. Haz clic en **"GitHub"**
3. Autoriza a Jules: da permisos de lectura/escritura
4. Selecciona repositorio: **`dterr15/pure24-nutrition-ecommerce`**
5. Confirma la conexión

**Permisos que vamos a dar:**
- ✅ Read repositories
- ✅ Write repositories (crear branches, commits, PRs)
- ✅ Manage pull requests

**Permisos que NO daremos:**
- ❌ Delete repositories
- ❌ Manage deployments (lo hace el pipeline automático)

### Paso 3: Validar Conexión

```bash
# En tu terminal local
cd C:\Users\danie\pure24-nutrition-ecommerce

# Verifica que tu repo está correctamente configurado
git remote -v
# Debería mostrar:
# origin  https://github.com/dterr15/pure24-nutrition-ecommerce.git (fetch)
# origin  https://github.com/dterr15/pure24-nutrition-ecommerce.git (push)
```

---

## PARTE 2: Configurar Branch Protection (5 minutos)

Para asegurar que Jules crea PRs pero no hace deploy sin aprobación:

1. Ve a GitHub: https://github.com/dterr15/pure24-nutrition-ecommerce
2. Settings → Branches → Branch protection rules
3. Haz clic en **"Add rule"**
4. Pattern: `main`
5. Configura:
   - ✅ Require a pull request before merging
   - ✅ Require status checks to pass before merging
   - ❌ Require approvals (lo harás manualmente)
   - ✅ Require branches to be up to date before merging

6. Click **"Create"**

---

## PARTE 3: Primer Test (30 minutos)

### Paso 1: Crear Issue de Prueba

Vamos a crear un issue sencillo para probar que Jules funciona:

**En GitHub:**
1. Ve a https://github.com/dterr15/pure24-nutrition-ecommerce/issues
2. Click **"New Issue"**
3. Selecciona template: **"🛍️ Actualizar Producto"**
4. Completa así:

```
Nombre del Producto: Whey Protein Gold Standard
SKU/ID: whey-gs-1

Campo(s) a Cambiar:
- [x] Precio (CLP)

Valor Anterior:
$45,990

Valor Nuevo:
$42,990

Fuente de la Información:
- [x] Excel de inventario (adjunto)

Instrucciones para Jules AI:
[Dejar por defecto]

Notas Adicionales:
Precio reducido por promoción de marzo 2026.
Vigente hasta fin de mes.
```

5. **Título:** `UPDATE: Whey Protein Gold Standard - Precio Marzo 2026`
6. **Labels:** `maintenance`, `product-update`
7. Click **"Submit new issue"**

### Paso 2: Asignar Issue a Jules

1. En el issue, busca el panel derecho
2. Bajo "Assignees", haz clic en **"assign"**
3. Busca o selecciona: **Jules** (o como se llame en tu instalación)
4. Confirma asignación

**Alternativa:** Agregar comentario
```
@jules-ai analyze and create PR for this task
```

### Paso 3: Observar a Jules en Acción

Jules debería:
1. **Dentro de 2-5 minutos:** Leer el issue
2. **Luego:** Crear una rama llamada `fix/update-whey-gs-1`
3. **Luego:** Editar `frontend/src/data/products.ts`
4. **Luego:** Hacer commit: `fix(products): update Whey Protein Gold Standard price`
5. **Finalmente:** Crear PR automático

**¿Dónde verlo?**
- Observa el issue → verás comentario de Jules: "Creating PR for this issue..."
- Ve a Pull Requests: https://github.com/dterr15/pure24-nutrition-ecommerce/pulls
- Busca PR con título similar a: "fix(products): update Whey Protein Gold Standard price"

### Paso 4: Revisar y Aprobar PR

Cuando Jules cree el PR:

1. Abre el PR
2. Click en **"Files Changed"**
3. Verifica que el cambio es correcto:
   - El precio cambió de 45990 a 42990 ✅
   - No hay cambios involuntarios ✅
   - Líneas de contexto muestran el producto correcto ✅

4. Si todo está bien:
   - Click **"Review changes"** → **"Approve"**
   - Click **"Merge pull request"**
   - Confirma con **"Confirm merge"**

5. **Automáticamente:**
   - GitHub Actions ejecuta `npm run build`
   - Luego ejecuta `npm run deploy:cf`
   - En 2-3 minutos, el sitio se actualiza en Cloudflare Pages

### Paso 5: Validar Cambio en Producción

1. Ve a https://4bf35764.pure24nutrition.pages.dev/productos/whey-gs-1
2. Verifica que el precio ahora es **$42,990 CLP**
3. ¡Éxito! 🎉

---

## PARTE 4: Configurar Tareas Automáticas (Opcional)

Si quieres que Jules reaccione automáticamente a issues sin necesidad de asignación manual:

1. En Jules AI Dashboard, busca **"Automation Rules"** o **"Webhooks"**
2. Crea una regla:
   ```
   Trigger: GitHub issue created with label "maintenance"
   Action: Assign to Jules AI
   Action: Add comment: "I'll work on this right away!"
   ```

3. Otra regla:
   ```
   Trigger: GitHub issue closed
   Action: Jules summarizes what was done
   ```

---

## PARTE 5: Flujo Operativo Semanal

Una vez configurado, el flujo será así:

### Opción A: Desde Excel (Recomendado para ti)
```
Lunes:
1. Revisar Excel de inventario con nuevos precios/productos
2. Crear un GitHub Issue por cada cambio (copy-paste desde Excel)
3. Etiquetar con "maintenance"
4. Jules hace todo automáticamente
5. Revisar + aprobar PRs (5 min por PR)

Miércoles:
1. Si hay bugs reportados, crear issue con template "🐛 Reportar Bug"
2. Jules arregla durante el día
3. Revisar PR + mergear

Viernes:
1. Review general de cambios
2. Verificar sitio en producción
```

### Opción B: Desde Gmail/Slack
- Forwarding automático de feedback de clientes → GitHub Issues
- Jules reacciona automáticamente

---

## PARTE 6: Monitoreo de Errores en Tiempo Real

Para que Jules reporte errores automáticamente de producción:

### Opción 1: Sentry (Recomendado)

Instalar Sentry:
```bash
cd C:\Users\danie\pure24-nutrition-ecommerce
npm install @sentry/astro
```

En `frontend/src/layouts/Layout.astro`:
```typescript
import * as Sentry from "@sentry/astro";

Sentry.init({
  dsn: "https://[YOUR_DSN]@sentry.io/[PROJECT_ID]",
  environment: "production",
  tracesSampleRate: 1.0,
});
```

Luego:
1. Ve a https://sentry.io
2. Conecta con GitHub
3. Habilita "Create GitHub Issues on error"
4. Jules verá automáticamente esos issues

### Opción 2: Mailgun + Custom Logger (Simple)

En `functions/api/checkout.js` (y otros endpoints):
```javascript
// Si hay error
await fetch('https://api.github.com/repos/dterr15/pure24-nutrition-ecommerce/issues', {
  method: 'POST',
  headers: {
    'Authorization': `token ${GITHUB_TOKEN}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: `[AUTO] Payment Processing Error: ${error.message}`,
    body: `Error in /api/checkout at ${new Date().toISOString()}\n\n${error.stack}`,
    labels: ['auto-reported', 'bug', 'critical']
  })
});
```

---

## PARTE 7: Casos de Uso Reales

### Caso 1: Actualizar Precio por Promoción

**Martes 9am:** Recibiste email con nueva lista de precios

```markdown
# GitHub Issue

Title: UPDATE: Precio Promocional - Abril 2026

Producto a Actualizar:
- Creatina Monohidrato (SKU: creatina-mono)
- Precio Actual: $28,990
- Precio Nuevo: $24,990

Fuente: Email promoción abril.pdf
```

**Martes 9:15am:** Jules crea PR automáticamente
**Martes 10am:** Revisas PR (2 minutos), apruebas + mergeas
**Martes 10:05am:** Sitio actualizado en producción ✅

### Caso 2: Reportar Bug

Un cliente te reporta por WhatsApp:
> "El carrito no se vacía cuando hago checkout"

**Miércoles 2pm:** Creas issue

```markdown
Title: BUG: Shopping cart no se vacía después de checkout

Descripción:
Después de completar pago en Mercado Pago, el carrito
sigue mostrando los productos anteriores.

Pasos para reproducir:
1. Agregar producto al carrito
2. Click "Proceder al pago"
3. Completar pago en Mercado Pago
4. Volver a /confirmacion
5. BUG: El carrito sigue mostrando productos

Archivo involucrado: frontend/src/lib/cart.ts
```

**Miércoles 2:15pm:** Jules analiza e identifica problema
```
// En confirmacion.astro, línea 138:
// localStorage.removeItem('pure24_cart_v1') ✅ (correcto)
// Pero sessionStorage no se limpia → Bug encontrado
```

**Miércoles 2:30pm:** Jules crea PR con fix
**Miércoles 3pm:** Revisas, apruebas, mergeas
**Miércoles 3:05pm:** Fix en producción

### Caso 3: Agregar Producto Nuevo

**Lunes 10am:** Nuevo producto llega a bodega

```markdown
Title: ADD: Aminoácidos BCAA Premium

Nombre: BCAA Premium Powder
SKU: bcaa-premium
Categoría: Aminoácidos
Precio: $35,990 CLP
Stock: 50 unidades

Descripción:
BCAA (Leucina, Isoleucina, Valina) en relación 2:1:1.
Optimo para síntesis proteica durante entrenamiento.

[imagen attachada]
```

**Lunes 10:30am:** Jules crea nuevo entry en products.ts + imagen optimizada + SSG page
**Lunes 11am:** PR está lista para revisión
**Lunes 11:30am:** Apruebas + mergeas
**Lunes 12pm:** Producto aparece en /productos/bcaa-premium ✅

---

## PARTE 8: Troubleshooting

### Problema: Jules no responde dentro de 5 minutos

**Solución:**
1. Verifica que el GitHub token en Jules es válido
   - Va a Jules settings → GitHub
   - Desconecta y vuelve a conectar
2. Verifica el issue tiene título y descripción clara
3. Probablemente Jules está procesando otro PR

### Problema: PR de Jules tiene conflictos de merge

**Solución:**
1. Jules automáticamente hará un rebase
2. Si persiste, comunica en comentario: "@jules-ai rebase on main"
3. Jules actualizará la rama

### Problema: Build falla después de mergear PR de Jules

**Solución:**
1. Abre GitHub Actions: https://github.com/dterr15/pure24-nutrition-ecommerce/actions
2. Click en workflow fallido
3. Leer los logs
4. Crear issue: "BUG: Build failure - [error message]"
5. Jules investigará automáticamente

### Problema: Quiero que Jules cancele un PR

**Solución:**
En el PR, comenta:
```
@jules-ai close this PR, this issue is no longer needed
```

Jules cerrará el PR automáticamente.

---

## PARTE 9: Próximos Pasos

Una vez completado el test:

1. ✅ Confirmar que primer test funcionó
2. ✅ Habilitar automático (sin asignar manualmente)
3. ✅ Crear plantilla Excel para inventario
4. ✅ Configurar Sentry para error tracking
5. ⏭️ Documentar en el equipo
6. ⏭️ Ejecutar pruebas de producción

---

## Soporte y Recursos

**Documentación Jules AI:**
- https://support.google.com/google-cloud/answer/13379185 (si existe)
- Documentación dentro de https://jules.google.com

**GitHub Docs:**
- https://docs.github.com/en/repositories

**Pure24 Nutrition Docs:**
- `.github/JULES_AI_CONFIG.md` (directrices completas)
- `.github/ISSUE_TEMPLATE/` (plantillas por tipo de tarea)

---

**Creado por:** Claude Agent
**Para:** Pure24 Nutrition E-commerce
**Fecha:** 11 Marzo 2026
**Estado:** 🟢 Listo para implementación
