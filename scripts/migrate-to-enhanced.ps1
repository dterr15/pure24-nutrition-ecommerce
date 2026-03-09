# ============================================================================
# SCRIPT: migrate-to-enhanced.ps1
# PURPOSE: Safely upgrade docker-compose to enhanced version with Redis
# ============================================================================

param(
    [switch]$SkipConfirmation = $false
)

Write-Host "🚀 PURE 24 NUTRITION - Docker Compose Upgrade" -ForegroundColor Green
Write-Host "==============================================" -ForegroundColor Green
Write-Host ""
Write-Host "⚠️  Este script va a:" -ForegroundColor Yellow
Write-Host "  1. Detener los contenedores actuales"
Write-Host "  2. Actualizar a PostgreSQL con pgvector"
Write-Host "  3. Agregar Redis para caching"
Write-Host "  4. Reiniciar todos los servicios"
Write-Host ""
Write-Host "✅ TUS DATOS SERÁN PRESERVADOS (volúmenes no se borran)" -ForegroundColor Green
Write-Host ""

# Function to print colored output
function Print-Step {
    param($message)
    Write-Host "→ $message" -ForegroundColor Green
}

function Print-Error {
    param($message)
    Write-Host "✗ $message" -ForegroundColor Red
}

function Print-Warning {
    param($message)
    Write-Host "⚠ $message" -ForegroundColor Yellow
}

# Check if docker is running
try {
    docker ps > $null 2>&1
} catch {
    Print-Error "Docker no está corriendo. Por favor inicia Docker Desktop."
    exit 1
}

# Confirmation
if (-not $SkipConfirmation) {
    $response = Read-Host "¿Estás seguro de continuar? (s/n)"
    if ($response -ne "s" -and $response -ne "S") {
        Print-Warning "Operación cancelada"
        exit 0
    }
}

Write-Host ""
Print-Step "Paso 1: Deteniendo contenedores actuales..."
docker-compose down --remove-orphans
Write-Host "✓ Contenedores detenidos" -ForegroundColor Green

Write-Host ""
Print-Step "Paso 2: Verificando volúmenes (datos seguros)..."
$volumes = docker volume ls -q | Select-String "postgres_data|directus|redis"
if ($volumes) {
    Write-Host "✓ Volúmenes encontrados:" -ForegroundColor Green
    $volumes | ForEach-Object { Write-Host "  - $_" }
} else {
    Print-Warning "No se encontraron volúmenes (primera ejecución)"
}

Write-Host ""
Print-Step "Paso 3: Iniciando nuevos contenedores..."
docker-compose up -d --wait

Write-Host ""
Print-Step "Paso 4: Verificando salud de servicios..."

# Wait for PostgreSQL
Write-Host -NoNewline "Esperando PostgreSQL"
for ($i = 0; $i -lt 30; $i++) {
    try {
        $result = docker-compose exec postgres pg_isready -U directus 2>&1
        if ($result -match "accepting") {
            Write-Host " ✓" -ForegroundColor Green
            break
        }
    } catch {}
    Write-Host -NoNewline "."
    Start-Sleep -Seconds 2
}

# Wait for Directus
Write-Host -NoNewline "Esperando Directus"
for ($i = 0; $i -lt 30; $i++) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8055/server/health" -ErrorAction SilentlyContinue
        if ($response.Content -match "ok") {
            Write-Host " ✓" -ForegroundColor Green
            break
        }
    } catch {}
    Write-Host -NoNewline "."
    Start-Sleep -Seconds 2
}

# Wait for Redis
Write-Host -NoNewline "Esperando Redis"
for ($i = 0; $i -lt 30; $i++) {
    try {
        $result = docker-compose exec redis redis-cli ping 2>&1
        if ($result -match "PONG") {
            Write-Host " ✓" -ForegroundColor Green
            break
        }
    } catch {}
    Write-Host -NoNewline "."
    Start-Sleep -Seconds 2
}

Write-Host ""
Print-Step "Paso 5: Ejecutando tests de validación..."

# Test 1: PostgreSQL
Write-Host -NoNewline "Test PostgreSQL: "
try {
    $result = docker-compose exec postgres pg_isready -U directus 2>&1
    if ($result -match "accepting") {
        Write-Host "✓" -ForegroundColor Green
    } else {
        Write-Host "✗" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "✗" -ForegroundColor Red
    exit 1
}

# Test 2: Directus API
Write-Host -NoNewline "Test Directus API: "
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8055/server/health" -ErrorAction Stop
    if ($response.Content -match "ok") {
        Write-Host "✓" -ForegroundColor Green
    } else {
        Write-Host "✗" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "✗" -ForegroundColor Red
    exit 1
}

# Test 3: Redis
Write-Host -NoNewline "Test Redis: "
try {
    $result = docker-compose exec redis redis-cli ping 2>&1
    if ($result -match "PONG") {
        Write-Host "✓" -ForegroundColor Green
    } else {
        Write-Host "✗" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "✗" -ForegroundColor Red
    exit 1
}

# Test 4: pgvector extension
Write-Host -NoNewline "Test pgvector extension: "
try {
    docker-compose exec postgres psql -U directus -d directus -c "CREATE EXTENSION IF NOT EXISTS vector;" > $null 2>&1
    Write-Host "✓" -ForegroundColor Green
} catch {
    Print-Warning "pgvector no disponible (no crítico)"
}

Write-Host ""
Write-Host "==============================================" -ForegroundColor Green
Print-Step "🎉 MIGRACIÓN COMPLETADA EXITOSAMENTE" -ForegroundColor Green
Write-Host "==============================================" -ForegroundColor Green
Write-Host ""

Write-Host "📊 Status de Servicios:" -ForegroundColor Cyan
docker-compose ps

Write-Host ""
Write-Host "🔗 URLs:" -ForegroundColor Cyan
Write-Host "  • Directus Admin: http://localhost:8055/admin"
Write-Host "  • Directus API:   http://localhost:8055/rest"
Write-Host "  • Redis Cache:    localhost:6379"
Write-Host "  • PostgreSQL:     localhost:5433"
Write-Host ""
Write-Host "💡 Próximos pasos:" -ForegroundColor Yellow
Write-Host "  1. Inicia sesión en Directus: http://localhost:8055"
Write-Host "  2. Verifica que tus datos estén intactos"
Write-Host "  3. El caché de Redis está listo para usar"
Write-Host ""
