# Pure24 Nutrition - API Contracts

**Base URL:** `http://localhost:3000/api` (desarrollo)
**Production:** `https://api.pure24nutrition.cl/api`

---

## 1. PRODUCTS Endpoints

### 1.1 Listar productos (con filtros, búsqueda, paginación)

```
GET /api/products
```

**Query Parameters:**
```
?limit=20                                    # Productos por página (default: 10)
?page=1                                      # Número de página
?where[name][contains]=whey                  # Búsqueda por nombre
?where[category][equals]=proteins            # Filtrar por categoría
?where[active][equals]=true                  # Solo activos
?where[featured][equals]=true                # Solo destacados
?sort=-createdAt                             # Ordenar (- = descendente)
```

**Response 200 OK:**
```json
{
  "docs": [
    {
      "id": "uuid-1",
      "name": "Whey Protein Isolate Premium",
      "sku": "WPI-001",
      "gtin13": "7501234567890",
      "price": 34990,
      "discountedPrice": null,
      "stock": 50,
      "category": "proteins",
      "description": "Proteína de suero...",
      "tags": ["sin gluten", "bajo en lactosa"],
      "active": true,
      "featured": true,
      "specifications": {
        "servingSize": "25g (1 scoop)",
        "servingsPerContainer": 40,
        "ingredient": "Whey Protein Isolate",
        "ingredientAmount": "25g",
        "weight": "1kg"
      },
      "dosage": {
        "recommendedDaily": "25g (1 scoop)",
        "maxDaily": "75g (3 scoops)",
        "timing": "post_workout"
      },
      "mainImage": {
        "id": "img-uuid-1",
        "url": "/media/products/whey-isolate.jpg",
        "alt": "Whey Protein Isolate Premium"
      },
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ],
  "totalDocs": 50,
  "limit": 20,
  "totalPages": 3,
  "page": 1,
  "pagingCounter": 1,
  "hasPrevPage": false,
  "hasNextPage": true,
  "prevPage": null,
  "nextPage": 2
}
```

**Ejemplos de uso:**
```bash
# Listar todos los proteínicos
curl "http://localhost:3000/api/products?where[category][equals]=proteins&limit=20"

# Buscar "whey"
curl "http://localhost:3000/api/products?where[name][contains]=whey"

# Productos destacados
curl "http://localhost:3000/api/products?where[featured][equals]=true&limit=10"

# Búsqueda + ordenado por precio
curl "http://localhost:3000/api/products?where[category][equals]=pre_workout&sort=price&limit=10"
```

### 1.2 Obtener producto por ID

```
GET /api/products/{id}
```

