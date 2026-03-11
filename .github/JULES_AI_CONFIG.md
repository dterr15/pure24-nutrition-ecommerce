# Jules AI - Configuración y Directrices

**Última actualización:** 11 Marzo 2026
**Estado:** 🟢 Listo para integración

---

## 1. Acceso y Autenticación

### GitHub Integration
- **Repositorio:** https://github.com/dterr15/pure24-nutrition-ecommerce
- **Rama principal:** `main` (protegida)
- **Rama de desarrollo:** `develop` (para futuros PRs)
- **Permisos Jules AI:** Read/Write (crear branches, commits, PRs)

### Tokens Requeridos
- GitHub Personal Access Token (scope: `repo`, `workflow`)
- Configurar en: https://jules.google.com/settings

---

## 2. Flujo de Trabajo Recomendado

```
┌─────────────────┐
│  GitHub Issue   │ (Creado por usuario o Excel tracker)
│  (labeled:      │
│   maintenance)  │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────┐
│ Jules AI                    │
│ 1. Lee issue                │
│ 2. Crea branch: fix/        │
│ 3. Implementa cambio        │
│ 4. Corre tests locales      │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ GitHub PR (Auto-draft)      │
│ • Descripción automática    │
│ • Links issue               │
│ • Requerimientos de review  │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ Usuario Revisa + Aprueba    │
│ (Merge to main)             │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ GitHub Actions              │
│ • npm run build             │
│ • npm run deploy:cf         │
│ • Cloudflare Pages update   │
└─────────────────────────────┘
```

---

## 3. Tipos de Tareas Permitidas para Jules

### ✅ Tareas PERMITIDAS (sin aprobación previa)
1. **Actualizaciones de productos:** Cambiar precio, descripción, stock en `frontend/src/data/products.ts`
2. **Correcciones de texto:** Ortografía, gramática, contenido en archivos `.ts`, `.md`, `.astro`
3. **Actualizaciones de dependencias:** `npm update` (excepto major versions)
4. **Bugs CSS/layout:** Arreglar estilos en archivos `.css` (no cambiar estructura HTML)
5. **Correción de errores menores:** Valores hardcodeados, configuraciones obvias

### ⚠️ Tareas RESTRINGIDAS (requieren aprobación)
1. **Cambios de arquitectura:** Refactoring grande, mover archivos, cambiar estructura
2. **Nuevas dependencias:** Agregar paquetes npm no autorizados
3. **Cambios de API:** Endpoints, parámetros, response format
4. **Cambios de pago/facturación:** Modificar Mercado Pago, Mailgun, KV storage
5. **Cambios de seguridad:** Variables de entorno, tokens, credenciales
6. **Cambios de deployment:** Modificar wrangler.toml, GitHub Actions

### ❌ Tareas PROHIBIDAS
1. **Borrar archivos o ramas** sin revisión
2. **Forzar push** a main
3. **Modificar tokens o credenciales**
4. **Cambios en .env** o variables de entorno
5. **Deploy directo a producción** sin PR approval

---

## 4. Estándares de Código

### Commits
```bash
# Format: <type>(<scope>): <subject>

# Ejemplos:
feat(products): add new whey protein product
fix(checkout): correct shipping cost calculation
docs(readme): update deployment instructions
style(colors): adjust button hover state
chore(deps): update astro to 4.5.1
```

### Branch Naming
```
feature/add-newsletter-signup
fix/shopping-cart-quantity-bug
docs/update-api-docs
chore/update-dependencies
```

### Pull Requests
- **Descripción automática:** Incluir qué cambió y por qué
- **Cierre automática:** Referenciar issue con `Closes #123`
- **Requiere:** 1 aprobación antes de mergear a main

---

## 5. Testing Local (Antes de PR)

```bash
# 1. Instalar dependencias
npm install

# 2. Desarrollo local
npm run dev
# Visita http://localhost:3000

# 3. Build estático
npm run build

# 4. Preview del build
npm run preview
```

### Validaciones Requeridas
- [ ] Página carga sin errores
- [ ] No hay console warnings/errors
- [ ] Cambio funciona como se describe en issue
- [ ] No rompe funcionalidad existente
- [ ] Responsive en mobile (375px)

---

## 6. Monitoreo y Alertas

Jules AI puede reportar automáticamente:

```yaml
# Issues automáticas que crea Jules
- Console errors en producción
- Build failures
- Broken links (si se implementa verificación)
- Failed API calls
- Mercado Pago webhook errors
- Mailgun delivery failures
```

