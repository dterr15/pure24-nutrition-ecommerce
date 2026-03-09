# ÍNDICE MANUAL OPUS - LÍNEA DE PRODUCCIÓN COMPLETA

**Versión:** 2.0
**Fecha:** 9 de Marzo 2026
**Audiencia:** Claude Opus
**Objetivo:** Guía paso-a-paso para implementar sistema e-commerce Pure24 Nutrition

---

## 📋 ESTRUCTURA DEL MANUAL

### PARTE 1: FUNDAMENTOS + FASE 1-3

**Archivo:** `MANUAL_IMPLEMENTACION_LINEA_PRODUCCION_OPUS.md`

#### Contenido:

1. **Visión General** (5 min)
   - Stack técnico
   - Fases y timeline
   - Diagrama de arquitectura

2. **Requisitos Previos** (10 min)
   - Información requerida del usuario
   - Credenciales a recopilar
   - Ambiente local necesario

3. **FASE 0: Pre-Producción** (1.5h)
   - 0.1: Preparar infraestructura base
   - 0.2: Validar datos de entrada
   - 0.3: Validar credenciales
   - GATE 0: Checklist de validación

4. **FASE 1: Technical SEO** (2.5h)
   - 1.1: Crear Design Token System
   - 1.2: HTML semántico
   - 1.3: Core Web Vitals
   - 1.4: Brotli Compression
   - GATE 1: Validación completa

5. **FASE 1.2: Message Lab** (3.5h)
   - 1.2.1: Sesión 30 min (5 preguntas)
   - Frameworks: AIDA, PAS, StoryBrand, BAB, FAB
   - Copy refinado por sección
   - Validación con cliente
   - GATE 1.2: Checklist aprobación

6. **FASE 2: GEO & AI Optimization** (2.5h)
   - 2.1: JSON-LD Product Schema
   - 2.2: FAQ Schema
   - 2.3: Information Gain (datos únicos)
   - 2.4: Quote-Bait (micro-respuestas)
   - GATE 2: Validación estructura

7. **FASE 3: Local SEO** (2.5h)
   - 3.1: NAP sincronización
   - 3.2: EXIF en imágenes
   - 3.3: Grafo de landmarks
   - GATE 3: Validación local SEO

---

### PARTE 2: FASE 4-7 + TROUBLESHOOTING

**Archivo:** `MANUAL_IMPLEMENTACION_LINEA_PRODUCCION_OPUS_PARTE2.md`

#### Contenido:

8. **FASE 4: Headless E-commerce** (3h)
   - 4.1: Configurar Payload CMS
   - 4.2: Conectar Astro a CMS
   - 4.3: Botón comprar
   - GATE 4: Validación e-commerce

9. **FASE 5: Mercado Pago Integration** (2.5h)
   - 5.1: Preference dinámico en n8n
   - 5.2: IPN webhook
   - 5.3: HMAC validation
   - 5.4: Test end-to-end
   - GATE 5: Validación pagos

10. **FASE 6: Automatización n8n** (1.5h)
    - 6.1: Stock update post-compra
    - 6.2: GA4 event server-side
    - 6.3: Email confirmación
    - 6.4: Deploy automático
    - GATE 6: Validación automatización

11. **FASE 7: Deploy y Monitoreo** (2h)
    - 7.1: Deploy en Cloudflare Pages
    - 7.2: DNS + SSL
    - 7.3: Monitoreo y alertas
    - 7.4: Validación final
    - GATE 7: Checklist exhaustivo (24 items)

12. **Troubleshooting** (para referencia)
    - TTFB > 50ms → soluciones
    - Stock no actualiza → debuggeo
    - Email no llega → verificaciones
    - GA4 evento no llega → troubleshooting
    - Deploy no dispara → fixes

13. **Resumen Timeline Final**
    - Tabla de fases
    - Estimaciones realistas
    - Duración total: ~21 horas

---

## 🎯 CÓMO USAR ESTE MANUAL

### Para Opus (Cómo proceder)

#### Paso 1: Leer Visión General (5 min)
```
1. Abre: MANUAL_IMPLEMENTACION_LINEA_PRODUCCION_OPUS.md
2. Lee sección: "Visión General"
3. Entiende: Stack técnico, fases, timeline
```