**Response 200 OK:**
```json
{
  "id": "uuid-1",
  "name": "Whey Protein Isolate Premium",
  "sku": "WPI-001",
  "gtin13": "7501234567890",
  "price": 34990,
  "stock": 50,
  "category": "proteins",
  "description": "...",
  "mainImage": { "url": "/media/..." },
  "images": [
    {
      "image": { "url": "/media/..." },
      "alt": "Imagen alternativa"
    }
  ],
  "specifications": {},
  "dosage": {},
  "seo": {
    "metaTitle": "Whey Protein Isolate Premium - Pure24",
    "metaDescription": "Proteína de suero...",
    "keywords": "whey, proteína, isolate"
  },
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

**Response 404 Not Found:**
```json
{
  "errors": [
    {
      "message": "Producto no encontrado"
    }
  ]
}
```

### 1.3 Crear producto (Admin)

```
POST /api/products
```

**Authorization:** Token Bearer (incluir auth token en headers)

**Request Body:**
```json
{
  "name": "Nuevo Producto",
  "sku": "NEW-001",
  "gtin13": "7501234567999",
  "price": 25000,
  "discountedPrice": 20000,
  "stock": 100,
  "category": "proteins",
  "description": "Descripción del producto",
  "active": true,
  "featured": true
}
```

**Response 201 Created:**
```json
{
  "id": "uuid-nuevo",
  "name": "Nuevo Producto",
  "sku": "NEW-001",
  "price": 25000
}
```

**Response 401 Unauthorized:**
```json
{
  "errors": [
    {
      "message": "No autorizado"
    }
  ]
}
```

**Response 422 Unprocessable Entity:**
```json
{
  "errors": [
    {
      "message": "SKU debe ser único",
      "field": "sku"
    },
    {
      "message": "GTIN-13 inválido",
      "field": "gtin13"
    }
  ]
}
```

### 1.4 Actualizar producto (Admin)

```
PUT /api/products/{id}
```

**Request Body:** (campos que quieres actualizar)
```json
{
  "price": 28990,
  "stock": 45,
  "featured": false
}
```

**Response 200 OK:**
```json
{
  "id": "uuid-1",
  "price": 28990,
  "stock": 45,
  "featured": false,
  "updatedAt": "2024-01-20T14:45:00Z"
}
```

### 1.5 Eliminar producto (Admin)

```
DELETE /api/products/{id}
```

**Response 200 OK:**
```json
{
  "id": "uuid-1",
  "message": "Producto eliminado"
}
```

**Response 404 Not Found:**
```json
{
  "errors": [
    {
      "message": "Producto no encontrado"
    }
  ]
}
```

---

## 2. ORDERS Endpoints

### 2.1 Crear orden (Checkout)

```
POST /api/orders
```

**Request Body:**
```json
{
  "customerEmail": "cliente@example.com",
  "customerName": "Juan Pérez",
  "customerPhone": "+56912345678",
  "shipping": {
    "street": "Calle Principal 123",
    "apartment": "Apto 4B",
    "city": "Punta Arenas",
    "region": "Magallanes y de la Antártica Chilena",
    "postalCode": "6200000",
    "country": "Chile"
  },
  "items": [
    {
      "product": "uuid-producto-1",
      "quantity": 2,
      "priceAtPurchase": 34990
    },
    {
      "product": "uuid-producto-2",
      "quantity": 1,
      "priceAtPurchase": 19990
    }
  ],
  "subtotal": 89970,
  "shippingCost": 5000,
  "discount": 0,
  "total": 94970,
  "customerNotes": "Entregar después de las 18:00"
}
```

**Response 201 Created:**
```json
{
  "id": "uuid-orden-1",
  "orderNumber": "ORD-1705348200000-abc123def",
  "customerEmail": "cliente@example.com",
  "customerName": "Juan Pérez",
  "total": 94970,
  "status": "pending",
  "items": [
    {
      "product": {
        "id": "uuid-1",
        "name": "Whey Protein Isolate Premium"
      },
      "quantity": 2,
      "priceAtPurchase": 34990
    }
  ],
  "createdAt": "2024-01-20T15:30:00Z"
}
```

**Response 422 Unprocessable Entity:**
```json
{
  "errors": [
    {
      "message": "Email inválido",
      "field": "customerEmail"
    },
    {
      "message": "Items vacío",
      "field": "items"
    }
  ]
}
```

### 2.2 Listar órdenes del cliente

```
GET /api/orders
```

**Comportamiento:**
- Si NO eres admin: solo ves tus órdenes (filtrado por tu email)
- Si eres admin: ves TODAS las órdenes

**Query Parameters:**
```
?limit=20
?page=1
?where[status][equals]=pending
?sort=-createdAt
```

**Response 200 OK:**
```json
{
  "docs": [
    {
      "id": "uuid-1",
      "orderNumber": "ORD-1705348200000-abc123def",
      "customerEmail": "cliente@example.com",
      "customerName": "Juan Pérez",
      "total": 94970,
      "status": "pending",
      "createdAt": "2024-01-20T15:30:00Z"
    }
  ],
  "totalDocs": 5,
  "limit": 20,
  "totalPages": 1,
  "page": 1,
  "hasNextPage": false
}
```

### 2.3 Obtener orden por ID

```
GET /api/orders/{id}
```

**Response 200 OK:**
```json
{
  "id": "uuid-1",
  "orderNumber": "ORD-1705348200000-abc123def",
  "customerEmail": "cliente@example.com",
  "customerName": "Juan Pérez",
  "customerPhone": "+56912345678",
  "shipping": {
    "street": "Calle Principal 123",
    "city": "Punta Arenas",
    "region": "Magallanes y de la Antártica Chilena",
    "postalCode": "6200000"
  },
  "items": [
    {
      "product": {
        "id": "uuid-1",
        "name": "Whey Protein Isolate Premium",
        "sku": "WPI-001"
      },
      "quantity": 2,
      "priceAtPurchase": 34990
    }
  ],
  "subtotal": 69980,
  "shippingCost": 5000,
  "discount": 0,
  "total": 74980,
  "status": "pending",
  "mercadoPago": {
    "transactionId": null,
    "paymentId": null,
    "paymentMethod": null
  },
  "tracking": {
    "carrier": null,
    "trackingNumber": null,
    "estimatedDelivery": null
  },
  "createdAt": "2024-01-20T15:30:00Z",
  "updatedAt": "2024-01-20T15:30:00Z"
}
```

### 2.4 Actualizar estado de orden (Admin)

```
PUT /api/orders/{id}
```

**Request Body:**
```json
{
  "status": "paid",
  "notes": "Pago confirmado por Mercado Pago"
}
```

**Estados válidos:**
```
pending          → Pendiente de pago
paid             → Pagada ✅
processing       → Preparando envío
shipped          → Enviada 🚚
delivered        → Entregada ✔️
cancelled        → Cancelada
payment_failed   → Problema con pago
```

**Response 200 OK:**
```json
{
  "id": "uuid-1",
  "orderNumber": "ORD-1705348200000-abc123def",
  "status": "paid",
  "notes": "Pago confirmado por Mercado Pago",
  "updatedAt": "2024-01-20T16:00:00Z"
}
```

---

## 3. MEDIA Endpoints

### 3.1 Subir imagen

```
POST /api/media
```

**Form Data:**
```
file: [archivo de imagen]
alt: "Texto alternativo para SEO"
caption: "Descripción opcional"
```

**Response 201 Created:**
```json
{
  "id": "uuid-imagen",
  "filename": "whey-isolate.jpg",
  "mimeType": "image/jpeg",
  "filesize": 245634,
  "width": 1200,
  "height": 600,
  "url": "/media/whey-isolate.jpg",
  "alt": "Whey Protein Isolate",
  "sizes": {
    "thumbnail": {
      "url": "/media/whey-isolate-thumbnail.jpg",
      "width": 200,
      "height": 200
    },
    "card": {
      "url": "/media/whey-isolate-card.jpg",
      "width": 500,
      "height": 500
    },
    "hero": {
      "url": "/media/whey-isolate-hero.jpg",
      "width": 1200,
      "height": 600
    }
  },
  "createdAt": "2024-01-20T16:00:00Z"
}
```

### 3.2 Listar imágenes

```
GET /api/media
```

**Response 200 OK:**
```json
{
  "docs": [
    {
      "id": "uuid-1",
      "filename": "whey-isolate.jpg",
      "url": "/media/whey-isolate.jpg",
      "alt": "Whey Protein Isolate"
    }
  ],
  "totalDocs": 50,
  "limit": 10,
  "totalPages": 5,
  "page": 1
}
```

---

## 4. AUTHENTICATION

### 4.1 Login

```
POST /api/users/login
```

**Request Body:**
```json
{
  "email": "admin@pure24.cl",
  "password": "Admin@123456"
}
```

**Response 200 OK:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-admin",
    "email": "admin@pure24.cl",
    "name": "Administrador Pure24",
    "role": "admin",
    "active": true
  }
}
```

