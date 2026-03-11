---
name: 🛍️ Actualizar Producto
about: Actualizar precio, descripción, o especificaciones de un producto existente
title: "UPDATE: [nombre-producto]"
labels: ["maintenance", "product-update"]
assignees: []
---

## Producto a Actualizar

**Nombre del Producto:**

**SKU/ID:**

---

## Campo(s) a Cambiar

- [ ] Precio (CLP)
- [ ] Descripción
- [ ] Especificaciones técnicas
- [ ] Stock
- [ ] Imagen
- [ ] Categoría
- [ ] Otro:

---

## Valor Anterior

```
[Valor actual]
```

---

## Valor Nuevo

```
[Nuevo valor]
```

---

## Fuente de la Información

- [ ] Excel de inventario (adjunto)
- [ ] Correo del cliente
- [ ] Análisis de competencia
- [ ] Control de stock
- [ ] Otro:

---

## Instrucciones para Jules AI

1. Actualizar `frontend/src/data/products.ts` con el nuevo valor
2. Si hay cambio de precio: verificar impacto en bundle pricing
3. Si hay cambio de descripción: verificar SEO keywords
4. Si hay cambio de stock: actualizar también `wrangler.toml` si afecta inventario
5. Crear PR con descripción clara del cambio
6. No desplegar hasta que se apruebe el PR

---

## Notas Adicionales

[Contexto o notas adicionales]
