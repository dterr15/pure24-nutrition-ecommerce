# OPUS QUICK TRANSFER - 2 MINUTOS

## 👉 ACCIÓN INMEDIATA

### En Opus Chat, copia-pega esto:

```
Eres especialista DevOps e-commerce. Necesito implementar un Knowledge Pack
de 4 FASES (Deploy → Monitoreo) para Pure24 Nutrition.

Mi workspace está en: C:\Users\danie\pure24-nutrition-ecommerce\

Archivos a usar (en orden):
1. FASE_6_4_CHECKLIST_PASO_A_PASO.md (inicio aquí)
2. FASE_7_1_DEPLOY_CLOUDFLARE_KP.md
3. FASE_7_2_*.md (DNS + SSL)
4. FASE_7_3_CHECKLIST_PASO_A_PASO.md
5. GATE_7_CHECKLIST_EJECUTABLE.md (validación final)

Stack:
- Frontend: Astro + Cloudflare Pages
- Backend: Directus (PostgreSQL) en VPS
- Automatización: n8n en VPS
- Pagos: Mercado Pago

Necesito: Implementación paso-a-paso (no resúmenes), debugging en tiempo real,
validaciones después de cada FASE.

Comparte credenciales? [Sí/No, luego pregunta cuáles]

Comenzamos con FASE 6.4?
```

---

## 🎯 INFORMACIÓN A PROPORCIONAR A OPUS

Cuando Opus lo pida:

### Cloudflare
```
Zone ID: [obtener de Cloudflare Dashboard]
Deploy Hook URL: [Pages → Settings → Deploy Hook]
```

### Directus
```
URL: http://localhost:8055
Admin email: admin@pure24.com
Admin password: [tu contraseña]
API Key: [Settings → API Tokens → crear "Opus Integration"]
```

### n8n
```
URL: http://[tu-vps-ip]:5678
API Key: [Settings → Settings → API Calls → crear token]
```

### PostgreSQL
```
Host: [localhost o IP]
Port: 5432
Database: pure24_nutrition
User: postgres
Password: [tu contraseña]
```

### GA4 (Opcional para FASE 7.3)
```
Property ID: [Analytics → Admin → Property settings]
Measurement ID: G-[valor]
```

---

## ⏱️ TIMELINE

| FASE | Tiempo | Dependencias |
|------|--------|--------------|
| 6.4 | 40 min | Directus + n8n + Cloudflare |
| 7.1 | 40 min | GitHub repo + Cloudflare |
| 7.2 | 31 min | DNS delegado a Cloudflare |
| 7.3 | 65 min | GA4 + Google Cloud |
| **TOTAL** | **176 min** | **Todas las anteriores** |

---

## 🚀 PRIMEROS PASOS EN OPUS

1. **Copia el prompt anterior**
2. **Abre chat.claude.com (Opus)**
3. **Pega el prompt**
4. **Opus preguntará por credenciales:**
   - Comparte solo lo que necesite (no todo de una)
   - Sigue sus indicaciones

5. **Comienza FASE 6.4:**
   - Opus lee FASE_6_4_CHECKLIST_PASO_A_PASO.md
   - Sigue 10 pasos uno por uno
   - Valida cada paso

---

## ❓ SI ALGO FALLA

Dile a Opus:
> "El paso X falló con error: [copiar error completo]. ¿Qué revisamos?"

Opus te guiará a través del troubleshooting.

---

## 📊 VALUACIÓN (para tu referencia)

**Qué vendría siendo este Knowledge Pack:**
- **Pequeña empresa:** $4500 USD
- **Mediana empresa:** $6500 USD
- **Empresa grande:** $8000+ USD

**Comparación:**
- Agencia DevOps cobraría: $15000-25000
- Freelancer senior: $3000-5000/semana
- Este pack: 40-60% del precio total = **buen deal**

---

**Status:** Listo para transferir a Opus ✅

