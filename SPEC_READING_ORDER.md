# 📋 SPEC — READING ORDER GENERATION

**Propósito:** Guía para generar automáticamente `00_READING_ORDER.md` que mapee el Knowledge Pack completo

**Estado:** SPEC CREADA — Listo para usar cuando Knowledge Pack esté terminado
**Creado:** 8 de Marzo de 2026
**Versión:** 1.0

---

## 🎯 OBJETIVO

Crear un archivo `docs/00_READING_ORDER.md` que:
1. Mapee TODOS los archivos del Knowledge Pack (~200MB, 25+ archivos)
2. Defina orden de lectura crítico para Claude Opus
3. Facilite ingesta completa sin omisiones
4. Valide completitud del Knowledge Pack

---

## 📁 ESTRUCTURA DEL ARCHIVO GENERADO

### Header — Metadata
```markdown
# 📖 KNOWLEDGE PACK READING ORDER

**Proyecto:** Pure24 Nutrition E-commerce
**Versión:** 1.0
**Fecha generada:** [AUTO: fecha actual]
**Tamaño total:** ~200MB
**Archivos incluidos:** 25+
**Estado:** ✅ Completo / ⚠️ Incompleto
```

### Secciones Principales
1. **FASE 1 — FUNDAMENTOS (LECTURA OBLIGATORIA)**
   - Archivos básicos que Opus DEBE leer primero
   - Establecen contexto y visión

2. **FASE 2 — CONTRATOS (LECTURA OBLIGATORIA)**
   - Especificaciones técnicas detalladas
   - Definiciones de datos y APIs

3. **FASE 3 — DISEÑO (LECTURA RECOMENDADA)**
   - Especificaciones UI/UX
   - Prompts engineering

4. **FASE 4 — GEO & OPTIMIZACIÓN (LECTURA RECOMENDADA)**
   - SEO, Performance, Deployment
   - Decisiones arquitectónicas

5. **ARCHIVOS GENERADOS EN SESIÓN (REFERENCIA)**
   - Código implementado
   - Datos producidos

6. **INSTRUCCIÓN PARA OPUS**
   - Cómo usar el Knowledge Pack
   - Confirmación de lectura

7. **VALIDACIÓN DE COMPLETITUD**
   - Checklist automatizado

---

## 📋 INFORMACIÓN POR ARCHIVO

Cada entry debe incluir:

```markdown
### [X.Y] Título Archivo
- **Archivo:** `path/relativo/archivo.ext`
- **Descripción:** [Una línea clara de qué contiene]
- **Tamaño:** [Auto-detectado en KB/MB]
- **Dependencias:** Requiere [X.1], [X.2] / Ninguna
- **Fase:** [1-4]
- **Prioridad:** CRÍTICA / RECOMENDADA / OPCIONAL
- **Validación:** ✅ Existe / ❌ Falta / ⚠️ Incompleto / 📝 Generado esta sesión
- **Contenido clave:** [2-3 bullets de qué buscar]
```

---

## 🗂️ FASE 1 — FUNDAMENTOS (LECTURA OBLIGATORIA)

### [1.1] Project Manifest
- Archivo: `KNOWLEDGE_PACK_MANIFEST.md` (CREAR si no existe)
- Descripción: Visión del proyecto, objetivos, stack, restricciones
- Tamaño: ~5-10 KB
- Dependencias: Ninguna (LEER PRIMERO)
- Fase: 1
- Prioridad: CRÍTICA
- Validación: ✅ Existe / ❌ Falta
- Contenido clave:
  - Visión del proyecto Pure24
  - Stack técnico (Astro, TypeScript, CSS)
  - Restricciones y objetivos
  - Fases del desarrollo

