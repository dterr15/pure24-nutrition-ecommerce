---
name: 🐛 Reportar Bug
about: Reportar un error de funcionamiento, CSS, o comportamiento inesperado
title: "BUG: [descripción-corta]"
labels: ["maintenance", "bug"]
assignees: []
---

## Descripción del Bug

**¿Qué está pasando mal?**

[Descripción clara del problema]

**¿Cuál debería ser el comportamiento correcto?**

[Descripción del comportamiento esperado]

---

## Pasos para Reproducir

1. Ir a [URL o página]
2. Hacer [acción]
3. Observar [resultado incorrecto]

---

## Información del Entorno

**Navegador/Dispositivo:**
- [ ] Chrome (escritorio)
- [ ] Safari (iOS)
- [ ] Firefox (escritorio)
- [ ] Otro:

**URL donde ocurre:**

**Fecha/Hora del error:**

---

## Archivos Involucrados

**Componente(s) afectado(s):**

Ejemplos:
- `frontend/src/components/ShoppingCart.tsx`
- `frontend/src/pages/checkout.astro`
- `frontend/src/styles/global.css`

**Estimación de severidad:**
- [ ] 🔴 Crítico (impide compra/pago)
- [ ] 🟠 Alto (deteriora experiencia)
- [ ] 🟡 Medio (visual/menor función)
- [ ] 🟢 Bajo (cosméticos)

---

## Logs/Errores Capturados

**Browser Console:**

```
[Paste any console errors here]
```

**Network Tab:**

```
[Any failed requests?]
```

---

## Instrucciones para Jules AI

1. Reproducir el bug en entorno local (`npm run dev`)
2. Identificar archivo/componente causante
3. Crear rama: `fix/[nombre-bug]`
4. Implementar fix minimal
5. Validar que la corrección no rompe otros tests
6. Crear PR con descripción detallada
7. Incluir antes/después screenshot si es CSS
8. Referenciar este issue en el commit message

---

## Attachment (Opcional)

- [ ] Screenshot adjunto
- [ ] Video de reproducción adjunto
- [ ] Error log adjunto

---

## Notas Adicionales

[Contexto adicional]
