# ⚡ QUICK START - Enhanced Setup

## 🎯 En 3 Pasos (5 minutos)

### Windows (PowerShell)
```powershell
cd C:\Users\danie\pure24-nutrition-ecommerce
.\scripts\migrate-to-enhanced.ps1
# Responde "s" cuando pregunte
```

### Linux/Mac (Bash)
```bash
cd /ruta/a/pure24-nutrition-ecommerce
bash scripts/migrate-to-enhanced.sh
# Responde "s" cuando pregunte
```

### Manual (Cualquier SO)
```bash
docker-compose down --remove-orphans
docker-compose up -d
sleep 15
docker-compose ps
```

---

## ✅ Verificación (Copia y pega)

```bash
# Test 1: PostgreSQL
docker-compose exec postgres pg_isready -U directus

# Test 2: Directus
curl http://localhost:8055/server/health

# Test 3: Redis
docker-compose exec redis redis-cli ping
```

**Resultado esperado:** Todos "OK" o "PONG"

---

## 🔗 URLs

| Servicio | URL |
|----------|-----|
| **Admin** | http://localhost:8055/admin |
| **API REST** | http://localhost:8055/rest |
| **API GraphQL** | http://localhost:8055/graphql |
| **Health Check** | http://localhost:8055/server/health |
| **Redis Cache** | localhost:6379 |

---

## 🔐 Credenciales (SIN CAMBIOS)

```
Email:    dt@sygnode.cl
Password: DirectusPass2024
API Token: cfXikJLTQHbJhva5dGXIaH9yFmmSyCVS
```

---

## 📊 Status Esperado

```
NAME                COMMAND              SERVICE      STATUS
pure24_postgres     postgres             postgres     Up (healthy)
pure24_directus     directus             directus     Up (healthy)
pure24_redis        redis-server         redis        Up (healthy)
```

---

## ⚠️ Importante

✅ **TUS DATOS ESTÁN SEGUROS**
- Base de datos: INTACTA
- Uploads: INTACTOS
- Configuraciones: INTACTAS

✅ **PUERTOS SIN CAMBIOS**
- PostgreSQL: 5433 (igual)
- Directus: 8055 (igual)
- Redis: 6379 (nuevo, no interfiere)

✅ **REVERSIBLE**
```bash
docker-compose down
# Restaura docker-compose.yml anterior si es necesario
docker-compose up -d
```

---

## 🚨 Si Algo Falla

```bash
# Ver logs
docker-compose logs

# Reiniciar todo
docker-compose restart

# Reset completo (mantiene datos)
docker-compose down
docker-compose up -d
```

---

**¿Problemas?** Lee `docs/MIGRATION_ENHANCED.md` para troubleshooting detallado.