### [1.2] Domain Model
- Archivo: `docs/DOMAIN_MODEL.md` (CREAR si no existe)
- Descripción: Entidades de negocio (productos, usuarios, pedidos, transacciones)
- Tamaño: ~8-12 KB
- Dependencias: Requiere [1.1]
- Fase: 1
- Prioridad: CRÍTICA
- Validación: ✅ Existe / ❌ Falta
- Contenido clave:
  - Productos (Recovery, Hydration, Immunity)
  - Usuarios y segmentación
  - Transacciones y pagos
  - Relaciones entre entidades

### [1.3] Content Architecture
- Archivo: `docs/CONTENT_ARCHITECTURE.md` (CREAR si no existe)
- Descripción: Jerarquía de contenido, secciones, taxonomía
- Tamaño: ~6-10 KB
- Dependencias: Requiere [1.1], [1.2]
- Fase: 1
- Prioridad: CRÍTICA
- Validación: ✅ Existe / ❌ Falta
- Contenido clave:
  - Estructura de páginas
  - Jerarquía de información
  - Taxonomía de contenido
  - Flujos de usuario

---

## 📋 FASE 2 — CONTRATOS (LECTURA OBLIGATORIA)

### [2.1] JSON Contract
- Archivo: `docs/JSON_CONTRACT.md` (CREAR si no existe)
- Descripción: Estructura de datos (productos, usuarios, FAQs, respuestas API)
- Tamaño: ~15-20 KB
- Dependencias: Requiere [1.1], [1.2]
- Fase: 2
- Prioridad: CRÍTICA
- Validación: ✅ Existe / ❌ Falta
- Contenido clave:
  - Schemas JSON para cada entidad
  - Tipos TypeScript
  - Validaciones de datos
  - Ejemplos de respuestas

### [2.2] Design Tokens
- Archivo: `src/styles/main.css` O `docs/DESIGN_TOKENS.md`
- Descripción: Sistema de variables CSS (colores, tipografía, espaciado)
- Tamaño: ~15-20 KB
- Dependencias: Requiere [1.1]
- Fase: 2
- Prioridad: CRÍTICA
- Validación: ✅ Existe / ❌ Falta
- Contenido clave:
  - 50+ variables CSS
  - Paleta de colores (primario, secundario, neutral)
  - Sistema de espaciado
  - Tipografía (headers, body, code)

### [2.3] API Contracts
- Archivo: `docs/API_CONTRACTS.md` (CREAR si no existe)
- Descripción: Especificación de endpoints REST (request/response)
- Tamaño: ~12-18 KB
- Dependencias: Requiere [2.1]
- Fase: 2
- Prioridad: CRÍTICA
- Validación: ✅ Existe / ❌ Falta
- Contenido clave:
  - GET /products
  - POST /orders
  - GET /dosage-info
  - POST /calculate-dose
  - Formatos de request/response

### [2.4] CMS Schema
- Archivo: `docs/CMS_SCHEMA.sql` (CREAR si no existe)
- Descripción: Schema de base de datos (PostgreSQL con Directus)
- Tamaño: ~10-15 KB
- Dependencias: Requiere [2.1]
- Fase: 2
- Prioridad: CRÍTICA
- Validación: ✅ Existe / ❌ Falta
- Contenido clave:
  - CREATE TABLE statements
  - Relaciones (foreign keys)
  - Índices
  - Documentación de campos

### [2.5] Golden Rules
- Archivo: `docs/GOLDEN_RULES.md` (CREAR si no existe)
- Descripción: Reglas de negocio críticas (dosificación, precios, validaciones)
- Tamaño: ~8-12 KB
- Dependencias: Requiere [1.2]
- Fase: 2
- Prioridad: CRÍTICA
- Validación: ✅ Existe / ❌ Falta
- Contenido clave:
  - Fórmulas de dosificación (recuperación, hidratación, inmunidad)
  - Validaciones de peso (50-150 kg)
  - Límites de dosis máximas
  - Reglas de pricing

---

## 🎨 FASE 3 — DISEÑO (LECTURA RECOMENDADA)

