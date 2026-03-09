# 🚀 PURE 24 NUTRITION — E-COMMERCE AI-NATIVE

**Tier:** Elite (Tier 3)
**Status:** Fase 0 ✅ Completa | Fase 0B ⏳ En Progreso
**Fecha Inicio:** 8 de Marzo de 2026

---

## 📋 Descripción

Pure 24 Nutrition es un e-commerce especializado en suplementos deportivos, construido con arquitectura moderna, AI-native y escalable.

**Stack Tecnológico:**
- **Backend:** FastAPI (Python 3.11)
- **Frontend:** React + Vite
- **CMS:** Directus (Headless)
- **Database:** PostgreSQL 15 + pgvector
- **Cache:** Redis 7
- **Automation:** N8N
- **Payment:** Mercado Pago
- **Analytics:** Google Analytics GA4
- **CDN:** Cloudflare

---

## 🚀 Quickstart

### Requisitos Previos
- Docker Desktop instalado
- .env configurado con credenciales (ver `docs/00_data_collection_checklist.md`)

### Setup Automático (5 minutos)

```bash
# 1. Clonar repositorio
git clone <repo-url>
cd pure24-nutrition-ecommerce

# 2. Copiar variables de entorno (EDITAR CON TUS CREDENCIALES)
cp .env.example .env
nano .env  # Editar con credenciales reales

# 3. Ejecutar setup automatizado
bash scripts/setup.sh

# 4. Verificar servicios
docker-compose ps
```

### Servicios Levantados

| Servicio | URL | Puerto | Credenciales |
|----------|-----|--------|--------------|
| **Directus CMS** | http://localhost:8055 | 8055 | Ver `.env` |
| **PostgreSQL** | localhost | 5433 | Ver `.env` |
| **Redis** | localhost | 6379 | N/A |
| **Backend** | http://localhost:8000 | 8000 | Fase 3 |
| **Frontend** | http://localhost:5173 | 5173 | Fase 4 |

---

## 📁 Estructura del Proyecto

```
pure24-nutrition-ecommerce/
├── src/                           # Código fuente (Fase 3+)
│   ├── main.py
│   ├── models/
│   ├── routes/
│   └── services/
├── public/                        # Assets estáticos
├── data/                          # Datos de productos (CSV)
│   └── products.csv              # Productos de tienda
├── docs/                          # Documentación
│   ├── 00_data_collection_checklist.md
│   ├── DIRECTUS_SETUP.md
│   └── DIRECTUS_NEXT_STEPS.md
├── scripts/                       # Scripts automatizados
│   ├── setup.sh                  # Setup automático Fase 0
│   ├── validate-config.sh        # Validar credenciales
│   ├── migrate-to-enhanced.sh    # Migración Docker mejorada
│   └── start-phase-1.sh          # Iniciar Fase 1
├── docker-compose.yml            # Infraestructura completa
├── Dockerfile.backend            # Imagen Docker del backend
├── requirements.txt              # Dependencias Python
├── .env.example                  # Variables de entorno (template)
├── .gitignore                    # Excluir archivos sensibles
└── README.md                     # Este archivo
```

---

## 🔄 Fases del Proyecto

### Fase 0 ✅ COMPLETADA
**Duración:** ~2 horas
**Status:** Infraestructura base lista

Lo que incluye:
- ✅ Estructura de carpetas
- ✅ docker-compose.yml (PostgreSQL, Directus, Redis)
- ✅ Scripts de validación y setup
- ✅ .env.example documentado
- ✅ Documentación Directus

**Próximo paso:** Completar Fase 0B

---

### Fase 0B ⏳ EN PROGRESO
**Duración:** ~1-2 horas
**Status:** Esperando usuario

Qué completar:
1. Recopilar datos de productos (mínimo 5)
2. Obtener credenciales (Mercado Pago, GA4, Cloudflare)
3. Ejecutar validación
4. Hacer commit

**Checklist:** `docs/00_data_collection_checklist.md`

---

### Fase 1 ⏳ SIGUIENTE
**Duración:** ~5-8 horas
**Status:** Esperando Fase 0B

