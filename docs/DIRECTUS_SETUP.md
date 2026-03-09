# 🚀 Directus Setup Guide - PURE 24 NUTRITION

## ¿Qué es Directus?

Directus es un **CMS Headless** que actúa como tu **API de contenido y gestión de datos**.

- **Headless**: Sin interfaz frontend (no es un sitio web, es un servicio API)
- **API REST + GraphQL**: Acceso a datos desde cualquier aplicación
- **Admin Panel**: Interfaz visual para gestionar contenidos
- **Perfecto para**: eCommerce, aplicaciones, sitios dinámicos

---

## 📋 Requisitos Previos

✅ Docker instalado y corriendo
✅ `.env` configurado con credenciales de Directus
✅ Puerto 8055 disponible (para Directus)
✅ Puerto 5432 disponible (para PostgreSQL)

---

## 🏃 Quick Start (5 minutos)

### Opción 1: Linux/Mac (bash)

```bash
# 1. Navega al directorio del proyecto
cd /ruta/a/pure24-nutrition-ecommerce

# 2. Ejecuta el script de inicio
bash scripts/start-directus.sh

# 3. Abre el navegador
# http://localhost:8055
```

### Opción 2: Windows (PowerShell)

```powershell
# 1. Abre PowerShell en el directorio del proyecto
cd C:\Users\danie\pure24-nutrition-ecommerce

# 2. Ejecuta el script de inicio
.\scripts\start-directus.ps1

# 3. Abre el navegador
# http://localhost:8055
```

### Opción 3: Manual (cualquier SO)

```bash
# 1. Navega al directorio del proyecto
cd /ruta/a/pure24-nutrition-ecommerce

# 2. Inicia los contenedores
docker-compose up -d

# 3. Espera 10 segundos
# Los contenedores se están inicializando

# 4. Verifica que esté corriendo
curl http://localhost:8055/server/health
# Respuesta esperada: {"status":"ok"}
```

---

## 🔐 Paso 1: Acceder al Admin Panel

1. Abre tu navegador
2. Ve a: **http://localhost:8055**
3. Verás la pantalla de login

**Credenciales:**
- Email: `admin@pure24nutrition.cl` (desde tu `.env`)
- Password: Tu contraseña configurada en `.env`

---

## 🔑 Paso 2: Generar API Token

Una vez dentro del admin panel:

1. Haz clic en tu avatar (arriba a la derecha)
2. Selecciona **"Settings"** (Configuración)
3. En el menú lateral, busca **"Access Tokens"** o **"API Tokens"**
4. Haz clic en **"Create Token"** o **"+ New Token"**
5. Rellena:
   - **Token Name**: `pure24nutrition-api-token`
   - **Role**: `Administrator` (o el rol que necesites)
   - **Expiration**: Deja vacío (nunca expira) o elige una fecha
6. Haz clic en **"Create Token"**
7. **COPIA EL TOKEN** (aparece solo una vez)

---

## 💾 Paso 3: Guardar el Token en .env

Una vez tengas el token:

1. Abre tu archivo `.env`
2. Agrega esta línea al final:
```env
DIRECTUS_API_TOKEN=tu_token_aqui_sin_comillas
```

Ejemplo:
```env
DIRECTUS_API_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImY4MzM...
```

3. Guarda el archivo

---

## ✅ Paso 4: Test de Validez

Ahora vamos a verificar que todo funciona:

### Test 1: Verificar que Directus está corriendo

```bash
curl http://localhost:8055/server/health
```

**Respuesta esperada:**
```json
{"status":"ok"}
```

### Test 2: Verificar acceso con API Token

```bash
curl -H "Authorization: Bearer tu_token_aqui" \
  http://localhost:8055/server/info
```

**Respuesta esperada:**
```json
{
  "project": {
    "project_name": "Pure 24 Nutrition",
    ...
  },
  ...
}
```

### Test 3: Script automático

```bash
# Linux/Mac
bash scripts/validate-config.sh

# Windows (después de actualizar el script)
# Usa validate-config.sh
```