**Response 401 Unauthorized:**
```json
{
  "errors": [
    {
      "message": "Email o contraseña incorrectos"
    }
  ]
}
```

### 4.2 Usar token en headers

Para endpoints que requieren autenticación, incluir:

```bash
curl -H "Authorization: Bearer {token}" \
     -X POST http://localhost:3000/api/products \
     -d '{...}'
```

---

## 5. ERROR HANDLING

### Errores comunes

**400 Bad Request:**
```json
{
  "errors": [
    {
      "message": "Parámetro inválido"
    }
  ]
}
```

**401 Unauthorized:**
```json
{
  "errors": [
    {
      "message": "Token inválido o expirado"
    }
  ]
}
```

**403 Forbidden:**
```json
{
  "errors": [
    {
      "message": "No tienes permiso para esta acción"
    }
  ]
}
```

**404 Not Found:**
```json
{
  "errors": [
    {
      "message": "Recurso no encontrado"
    }
  ]
}
```

**422 Unprocessable Entity:**
```json
{
  "errors": [
    {
      "message": "Validación fallida",
      "data": [
        {
          "message": "SKU debe ser único",
          "field": "sku"
        }
      ]
    }
  ]
}
```

**500 Internal Server Error:**
```json
{
  "errors": [
    {
      "message": "Error interno del servidor"
    }
  ]
}
```

---

## 6. EJEMPLOS COMPLETOS DE USO

### Ejemplo 1: Crear carrito y orden

```bash
# 1. Obtener producto
curl "http://localhost:3000/api/products?where[name][contains]=Whey"

# 2. Crear orden con ese producto
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerEmail": "cliente@example.com",
    "customerName": "Juan",
    "customerPhone": "+56912345678",
    "shipping": {
      "street": "Calle 123",
      "city": "Punta Arenas",
      "region": "Magallanes",
      "postalCode": "6200000",
      "country": "Chile"
    },
    "items": [{"product": "uuid-1", "quantity": 1, "priceAtPurchase": 34990}],
    "subtotal": 34990,
    "shippingCost": 5000,
    "total": 39990
  }'

# 3. Admin confirma pago
curl -X PUT http://localhost:3000/api/orders/uuid-orden \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"status": "paid"}'
```

---

**Última actualización:** Enero 2024
**Versión:** 1.0
**Contacto:** dev@pure24nutrition.cl