#### Paso 2: Verificar Requisitos (10 min)
```
1. Lee: "Requisitos Previos"
2. Confirma con usuario que tiene:
   - Información de productos
   - Credenciales (MP, GA4, Cloudflare)
   - Ambiente local (Docker, Node.js)
3. Si falta algo: Pedirlo explícitamente
```

#### Paso 3: Ejecutar FASE 0 (1.5h)
```
1. Abre sección "FASE 0: Pre-Producción"
2. Sigue cada paso:
   - 0.1: Infraestructura
   - 0.2: Datos de entrada
   - 0.3: Validar credenciales
3. Al terminar: Validar GATE 0 (checklist)
```

#### Paso 4: Continuar Linealmente
```
FASE 1 (2.5h) → FASE 1.2 (3.5h) → FASE 2 (2.5h) → ...
(sin paralelismo, secuencial)
```

#### Paso 5: Validar Cada GATE
```
Al terminar cada fase, ejecutar GATE correspondiente.
Si TODOS los checks pasan: continuar siguiente fase.
Si alguno falla: debuggear antes de continuar.
```

#### Paso 6: Si Algo Falla
```
1. Ir a sección "Troubleshooting"
2. Buscar el problema
3. Ejecutar soluciones propuestas
4. Si aún no resuelve: pedir info detallada al usuario
```

---

## ⏱️ TIMELINE RECOMENDADO

### Distribución por Sesiones

**Sesión 1 (Day 1 - 4 horas)**
- Requisitos Previos: 15 min
- FASE 0: 1.5 h
- FASE 1: 2.5 h
- Total: 4 h

**Sesión 2 (Day 2 - 4 horas)**
- FASE 1.2 (Message Lab): 3.5 h
- Descanso: 30 min
- Total: 4 h

**Sesión 3 (Day 3 - 4 horas)**
- FASE 2: 2.5 h
- FASE 3: 1.5 h
- Total: 4 h

**Sesión 4 (Day 4 - 3 horas)**
- FASE 4: 3 h
- Total: 3 h

**Sesión 5 (Day 5 - 3.5 horas)**
- FASE 5: 2.5 h
- FASE 6: 1 h
- Total: 3.5 h

**Sesión 6 (Day 6 - 2 horas)**
- FASE 7: 2 h
- Total: 2 h

**TOTAL: ~21 horas en 6 sesiones de 3-4 horas cada una**

---

## 📞 INTERACCIÓN USUARIO ↔ OPUS

### Durante FASE 0-3 (Preparación)
```
Usuario proporciona:
✓ Datos de productos (SKU, precios, descripción)
✓ Credenciales (MP, GA4, Cloudflare)
✓ Información de negocio (NAP, GBP)

Opus:
✓ Crea estructura
✓ Valida datos
✓ Genera HTML/CSS base
```

### Durante FASE 1.2 (Message Lab)
```
Usuario responde:
✓ 5 preguntas sobre negocio (30 min)
✓ Aprueba copy propuesto (interactivo)

Opus:
✓ Documenta respuestas
✓ Aplica frameworks de marketing
✓ Genera copy refinado
✓ Itera según feedback
```

### Durante FASE 4-7 (Implementación)
```
Usuario:
✓ Ejecuta comandos propuestos
✓ Proporciona credenciales cuando se pide
✓ Valida que funciona (test manual)

Opus:
✓ Guía paso-a-paso
✓ Genera código/configuración
✓ Valida resultados
✓ Debuggea si falla
```

---

## 🔧 COMANDOS CLAVE

### Comandos Frecuentes
```bash
# Antes de cada sesión:
cd ~/pure24-nutrition-ecommerce
git status
git pull origin main

# Después de cada FASE:
git add .
git commit -m "FASE X: [descripción]"
git push origin main

# Para ver progreso:
ls -la dist/           # HTML estático
npm run build          # Rebuild
docker-compose logs    # Ver logs
curl http://localhost:3000/api/products  # Validar API
```

---

## ✅ CHECKLIST DE ÉXITO