**Configuración:** Habilitar en panel de Jules → Monitoring

---

## 7. Inventario y Actualizaciones de Precio

### Workflow Sugerido

**Fuente de datos:** Excel (Google Sheets o local)

**Proceso:**
1. Usuario actualiza Excel con precios/stock nuevos
2. Usuario crea GitHub Issue de tipo `update-product`
3. Jules AI lee issue, actualiza `frontend/src/data/products.ts`
4. Jules AI crea PR automático
5. Usuario aprueba + mergea
6. Deploy automático a Cloudflare Pages

**Ejemplo Issue para Jules:**
```markdown
Title: UPDATE: Whey Protein Gold Standard

Producto a Actualizar: Whey Protein Gold Standard
Campo(s) a Cambiar: Precio
Valor Anterior: $45,990 CLP
Valor Nuevo: $42,990 CLP
Fuente: Excel_Inventario_Pure24.xlsx (Marzo 2026, actualizado)
```

---

## 8. Error Tracking y User Interaction

### Métodos para Trackear Errores

**Opción 1: Sentry Integration** (Recomendado)
```typescript
// En frontend/src/layouts/Layout.astro
import * as Sentry from "@sentry/astro";

Sentry.init({
  dsn: "https://[key]@sentry.io/[project]",
  tracesSampleRate: 1.0,
});
```

**Opción 2: Custom Error Logger**
```typescript
// frontend/src/lib/error-logger.ts
export async function logError(error: Error, context: string) {
  await fetch('/api/log-error', {
    method: 'POST',
    body: JSON.stringify({ error: error.message, context })
  });
}
```

**Opción 3: Browser Console Monitor** (Simple)
```typescript
// Capturar console.error en JavaScript
window.addEventListener('error', (e) => {
  // Crear GitHub Issue automáticamente
  fetch('/api/create-issue-from-error', {
    method: 'POST',
    body: JSON.stringify({
      title: `BUG: ${e.message}`,
      labels: ['auto-reported'],
      body: `Error en: ${e.filename}:${e.lineno}`
    })
  });
});
```

---

## 9. Integración Inicial (Pasos)

1. **Autenticarse en Jules AI**
   - Ir a https://jules.google.com
   - Conectar GitHub (OAuth)
   - Seleccionar repositorio: `pure24-nutrition-ecommerce`

2. **Configurar Permisos**
   - ✅ Read issues
   - ✅ Create branches
   - ✅ Commit and push
   - ✅ Create pull requests
   - ❌ Merge (requiere approval)
   - ❌ Delete branches

3. **Primer Test**
   - Crear issue: "UPDATE: Test Whey Protein Price"
   - Asignar a Jules
   - Observar PR automático
   - Aprobar y mergear manualmente

4. **Habilitar Automático**
   - Una vez probado, configurar webhooks
   - Issues con label `maintenance` → asignar automáticamente a Jules
   - Jules responde dentro de 5-15 minutos

---

## 10. Dashboard de Monitoreo

**URL del Dashboard:** https://jules.google.com/projects/pure24-nutrition

Métricas disponibles:
- PRs creados por Jules
- Issues resueltos
- Tiempo promedio de resolución
- Tasas de éxito (aprobación/merge)
- Errores reportados automáticamente

---

## 11. Escalabilidad Futura

### Cuando agregar más tareas:
- Agregar nuevo tipo de issue template en `.github/ISSUE_TEMPLATE/`
- Documentar en sección "Tipos de Tareas Permitidas"
- Informar a Jules (actualizar instrucciones en issue)

### Integraciones adicionales:
- **Directus API:** Cuando esté en producción
- **Shopify/WooCommerce:** Si se migra a plataforma
- **Slack notifications:** Para alertas en tiempo real
- **Datadog/New Relic:** Para APM monitoring

---

## 12. Contacto y Soporte

**Issues de Jules:** https://github.com/dterr15/pure24-nutrition-ecommerce/issues?q=assignee:jules

**Troubleshooting:**
- Jules no responde → Verificar GitHub token en https://jules.google.com/settings
- PR no mergea → Revisar branch protection rules en Settings → Branches
- Build falla → Revisar logs en GitHub Actions → Workflows

---

**Creado por:** Claude Agent
**Para:** Pure24 Nutrition E-commerce
**Revisado por:** [Usuario]
**Próxima revisión:** Junio 2026