### [3.1] UI Specification
- Archivo: `docs/UI_SPECIFICATION.md` (CREAR si no existe)
- Descripción: Especificaciones de componentes visuales (buttons, cards, forms)
- Tamaño: ~15-25 KB
- Dependencias: Requiere [2.2] (Design Tokens)
- Fase: 3
- Prioridad: RECOMENDADA
- Validación: ✅ Existe / ❌ Falta
- Contenido clave:
  - Componentes (Button, Card, Form, Modal)
  - Estados (default, hover, active, disabled)
  - Responsive behavior
  - Accesibilidad (WCAG 2.1 AA)

### [3.2] Prompt Engineering
- Archivo: `docs/PROMPT_ENGINEERING.md` (CREAR si no existe)
- Descripción: Guía de cómo escribir prompts efectivos para generar código
- Tamaño: ~8-12 KB
- Dependencias: Requiere [1.1], [2.1]
- Fase: 3
- Prioridad: RECOMENDADA
- Validación: ✅ Existe / ❌ Falta
- Contenido clave:
  - Estructura de prompts efectivos
  - Ejemplos de prompts que funcionan
  - Cómo especificar requisitos
  - Validación de output

---

## 🚀 FASE 4 — GEO & OPTIMIZACIÓN (LECTURA RECOMENDADA)

### [4.1] Acceptance Tests
- Archivo: `docs/ACCEPTANCE_TESTS.md` (CREAR si no existe)
- Descripción: Tests de aceptación (scenarios, casos de uso, validaciones)
- Tamaño: ~12-18 KB
- Dependencias: Requiere [1.2], [2.5]
- Fase: 4
- Prioridad: RECOMENDADA
- Validación: ✅ Existe / ❌ Falta
- Contenido clave:
  - User stories
  - Escenarios de prueba
  - Criterios de aceptación
  - Edge cases

### [4.2] SEO & GEO Blueprint
- Archivo: `docs/SEO_GEO_BLUEPRINT.md` (CREAR si no existe)
- Descripción: Estrategia de SEO (schema.org) y GEO (optimización para AI engines)
- Tamaño: ~12-20 KB
- Dependencias: Requiere [1.1], [2.1]
- Fase: 4
- Prioridad: RECOMENDADA
- Validación: ✅ Existe / ❌ Falta
- Contenido clave:
  - Schema.org markup (Product, LocalBusiness, FAQPage)
  - Keywords strategy
  - GEO optimization (para ChatGPT, Perplexity)
  - Core Web Vitals

### [4.3] Architecture Decisions
- Archivo: `docs/ARCHITECTURE_DECISIONS.md` (CREAR si no existe)
- Descripción: Decisiones arquitectónicas (ADRs) y justificaciones
- Tamaño: ~10-15 KB
- Dependencias: Requiere [1.1], [2.1]
- Fase: 4
- Prioridad: RECOMENDADA
- Validación: ✅ Existe / ❌ Falta
- Contenido clave:
  - Por qué Astro (vs Next, Nuxt)
  - Por qué Cloudflare Pages
  - Por qué Directus CMS
  - Trade-offs y alternativas

### [4.4] Deployment Guide
- Archivo: `docs/DEPLOYMENT_GUIDE.md` (CREAR si no existe)
- Descripción: Instrucciones de deployment a Cloudflare, monitoring, CI/CD
- Tamaño: ~10-15 KB
- Dependencias: Requiere [2.3], [4.3]
- Fase: 4
- Prioridad: RECOMENDADA
- Validación: ✅ Existe / ❌ Falta
- Contenido clave:
  - Deploy a Cloudflare Pages
  - Environment variables
  - CI/CD pipeline
  - Monitoring y alertas

---

## 💾 ARCHIVOS GENERADOS EN SESIÓN (REFERENCIA)

### Frontend — Pages
- **Archivo:** `src/pages/index.astro` (847 líneas)
- **Descripción:** Homepage con 8 secciones + MESSAGE LAB copy
- **Tamaño:** ~30 KB
- **Estado:** ✅ 100% Completo
- **Contenido clave:** Hero, Value Props, Foundation, CTA, Social Proof, FAQ, Footer

