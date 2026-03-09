# 🚀 Directus - Pasos Siguientes

## ✅ STATUS: DIRECTUS CORRIENDO

**Directus está iniciado y listo en:** http://localhost:8055

**Credenciales de acceso:**
- Email: `admin@pure24nutrition.cl`
- Password: (desde tu `.env` → `DIRECTUS_ADMIN_PASSWORD`)

---

## 📋 PASO 1: Acceder al Admin Panel

1. Abre tu navegador
2. Ve a: **http://localhost:8055**
3. Verás la pantalla de login
4. Inicia sesión con:
   - **Email:** `admin@pure24nutrition.cl`
   - **Password:** La que configuraste en `.env`

---

## 🔑 PASO 2: Generar API Token

Una vez dentro del admin panel:

### En el menú de Directus:

1. **Click en tu avatar** (arriba a la derecha)
2. **Selecciona "Settings"** (⚙️ Configuración)
3. En el menú lateral izquierdo, busca **"Access Tokens"** o **"API Tokens"**
4. **Click en "Create Token"** o botón **"+"**
5. Rellena lo siguiente:

```
Token Name:     pure24nutrition-api-key
Role:           Administrator
Expiration:     (Deja vacío - nunca expira)
Descripción:    API token para integración con frontend y N8N
```

6. **Click en "Create Token"**
7. **COPIA EL TOKEN** (aparece solo una vez - no podrás verlo después)

**Ejemplo de token:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImY4MzM4ZGM3LWM5NWEtNDJlYy04Nj...
```

---

## 💾 PASO 3: Guardar Token en .env

1. Abre tu archivo `.env`
2. Busca la línea `DIRECTUS_API_TOKEN` (o créala)
3. Agrega el token sin comillas:

```env
DIRECTUS_API_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImY4MzM...
```

4. Guarda el archivo

---

## ✅ PASO 4: Test de Validez

### Test 1: Verificar servidor
```bash
curl http://localhost:8055/server/health
```

**Respuesta esperada:**
```json
{"status":"ok"}
```

### Test 2: Acceder con API Token
```bash
curl -H "Authorization: Bearer tu_token_aqui" \
  http://localhost:8055/server/info
```

**Respuesta esperada:**
```json
{
  "project": {
    "project_name": "Pure 24 Nutrition",
    "default_language": "es",
    ...
  },
  ...
}
```

---

## 🛠️ Comandos útiles

### Ver estado de los contenedores
```bash
docker-compose ps
```

### Ver logs en tiempo real
```bash
docker-compose logs -f directus
```

### Reiniciar Directus
```bash
docker-compose restart directus
```

### Detener todo (sin borrar datos)
```bash
docker-compose stop
```

### Reanudar después de detener
```bash
docker-compose start
```

---

## 🔗 URLs Importantes

| Servicio | URL |
|----------|-----|
| Admin Panel | http://localhost:8055/admin |
| API REST | http://localhost:8055/rest |
| GraphQL | http://localhost:8055/graphql |
| Health Check | http://localhost:8055/server/health |
| Server Info | http://localhost:8055/server/info |

---

## 📝 Información de Conexión

```
Host: localhost
Puerto: 8055
Admin Email: admin@pure24nutrition.cl
Database: directus (PostgreSQL)
Database Port: 5433
Database User: directus
```

---

## 🚨 ¿Algo salió mal?

### Problema: "Connection refused"
```bash
# Verifica que Docker está corriendo
docker ps

# Reinicia los contenedores
docker-compose restart
```

### Problema: "EAI_AGAIN" o "can't reach postgres"
```bash
# Reinicia desde cero
docker-compose down
docker-compose up -d
sleep 20
curl http://localhost:8055/server/health
```

### Problema: "Puerto 8055 ya en uso"
```bash
# Encuentra qué usa el puerto
lsof -i :8055

# Si quieres cambiar el puerto, edita docker-compose.yml
# De: "8055:8055"
# A:  "8056:8055"
# Luego: docker-compose restart
```

---

## 📚 Próximos pasos (cuando estés listo)

1. ✅ **Directus está corriendo** (TÚ ESTÁS AQUÍ)
2. ⏳ **Crear Collections** (tablas de datos para productos, pedidos, etc.)
3. ⏳ **Configurar permisos y roles**
4. ⏳ **Integrar con Mercado Pago**
5. ⏳ **Conectar con N8N para workflows**
6. ⏳ **Integrar frontend**

---

## ✅ Checklist de Setup

- [ ] Directus corriendo en http://localhost:8055
- [ ] Accediste con admin@pure24nutrition.cl
- [ ] Generaste API Token
- [ ] Guardaste el token en .env
- [ ] Hiciste test con curl a /server/health
- [ ] Hiciste test con curl a /server/info
- [ ] Entiendes la estructura (Admin Panel + API)

**Una vez completes todo esto, avísame para continuar con las siguientes fases.** 🚀
