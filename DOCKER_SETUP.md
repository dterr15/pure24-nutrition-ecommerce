# Pure24 Nutrition - Docker Local Setup

## Prerequisitos

* Docker Desktop instalado ([descargar](https://www.docker.com/products/docker-desktop))
* Docker Compose (incluido con Docker Desktop)
* Git instalado
* Acceso a terminal/CMD

---

## Paso a paso

### 1️⃣ Preparar variables de entorno

Copia `.env.example` a `.env`:

```bash
cp .env.example .env
```

Verifica que contenga:

```
DB_USER=payload
DB_PASSWORD=payload_dev_password
PAYLOAD_SECRET=dev_secret_key_change_in_production
NODE_ENV=development
PAYLOAD_PUBLIC_SERVER_URL=http://localhost:3000
PUBLIC_CMS_URL=http://localhost:3000
```

**En producción, cambiar:**
* `DB_PASSWORD` a contraseña segura
* `PAYLOAD_SECRET` a random 32 chars: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
* `PAYLOAD_PUBLIC_SERVER_URL` a `https://api.pure24nutrition.cl`

---

### 2️⃣ Instalar dependencias (una sola vez)

```bash
cd backend
npm install
cd ..
```

Esto instala:
* Payload CMS v3
* Express
* PostgreSQL driver
* @faker-js/faker (para seed)

**Tiempo:** 2-3 minutos

---

### 3️⃣ Iniciar Docker Compose

```bash
docker-compose up
```

**Salida esperada:**
```
pure24-postgres  | PostgreSQL is ready to accept connections
pure24-payload   | ✅ Payload CMS iniciado correctamente
pure24-payload   | 📍 Admin panel: http://localhost:3000/admin
pure24-payload   | 📍 API: http://localhost:3000/api
pure24-payload   | 🚀 Servidor escuchando en puerto 3000
```

Si todo está bien: continúa al paso 4. **No cierres esta ventana.**

---

### 4️⃣ En OTRA TERMINAL: Verificar que funciona

```bash
# Health check
curl http://localhost:3000/api/health

# Respuesta esperada:
# {"status":"ok","timestamp":"2024-01-20T16:30:00.000Z"}
```

---

### 5️⃣ Seedear 50+ productos (en otra terminal más)

```bash
cd backend
npm run seed
```

**Salida esperada:**
```
🌱 Iniciando seeding de productos...
👤 Creando usuario admin...
✅ Usuario admin creado: admin@pure24.cl / Admin@123456
📦 Creando 30 productos...
✅ Whey Protein Isolate Premium
✅ Casein Protein Night
✅ Creatine Monohydrate Powder
... (30 más)
✨ Seeding completado exitosamente
```

---

### 6️⃣ Acceder al admin panel

Abre en tu navegador:

```
http://localhost:3000/admin
```

**Credenciales:**
```
Email:    admin@pure24.cl
Password: Admin@123456
```

**Qué deberías ver:**
* Colección "Users" con 1 admin
* Colección "Products" con 30 productos
* Colección "Orders" vacía
* Colección "Media" vacía (agregaremos imágenes después)

---

### 7️⃣ Probar API directamente

```bash
# Listar todos los productos (JSON)
curl "http://localhost:3000/api/products?limit=5"

# Buscar proteínas
curl "http://localhost:3000/api/products?where[category][equals]=proteins&limit=5"

# Obtener un producto específico
curl "http://localhost:3000/api/products/{id}"
```

**Respuesta esperada:** JSON con productos, timestamps, etc.

---

## Comandos útiles

### Ver logs en tiempo real

```bash
docker-compose logs -f payload
docker-compose logs -f postgres
```

### Detener sin perder datos

```bash
docker-compose stop
```

### Reiniciar

```bash
docker-compose restart payload
```

### Limpiar todo (⚠️ BORRA DATOS)

```bash
docker-compose down -v
```

### Entrar a PostgreSQL directamente

```bash
docker-compose exec postgres psql -U payload -d pure24_db
```

---

## Troubleshooting

### ❌ "Address already in use" (puerto 3000 ocupado)

**Opción 1:** Matar el proceso en el puerto
```bash
lsof -ti:3000 | xargs kill -9
```

**Opción 2:** Cambiar puerto en `docker-compose.yml`
```yaml
# Cambiar "3000:3000" por "3001:3000"
# Luego: http://localhost:3001/admin
```

---

### ❌ "Cannot reach database"

Verificar que postgres está healthy:
```bash
docker-compose logs postgres
```

Si falla, reiniciar:
```bash
docker-compose restart postgres
docker-compose restart payload
```

---

### ❌ "npm: command not found" en npm run seed

Verificar Node está instalado localmente:
```bash
node --version
npm --version
```

Si no, instalar desde: https://nodejs.org/

---

### ❌ Seed script falla

Verificar que payload está corriendo:
```bash
curl http://localhost:3000/api/health
```

Si falla, esperar 10 segundos y reintentar:
```bash
npm run seed
```

Si sigue fallando, ver logs:
```bash
docker-compose logs payload
```

---

### ❌ "Port 5432 already in use" (PostgreSQL)

Cambiar puerto en `docker-compose.yml`:
```yaml
# Cambiar "5432:5432" por "5433:5432"
# Actualizar .env:
# DATABASE_URI=postgresql://payload:password@postgres:5432/pure24_db
```

---

## Estructura en Docker

```
Container "pure24-postgres" (PostgreSQL 15)
├── Database: pure24_db
├── User: payload
└── Port: 5432

Container "pure24-payload" (Node.js + Express)
├── Server: http://localhost:3000
├── Admin: http://localhost:3000/admin
├── API: http://localhost:3000/api
└── Port: 3000

Volumen "postgres_data"
└── Datos persistentes entre reinicios
```

---

## Checklist de setup completo

- [ ] Docker Desktop instalado y corriendo
- [ ] `.env` copiado de `.env.example`
- [ ] `npm install` ejecutado en `/backend`
- [ ] `docker-compose up` iniciado (primera terminal)
- [ ] `curl http://localhost:3000/api/health` responde OK
- [ ] `npm run seed` completado (segunda terminal)
- [ ] Admin panel accesible en `http://localhost:3000/admin`
- [ ] Login exitoso con `admin@pure24.cl / Admin@123456`
- [ ] 30 productos visibles en la colección Products
- [ ] API responde en `http://localhost:3000/api/products`

---

## Próximos pasos (PARTE 4)

Cuando todo funcione:

1. ✅ Backend Payload corriendo en Docker
2. ✅ 30 productos seededos
3. ✅ Admin panel funcional
4. ⏳ Próximo: Conectar frontend Astro al backend (PARTE 4)

**Tiempo total setup:** 5-10 minutos

**Soporte:** dev@pure24nutrition.cl
