# verify-brotli-compression.ps1
# Script para validar que Brotli está comprimiendo assets en Cloudflare Pages
# Pure 24 Nutrition - Windows PowerShell version

Write-Host "🔍 Verificando compresión Brotli en Cloudflare..." -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# URLs para validar
$urls = @(
  "https://pure24nutrition.cl/",
  "https://pure24nutrition.cl/productos"
)

$expectedCompression = "br"  # br = Brotli

Write-Host "Validando compresión en URLs:" -ForegroundColor White
Write-Host ""

foreach ($url in $urls) {
  Write-Host -NoNewline "🔗 $url ... "

  try {
    # Hacer request y obtener headers
    $response = Invoke-WebRequest -Uri $url -Headers @{"Accept-Encoding" = "gzip, deflate, br"} -Method Head -SkipHttpErrorCheck

    # Extraer Content-Encoding
    $encoding = $response.Headers["Content-Encoding"]

    if ([string]::IsNullOrEmpty($encoding)) {
      Write-Host "⚠️ Sin compresión detectada" -ForegroundColor Yellow
    } elseif ($encoding -eq "br") {
      Write-Host "✅ Brotli activado (br)" -ForegroundColor Green
    } elseif ($encoding -eq "gzip") {
      Write-Host "⚠️ Gzip detectado (no Brotli)" -ForegroundColor Yellow
    } else {
      Write-Host "❌ Encoding desconocido: $encoding" -ForegroundColor Red
    }
  } catch {
    Write-Host "❌ Error al conectar: $_" -ForegroundColor Red
  }
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 Validación de Cache Headers:" -ForegroundColor White
Write-Host ""

# Validar cache headers
Write-Host "HTML (sin caché):" -ForegroundColor White
try {
  $response = Invoke-WebRequest -Uri "https://pure24nutrition.cl/" -Method Head -SkipHttpErrorCheck
  $cacheControl = $response.Headers["Cache-Control"]
  if ($cacheControl) {
    Write-Host "  Cache-Control: $cacheControl" -ForegroundColor Green
  } else {
    Write-Host "  Cache-Control: No definido" -ForegroundColor Yellow
  }
} catch {
  Write-Host "  Error: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "Assets (1 año - expected):" -ForegroundColor White
Write-Host "  (Validación manual: Abre DevTools → Network → Click en .css o .js)" -ForegroundColor Gray

Write-Host ""
Write-Host "Imágenes (30 días - expected):" -ForegroundColor White
Write-Host "  (Validación manual: Abre DevTools → Network → Click en imagen)" -ForegroundColor Gray

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "✅ Validación completada" -ForegroundColor Green
Write-Host ""
Write-Host "ℹ️  Próximos pasos:" -ForegroundColor Cyan
Write-Host "  1. Abre https://pure24nutrition.cl en navegador"
Write-Host "  2. Presiona F12 → Network tab"
Write-Host "  3. Recarga (F5)"
Write-Host "  4. Click en cualquier asset"
Write-Host "  5. Response Headers → Busca 'content-encoding:' → Debe mostrar 'br'"
Write-Host ""
Write-Host "Si no ves Brotli:" -ForegroundColor Yellow
Write-Host "  • Hard refresh: Ctrl+Shift+R"
Write-Host "  • Espera 10 minutos después del deploy"
Write-Host "  • Verifica que '_headers' esté en raíz del proyecto"
Write-Host ""