### Indicadores de Progreso

- [ ] FASE 0: Repo configurado, credenciales validadas
- [ ] FASE 1: Lighthouse 95+, TTFB <50ms
- [ ] FASE 1.2: Copy validado y aprobado por cliente
- [ ] FASE 2: JSON-LD sin errores, FAQ visible
- [ ] FASE 3: NAP sincronizado, EXIF inyectado
- [ ] FASE 4: 30+ productos en Payload, Astro fetching datos
- [ ] FASE 5: Pago simulado procesado, stock actualizado
- [ ] FASE 6: Email recibido, GA4 evento registrado
- [ ] FASE 7: HTTPS activo, uptime monitoreado, system LIVE

---

## 📚 REFERENCIAS RÁPIDAS

### Archivos Clave
```
Parte 1 (FASE 0-3):
  MANUAL_IMPLEMENTACION_LINEA_PRODUCCION_OPUS.md

Parte 2 (FASE 4-7):
  MANUAL_IMPLEMENTACION_LINEA_PRODUCCION_OPUS_PARTE2.md

Referencia:
  INDICE_MANUAL_OPUS.md (este archivo)
  RESUMEN_VALUACION_VENTA.md (pricing)
  MANUAL_IMPLEMENTACION_OPUS.md (deployment posterio)
```

### Tecnologías Principales
```
Frontend:   Astro (SSG)
Backend:    Payload CMS v3 (Node + PostgreSQL)
Infra:      Docker Compose (local dev)
Deploy:     Cloudflare Pages
Automation: n8n
Payments:   Mercado Pago
Analytics:  Google GA4 + Cloudflare Analytics
```

### Puertos Locales
```
Astro:      http://localhost:3000 (dev)
Payload:    http://localhost:3000 (producción)
n8n:        http://localhost:5678
PostgreSQL: localhost:5432
```

---

## 🆘 SOPORTE

### Si Opus se Atasca
```
Usuario proporciona:
1. Fase donde se atasca
2. Paso específico
3. Error exacto (copy-paste)
4. Qué intentó resolver

Opus:
1. Consulta sección Troubleshooting
2. Aplica soluciones sugeridas
3. Si aún no funciona: investigar desde cero
```

### Recursos Externos
```
Astro Docs:         https://docs.astro.build
Payload Docs:       https://payloadcms.com/docs
Cloudflare Pages:   https://developers.cloudflare.com/pages
n8n Docs:           https://docs.n8n.io
Mercado Pago:       https://developers.mercadopago.com
Google GA4:         https://support.google.com/analytics
```

---

## 🎯 RESULTADO FINAL

Después de completar ~21 horas:

✅ **Sistema E-commerce Completo**
- Frontend: Pure24 sitio live en https://pure24nutrition.cl
- Backend: CMS con 30+ productos
- Pagos: Mercado Pago integrado
- Automatización: Stock, email, deploy automáticos
- Monitoreo: 24/7 alertas y dashboards
- SEO: Optimizado para búsqueda orgánica + Local SEO
- Performance: TTFB <50ms, Lighthouse 95+

✅ **Documentación Completa**
- 11 documentos profesionales
- GATE de validación (24 checks)
- Troubleshooting incluido
- Listo para transferir a equipo

✅ **Listo para Vender**
- Proyecto valorado en $55,000 USD
- Production-ready
- Escalable a 100+ clientes

---

## 📝 NOTAS FINALES

### Para Opus:
- Sigue el manual **linealmente** (sin saltarse fases)
- Valida cada GATE antes de continuar
- Si falla algo: debuggea inmediatamente (no continúes)
- Documenta problemas encontrados para futuras implementaciones

### Para Usuario:
- Tengamos todo listoen FASE 0 antes de empezar
- Respuestas de Message Lab deben ser honestas y específicas
- Testing manual es crítico (no solo curl)
- Después de FASE 7: revisar dashboards de monitoreo diariamente

---

**Manual Creado:** 9 de Marzo 2026
**Versión:** 2.0 Opus Edition
**Status:** ✅ Listo para Implementación Inmediata

**¡A COMENZAR CON OPUS! 🚀**

