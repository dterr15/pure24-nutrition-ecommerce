# Script para iniciar Directus con Docker Compose (Windows PowerShell)
# Uso: .\scripts\start-directus.ps1

Write-Host "🚀 Iniciando Directus..." -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green

# Verificar que Docker está corriendo
try {
    $docker_info = docker info 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Docker no está corriendo. Por favor inicia Docker." -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Error al verificar Docker: $_" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Docker está disponible" -ForegroundColor Yellow

# Verificar que .env existe
if (-not (Test-Path ".env")) {
    Write-Host "❌ Archivo .env no encontrado" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Archivo .env encontrado" -ForegroundColor Yellow

# Cargar variables del .env
$env_content = Get-Content ".env" | Where-Object { $_ -notmatch "^#" -and $_ -notmatch "^$" }
foreach ($line in $env_content) {
    $key, $value = $line -split "=", 2
    if ($key -and $value) {
        [Environment]::SetEnvironmentVariable($key.Trim(), $value.Trim(), "Process")
    }
}

# Verificar que tenemos las credenciales de Directus
if ([string]::IsNullOrEmpty($env:DIRECTUS_ADMIN_EMAIL) -or [string]::IsNullOrEmpty($env:DIRECTUS_ADMIN_PASSWORD)) {
    Write-Host "❌ DIRECTUS_ADMIN_EMAIL o DIRECTUS_ADMIN_PASSWORD no están configurados" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Credenciales de Directus encontradas" -ForegroundColor Yellow

# Iniciar contenedores
Write-Host ""
Write-Host "📦 Iniciando contenedores Docker..." -ForegroundColor Yellow
docker-compose up -d

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al iniciar docker-compose" -ForegroundColor Red
    exit 1
}

# Esperar a que Directus esté listo
Write-Host ""
Write-Host "⏳ Esperando a que Directus esté listo..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Test de conexión
$response = $null
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8055/server/health" -ErrorAction SilentlyContinue
    $health_check = $response.StatusCode
} catch {
    $health_check = 0
}

if ($health_check -eq 200) {
    Write-Host "✅ Directus está corriendo correctamente" -ForegroundColor Green
} else {
    Write-Host "⏳ Directus se está inicializando... (intenta en 10 segundos más)" -ForegroundColor Yellow
    Start-Sleep -Seconds 10
}

Write-Host ""
Write-Host "================================" -ForegroundColor Green
Write-Host "🎉 DIRECTUS INICIADO EXITOSAMENTE" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Información:" -ForegroundColor Cyan
Write-Host "   URL: http://localhost:8055" -ForegroundColor White
Write-Host "   Email: $env:DIRECTUS_ADMIN_EMAIL" -ForegroundColor White
Write-Host "   Password: (desde tu .env)" -ForegroundColor White
Write-Host ""
Write-Host "🔗 API:" -ForegroundColor Cyan
Write-Host "   REST API: http://localhost:8055/rest" -ForegroundColor White
Write-Host "   GraphQL API: http://localhost:8055/graphql" -ForegroundColor White
Write-Host ""
Write-Host "💾 Database:" -ForegroundColor Cyan
Write-Host "   Host: localhost:5432" -ForegroundColor White
Write-Host "   User: directus" -ForegroundColor White
Write-Host "   Database: directus" -ForegroundColor White
Write-Host ""
Write-Host "📝 Próximos pasos:" -ForegroundColor Cyan
Write-Host "   1. Abre http://localhost:8055 en tu navegador" -ForegroundColor White
Write-Host "   2. Inicia sesión con tus credenciales" -ForegroundColor White
Write-Host "   3. Genera un API Token en Configuración > Tokens API" -ForegroundColor White
Write-Host "   4. Copia el token al .env (DIRECTUS_API_TOKEN)" -ForegroundColor White
Write-Host ""
Write-Host "❌ Para detener:" -ForegroundColor Cyan
Write-Host "   docker-compose down" -ForegroundColor White
Write-Host ""
Write-Host "📋 Para ver logs:" -ForegroundColor Cyan
Write-Host "   docker-compose logs -f directus" -ForegroundColor White