---

## 🗂️ Estructura de Contenedores

### PostgreSQL (puerto 5432)
- **Imagen**: `postgres:15-alpine`
- **Usuario**: `directus`
- **Contraseña**: `directus_secure_password_123`
- **Database**: `directus`
- **Volumen**: `postgres_data:/var/lib/postgresql/data`

### Directus (puerto 8055)
- **Imagen**: `directus/directus:latest`
- **URL**: `http://localhost:8055`
- **Admin Panel**: `http://localhost:8055/admin`
- **REST API**: `http://localhost:8055/rest`
- **GraphQL API**: `http://localhost:8055/graphql`
- **Volúmenes**:
  - `directus_uploads:/directus/uploads` (archivos subidos)
  - `directus_extensions:/directus/extensions` (extensiones custom)

---

## 🛠️ Comandos Útiles

### Ver estado de contenedores
```bash
docker-compose ps
```

### Ver logs en tiempo real
```bash
docker-compose logs -f directus
```

### Detener todo
```bash
docker-compose down
```

### Detener pero mantener volúmenes (datos persisten)
```bash
docker-compose stop
```

### Reiniciar
```bash
docker-compose restart
```

### Limpiar todo (CUIDADO: Borra datos)
```bash
docker-compose down -v
```

---

## 🔗 URLs Importantes

| Servicio | URL | Uso |
|----------|-----|-----|
| **Admin Panel** | http://localhost:8055/admin | Gestión de contenidos |
| **REST API** | http://localhost:8055/rest | Consultas REST |
| **GraphQL** | http://localhost:8055/graphql | Consultas GraphQL |
| **Server Info** | http://localhost:8055/server/info | Información del servidor |
| **Health Check** | http://localhost:8055/server/health | Status del servidor |

---

## 🚨 Troubleshooting

### Puerto 8055 ya está en uso
```bash
# Encuentra el proceso
lsof -i :8055

# O cámbia el puerto en docker-compose.yml
# De: "8055:8055"
# A:  "8056:8055"
```

### PostgreSQL no inicia
```bash
# Verifica el volumen
docker volume ls

# Si hay problemas, borra y recrea
docker-compose down -v
docker-compose up -d
```

### Directus no se conecta a DB
```bash
# Verifica los logs
docker-compose logs postgres
docker-compose logs directus

# Reinicia postgres primero
docker-compose restart postgres
sleep 5
docker-compose restart directus
```

### Olvidé la contraseña de admin
```bash
# Borra todo y reinicia (perderás datos)
docker-compose down -v
docker-compose up -d

# Crea un nuevo admin con las credenciales del .env
```

---

## 📝 Siguientes Pasos

1. ✅ **Setup Directus** (este documento)
2. ⏳ **Crear estructura de datos** (Collections en Directus)
3. ⏳ **Configurar permisos y roles**
4. ⏳ **Integrar con Mercado Pago**
5. ⏳ **Conectar con N8N para workflows**

---

## 🆘 Preguntas Frecuentes

### ¿Puedo acceder a Directus desde otra máquina?
Sí, cambia `PUBLIC_URL` en docker-compose.yml:
```yaml
PUBLIC_URL: http://tu-ip-o-dominio:8055
```

### ¿Cómo hago backup de los datos?
```bash
# Backup de database
docker-compose exec postgres pg_dump -U directus directus > backup.sql

# Backup de archivos
docker cp directus_app:/directus/uploads ./uploads_backup
```

### ¿Puedo usar MySQL en lugar de PostgreSQL?
Sí, pero requiere cambios en docker-compose.yml. Se recomienda PostgreSQL para mejor compatibilidad.

### ¿Cómo agrego más campos a las collections?
A través del admin panel → Collections → Selecciona una → + New Field

---

## 📚 Documentación Oficial

- [Directus Docs](https://docs.directus.io)
- [API Reference](https://docs.directus.io/reference/introduction)
- [Installation Guide](https://docs.directus.io/getting-started/installation/docker)

---

**Estado: Listo para iniciar** ✅
