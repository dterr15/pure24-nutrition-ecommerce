# ✅ CHECKLIST PARA HABILITAR PRODUCCIÓN

**Fecha:** 9 de Marzo 2026
**Status:** ✅ LISTO PARA USUARIO

---

## 🎯 ANTES DE EMPEZAR

Verifica que el proyecto está en buen estado:

```bash
# Terminal en raíz del proyecto
npm run build
# Debe mostrar: "17 page(s) built in X.XXs"
# Debe mostrar: "Complete!"
```

✅ Si ves esto, continúa.
❌ Si hay error, reporta el log.

---

## 📋 CHECKLIST: OPCIÓN A (DEPLOY - 15 MIN)

Usa esto si quieres **sitio vivo ahora**.

### Preparación (2 min)
```
☐ Tienes GitHub repo clonado
☐ Tienes cuenta en Vercel (o creas una)
☐ Tienes git push capability
```

### Ejecución (10 min)
```
☐ Abre https://vercel.com
☐ Click "New Project"
☐ Conectas GitHub (si no está)
☐ Buscas: pure24-nutrition-ecommerce
☐ Seleccionas el repo
☐ Click "Deploy" y esperas 2-3 min
☐ Te da URL tipo: pure24nutrition-ecommerce.vercel.app
```

### Dominio (3 min)
```
☐ En Vercel dashboard, vas a "Settings" → "Domains"
☐ Agregas: puro24nutrition.cl
☐ Esperas propagación DNS (5-15 min)
☐ Verificas: https://puro24nutrition.cl carga
```

### Validación Final (1 min)
```
☐ Abres https://puro24nutrition.cl
☐ Cargar homepage
☐ Click "Productos" → Funciona
☐ Click "Sobre Nosotros" → Funciona
☐ Click "Contacto" → Google Maps funciona
☐ Click carrito → Tooltip funciona
```

**RESULTADO:** ✅ Sitio vivo en producción

---

## ⚙️ CHECKLIST: OPCIÓN B (MERCADO PAGO - 1-2 HORAS)

Usa esto si quieres **pagos funcionando primero**.

### Lectura (15 min)
```
☐ Lees: FASE_5_2_PASO_A_PASO.md
☐ Entiendes los 7 pasos
☐ Tienes credenciales MP listos
```

### Configuración MP (15 min)
```
☐ Abre https://www.mercadopago.com.ar/developers
☐ Vas a "Webhooks"
☐ Creas nuevo webhook:
   URL: <tu-servidor>/api/webhooks/mercadopago
   Event: payment.completed
☐ Copias el secret
☐ Guardas en .env: MP_WEBHOOK_SECRET
```

### Testing Local (30 min)
```
☐ cd backend && npm install
☐ npm run dev:backend
☐ Terminal nueva: node scripts/test-webhook.ts
☐ Ves que webhook se dispara
☐ Ves que stock se reduce
☐ Ves que email se envía
```

### Testing Sandbox (20 min)
```
☐ Abre frontend en http://localhost:3000
☐ Agrega producto al carrito
☐ Click "Proceder al pago"
☐ Usa tarjeta MP test: 4111111111111111
☐ Completa pago
☐ Verifica webhook llegó en logs
☐ Verifica stock se redujo
```

**RESULTADO:** ✅ Pagos vivos + webhooks testeados

---

## 🚀 CHECKLIST: OPCIÓN C (AMBOS - 2-3 HORAS)

Usa esto si eres **ambicioso y tienes tiempo**.

### Fase 1: Deploy (15 min)
```
☐ Sigue CHECKLIST OPCIÓN A arriba
☐ Al completar: Sitio vivo ✅
```

### Fase 2: Mercado Pago (1h 45 min)
```
☐ Sigue CHECKLIST OPCIÓN B arriba
☐ Al completar: Pagos vivos ✅
```

### Fase 3: Validación Cruzada (15 min)
```
☐ Desde https://puro24nutrition.cl (producción)
☐ Agrega producto al carrito
☐ Click "Proceder al pago"
☐ Completa pago con tarjeta real o sandbox
☐ Verifica:
   ☐ Pago procesado
   ☐ Stock reducido en BD
   ☐ Email recibido
   ☐ Orden guardada
```

### Fase 4: Documentación (15 min)
```
☐ Actualiza VALIDATION_MATRIX.md
☐ Marca FASE 7 como 100% completada
☐ Hace git commit
☐ Push a main
```

**RESULTADO:** ✅ PRODUCCIÓN COMPLETA - LISTO PARA VENDER

---

## 🎓 DESPUÉS DE COMPLETAR

### Si Elegiste OPCIÓN A
```
Próximo: OPCIÓN B (1-2 horas) para pagos
O espera feedback de stakeholders
```

### Si Elegiste OPCIÓN B
```
Próximo: OPCIÓN A (15 min) para ver vivo
O espera instrucciones
```

### Si Elegiste OPCIÓN C
```
✅ FELICIDADES, ESTÁS EN PRODUCCIÓN
├─ Sitio vivo ✅
├─ Pagos vivos ✅
├─ Emails vivos ✅
└─ Stock sync vivo ✅

Próximo: FASE 5.3 (Admin Dashboard, opcional)
```

---

## 🔍 VERIFICACIONES FINALES

### Antes de ir a producción
```
☐ npm run build → "17 page(s) built"
☐ git status → Clean (no uncommitted changes)
☐ git log --oneline -1 → Último commit es tuyo
☐ .env.example → Sin secretos, solo template
```

### Después de deploy
```
☐ Sitio carga en https://puro24nutrition.cl
☐ Meta tags son correctos (inspeccionador)
☐ SEO schemas están presentes (JSON-LD)
☐ Mobile responsive funciona
☐ Carrito funciona
☐ Links internos funcionan
```

### Después de pagos
```
☐ Mercado Pago checkout funciona
☐ Webhook registra pagos
☐ Stock se reduce automáticamente
☐ Emails se envían
☐ Órdenes se guardan en BD
```

---

## 🆘 SI ALGO FALLA

### Build error
```
Lee: GUIA_INTEGRACION_PRODUCCION.md
Sección: "Problemas Comunes"
```

### Vercel deployment falla
```
Lee: GUIA_INTEGRACION_PRODUCCION.md
Sección: "Deploy a Vercel - Troubleshooting"
```

### Webhook no funciona
```
Lee: FASE_5_2_QUICK_REFERENCE.md
Sección: "Debugging"
```

### Email no se envía
```
Verifica .env tiene:
- EMAIL_PROVIDER
- Credenciales válidas del provider
```

### Stock no se reduce
```
Verifica:
- MP_WEBHOOK_SECRET es correcto
- Backend está corriendo
- Logs muestran webhook recibido
```

---

## ✨ RESUMEN FINAL

```
ANTES: Confusión total
└─ ¿Qué está listo?
└─ ¿Cómo deployar?
└─ ¿Qué hacer ahora?

DESPUÉS: 100% Claro
├─ Este checklist responde todas
├─ Siguiendo pasos → Listo para vender
├─ Sin sorpresas, sin confusión
└─ Máximo 3 horas para producción completa
```

---

## 🎬 PRÓXIMOS 5 MINUTOS

1. Abre este checklist
2. Lee la opción que elegiste (A, B o C)
3. Comienza el PASO 1
4. Sigue los checkboxes

**¡Vamos!** 🚀

---

**Status:** ✅ CHECKLIST LISTO
**Próximo:** TÚ ELIGES (A/B/C)
**Tiempo:** 15 min - 3 horas
**Resultado:** PRODUCCIÓN LISTA