### Frontend — Componentes Astro
| Archivo | Líneas | Status |
|---------|--------|--------|
| `src/components/OptimizedImage.astro` | 85 | ✅ |
| `src/components/ProductSchema.astro` | 92 | ✅ |
| `src/components/LocalBusinessSchema.astro` | 68 | ✅ |
| `src/components/ServiceSchema.astro` | 64 | ✅ |
| `src/components/FAQSchema.astro` | 156 | ✅ |
| `src/components/DosageCalculator.astro` | 312 | ✅ |
| `src/components/ComparisonTable.astro` | 428 | ✅ |

### Frontend — TypeScript/JavaScript
| Archivo | Líneas | Status |
|---------|--------|--------|
| `src/lib/calcs.ts` | 140 | ✅ |
| `src/lib/imageOptimizer.ts` | 85 | ✅ |
| `src/data/faqs.ts` | 385 | ✅ |

### Frontend — Estilos
- **Archivo:** `src/styles/main.css` (680 líneas)
- **Descripción:** Design tokens + componentes responsive
- **Status:** ✅ 100% Completo

### Datos & Configuración
| Archivo | Tamaño | Status |
|---------|--------|--------|
| `public/data/productos.json` | 35 KB | ✅ |
| `astro.config.mjs` | 46 líneas | ✅ |
| `package.json` | ~50 líneas | ✅ |
| `_headers` | ~30 líneas | ✅ |

### Documentación Generada
| Archivo | Status |
|---------|--------|
| `KNOWLEDGE_PACK_MANIFEST.md` | ✅ |
| `RESUMEN_FINAL_FASE_1.txt` | ✅ |
| `PREVIEW_LOCAL.md` | ✅ |
| `FASE_2_COMPLETADA.md` | ✅ |
| `SERVIDOR_ACTIVO.txt` | ✅ |
| `ESTADO_PROYECTO.txt` | ✅ |

---

## 📖 INSTRUCCIÓN PARA CLAUDE OPUS

Cuando uses el Knowledge Pack con Opus:

### 1. Orden de Lectura
```
FASE 1 (Fundamentos):
[1.1] Project Manifest ← EMPIEZA AQUÍ
[1.2] Domain Model
[1.3] Content Architecture

FASE 2 (Contratos):
[2.1] JSON Contract
[2.2] Design Tokens
[2.3] API Contracts
[2.4] CMS Schema
[2.5] Golden Rules

FASE 3 (Diseño):
[3.1] UI Specification
[3.2] Prompt Engineering

FASE 4 (Optimización):
[4.1] Acceptance Tests
[4.2] SEO & GEO Blueprint
[4.3] Architecture Decisions
[4.4] Deployment Guide

REFERENCIA:
- Archivos generados en sesión
- Código Astro implementado
```

### 2. Protocolo de Confirmación
```
Opus debería responder:

"✅ LEÍDO [1.1] Project Manifest
  - Entendido: [resumen de 2-3 puntos clave]

✅ LEÍDO [1.2] Domain Model
  - Entendido: [resumen]

...

✅ FASES 1 y 2 COMPLETADAS — LISTO PARA GENERAR CÓDIGO"
```

### 3. Regla de Implementación
```
⚠️ IMPORTANTE:

Opus SOLO debe generar código DESPUÉS de:
- Completar lectura FASE 1 completa
- Completar lectura FASE 2 completa
- Confirmar comprensión de cada sección
- Hacer preguntas si algo no está claro

No saltarse pasos = Código de mejor calidad
```

---

## ✅ VALIDACIÓN DE COMPLETITUD

Cuando Claude Code genere `00_READING_ORDER.md`, debe validar:

