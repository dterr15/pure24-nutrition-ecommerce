---
name: ✏️ Corrección de Texto/Contenido
about: Corregir errores ortográficos, gramaticales, o actualizar contenido de texto
title: "TEXT: [página/sección]"
labels: ["maintenance", "content"]
assignees: []
---

## Ubicación del Texto

**Página/Sección:**

**URL:**

---

## Error o Texto Actual

```
[Copiar el texto exacto con el error]
```

---

## Texto Corregido

```
[Copiar el texto corregido]
```

---

## Tipo de Corrección

- [ ] Ortografía
- [ ] Gramática
- [ ] Puntuación
- [ ] Consistencia de tono
- [ ] Traducción
- [ ] Actualización de información
- [ ] Otro:

---

## Razón de la Corrección

**¿Por qué es importante?**

[Breve explicación del impacto]

---

## Archivo Afectado

**Ruta:**

Ejemplos:
- `frontend/src/pages/index.astro`
- `frontend/src/data/faqs.ts`
- `frontend/src/components/ProductCard.tsx`
- `frontend/src/content/sobre-nosotros.md`

---

## Instrucciones para Jules AI

1. Localizar el archivo basándose en la ruta proporcionada
2. Hacer búsqueda (Ctrl+F) del texto exacto
3. Reemplazar con el texto corregido
4. Verificar que no hay cambios involuntarios
5. Si afecta SEO: validar JSON-LD sigue siendo correcto
6. Crear PR con mensaje: "docs: [breve descripción del cambio]"
7. No desplegar si falta revisión de contenido

---

## Validaciones

- [ ] El cambio es cosmético (no afecta funcionalidad)
- [ ] No hay cambios involuntarios en otros archivos
- [ ] Cambio no requiere actualización de esquemas
- [ ] Build completa sin errores

---

## Notas Adicionales

[Contexto adicional]
