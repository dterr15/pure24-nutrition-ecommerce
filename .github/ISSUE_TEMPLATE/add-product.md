---
name: ➕ Agregar Producto
about: Agregar un nuevo producto al catálogo
title: "ADD: [nombre-producto]"
labels: ["maintenance", "product-add"]
assignees: []
---

## Detalles del Nuevo Producto

### Información Básica

**Nombre del Producto:**

**SKU:**

**Categoría:**

**Precio (CLP):**

**Stock Inicial:**

---

### Descripción y Especificaciones

**Descripción Corta (máx 100 caracteres):**

```
[Descripción corta para lista de productos]
```

**Descripción Larga:**

```
[Descripción detallada que aparece en página de producto]
```

**Especificaciones Técnicas:**

```
[Formato: JSON array de {label, value}]
Ejemplo:
[
  {"label": "Proteína por serv.", "value": "25g"},
  {"label": "Calorías", "value": "120 kcal"},
  {"label": "Sabor", "value": "Chocolate"}
]
```

---

### SEO

**Meta Description (máx 160 caracteres):**

**Keywords (máx 5):**

---

### Imagen

**Imagen del Producto:**
- Adjunta como archivo o provide URL (mínimo 800x800px)
- Formato: JPEG o WebP

---

## Instrucciones para Jules AI

1. Crear nuevo entry en `frontend/src/data/products.ts`
2. Usar SKU como slug (convertir a lowercase-with-dashes)
3. Generar ruta estática: `src/pages/productos/[slug].astro` (SSG)
4. Optimizar imagen: crear thumbnail (300x300) y versión card (500x500)
5. Validar SEO: incluir keywords en h1, description, JSON-LD
6. Crear PR con estructura de carpeta clara
7. Incluir screenshot de producto en página para revisión visual

---

## Validaciones Automáticas

- [ ] SKU es único
- [ ] Precio es número válido (CLP)
- [ ] Imagen tiene tamaño mínimo
- [ ] Descripción no tiene errores ortográficos
- [ ] Meta description tiene 150-160 caracteres
- [ ] JSON-LD está sintácticamente válido

---

## Notas Adicionales

[Contexto o notas]