### Checklist Automatizado
```
FASE 1:
  [ ] ¿Existe KNOWLEDGE_PACK_MANIFEST.md?
  [ ] ¿Existe docs/DOMAIN_MODEL.md?
  [ ] ¿Existe docs/CONTENT_ARCHITECTURE.md?

FASE 2:
  [ ] ¿Existe docs/JSON_CONTRACT.md?
  [ ] ¿Existe docs/DESIGN_TOKENS.md o src/styles/main.css?
  [ ] ¿Existe docs/API_CONTRACTS.md?
  [ ] ¿Existe docs/CMS_SCHEMA.sql?
  [ ] ¿Existe docs/GOLDEN_RULES.md?

FASE 3:
  [ ] ¿Existe docs/UI_SPECIFICATION.md?
  [ ] ¿Existe docs/PROMPT_ENGINEERING.md?

FASE 4:
  [ ] ¿Existe docs/ACCEPTANCE_TESTS.md?
  [ ] ¿Existe docs/SEO_GEO_BLUEPRINT.md?
  [ ] ¿Existe docs/ARCHITECTURE_DECISIONS.md?
  [ ] ¿Existe docs/DEPLOYMENT_GUIDE.md?

GENERADOS:
  [ ] ¿Existe src/pages/index.astro?
  [ ] ¿Existen componentes en src/components/?
  [ ] ¿Existen librerías en src/lib/?
  [ ] ¿Existen datos en public/data/?
```

### Validación de Tamaño
```
Tamaño mínimo esperado:
- FASE 1: 20+ KB
- FASE 2: 60+ KB
- FASE 3: 20+ KB
- FASE 4: 40+ KB
- GENERADOS: 500+ KB
- TOTAL: ~200+ MB (con node_modules)
```

### Validación de Dependencias
```
Verificar que:
- [1.2] depende de [1.1] ✓
- [2.1] depende de [1.1], [1.2] ✓
- [2.3] depende de [2.1] ✓
- [3.1] depende de [2.2] ✓
- [4.2] depende de [1.1], [2.1] ✓
```

---

## 📝 FORMATO DE OUTPUT

El archivo `00_READING_ORDER.md` generado debe ser:

✅ **Legible:** Fácil de escanear y entender
✅ **Completo:** Mapea TODOS los archivos
✅ **Validado:** Verifica existencia y completitud
✅ **Actualizable:** Se puede editar manualmente después
✅ **Machine-readable:** Puede ser parseado por scripts
✅ **Opus-friendly:** Instrucciones claras para el modelo

---

## 🔄 CUÁNDO USAR ESTE SPEC

**Usar este spec cuando:**
1. ✅ Knowledge Pack tenga 25+ archivos
2. ✅ Todas las FASES estén completadas (1, 2, 3, 4)
3. ✅ Estés listo para generar código en FASE 3 (Backend)
4. ✅ Necesites que Opus tenga contexto COMPLETO

**Workflow:**
```
1. Terminar todos los documentos de FASE 1-4
2. Ejecutar: "Genera 00_READING_ORDER.md usando SPEC_READING_ORDER.md"
3. Claude Code genera 00_READING_ORDER.md automáticamente
4. Verifica checklist de completitud
5. Listo para pasar Knowledge Pack a Opus
```

---

## 🎯 PRÓXIMO PASO

**RECORDATORIO PARA TI:**

Cuando hayas terminado todos los documentos de FASE 1-4 y quieras pasar el Knowledge Pack completo a Claude Opus, usa el prompt que incluye este spec:

```
"Necesito que generes un spec técnico para un archivo 00_READING_ORDER.md
que mapee completamente nuestro Knowledge Pack de Pure24 Nutrition..."
```

**Este archivo (`SPEC_READING_ORDER.md`) es la guía que Claude Code usará para generar automáticamente el Reading Order.**

---

**Estado:** SPEC CREADO Y LISTO ✅
**Próximo paso:** Usar cuando Knowledge Pack esté 100% completado
**Creado:** 8 de Marzo de 2026
**Versión:** 1.0
