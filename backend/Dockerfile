FROM node:20-alpine
WORKDIR /app

# Instalar dependencias del sistema
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    curl

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias Node
RUN npm ci

# Copiar código fuente
COPY . .

# Build Payload si es necesario
RUN npm run build 2>/dev/null || echo "No build script found"

# Crear carpeta media
RUN mkdir -p media

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

# Exponer puerto
EXPOSE 3000

# Iniciar Payload
CMD ["npm", "run", "dev"]