Incluye:
- Knowledge Pack (14 documentos de análisis)
- Collections en Directus
- Integración de productos

**Comando:** `bash scripts/start-phase-1.sh` (cuando Fase 0B esté lista)

---

### Fase 2 - 7 ⏳ POSTERIORES
Ver timeline en `docs/00_data_collection_checklist.md` (sección "Timeline Estimado")

---

## 🛠️ Comandos Útiles

### Docker
```bash
# Levantar servicios
docker-compose up -d

# Ver estado
docker-compose ps

# Ver logs (todos)
docker-compose logs -f

# Ver logs específico
docker-compose logs -f directus
docker-compose logs -f postgres
docker-compose logs -f redis

# Detener (sin perder datos)
docker-compose stop

# Reiniciar
docker-compose restart

# Eliminar todo (CUIDADO: borra volúmenes)
docker-compose down -v
```

### Validación
```bash
# Validar credenciales
bash scripts/validate-config.sh

# Test Directus
curl http://localhost:8055/server/health

# Test PostgreSQL
docker-compose exec postgres pg_isready -U directus

# Test Redis
docker-compose exec redis redis-cli ping
```

### Directus
```bash
# Acceder admin panel
http://localhost:8055/admin

# Email (de .env): dt@sygnode.cl
# Password (de .env): Ver DIRECTUS_ADMIN_PASSWORD
```

---

## 🔐 Configuración de Credenciales

### .env

Copiar `.env.example` a `.env` y completar con credenciales reales:

```bash
cp .env.example .env
nano .env  # Editar
```

**Variables requeridas:**
- `VITE_PUBLIC_MP_PUBLIC_KEY` — Mercado Pago
- `MP_ACCESS_TOKEN` — Mercado Pago
- `VITE_PUBLIC_GA4_MEASUREMENT_ID` — Google Analytics
- `GA4_API_SECRET` — Google Analytics
- `CF_ACCOUNT_ID` — Cloudflare
- `CF_API_TOKEN` — Cloudflare
- `CF_ZONE_ID` — Cloudflare
- `DIRECTUS_ADMIN_EMAIL` — Directus (local)
- `DIRECTUS_ADMIN_PASSWORD` — Directus (local)
- `VITE_PUBLIC_DOMAIN` — Dominio

**Dónde obtener:** `docs/00_data_collection_checklist.md`

---

## 🚨 Troubleshooting

### Docker no inicia
```bash
# Verificar que Docker Desktop está corriendo
docker ps

# Si no funciona, reiniciar Docker Desktop
```

### Directus no responde
```bash
# Ver logs
docker-compose logs directus

# Reiniciar
docker-compose restart directus

# Esperar 30 segundos
```

### PostgreSQL no inicia
```bash
# Ver logs
docker-compose logs postgres

# Reset (CUIDADO: borra datos)
docker-compose down -v
docker-compose up -d
```

### Credenciales inválidas
```bash
# Ejecutar validación
bash scripts/validate-config.sh

# Editar .env con valores correctos
nano .env

# Reintentar validación
bash scripts/validate-config.sh
```

---

## 📚 Documentación

- **Setup Directus:** `docs/DIRECTUS_SETUP.md`
- **Pasos Directus:** `docs/DIRECTUS_NEXT_STEPS.md`
- **Recopilación datos:** `docs/00_data_collection_checklist.md`

---

## 🔄 Próximos Pasos

1. **Completar Fase 0B:**
   ```bash
   # Ver checklist
   cat docs/00_data_collection_checklist.md

   # Completar datos y credenciales
   # Ejecutar validación
   bash scripts/validate-config.sh
   ```

2. **Iniciar Fase 1:**
   ```bash
   bash scripts/start-phase-1.sh
   ```

3. **Hacer commit:**
   ```bash
   git add .
   git commit -m "chore: Fase 0B completada"
   ```

---

## 📞 Soporte

- **Issues:** Ver logs con `docker-compose logs -f`
- **Documentación:** Revisar `/docs/`
- **Scripts:** Todos tienen comentarios inline

---

**Construido con:** AI-Native Web Development Playbook v1.0
**De invisible a inevitable en 10 días** 🚀
