# Script para actualizar el frontend en S3
$BUCKET_NAME = "techstore-frontend-9871"  # Tu bucket actual
$DIST_FOLDER = ".\dist"

Write-Host "🔄 Actualizando frontend en S3..." -ForegroundColor Green

# Verificar que la carpeta dist existe
if (-not (Test-Path $DIST_FOLDER)) {
    Write-Host "❌ Error: La carpeta '$DIST_FOLDER' no existe. Ejecuta 'npm run build' primero." -ForegroundColor Red
    exit 1
}

# Construir el proyecto
Write-Host "🏗️ Construyendo el proyecto..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error en el build. Revisa los errores arriba." -ForegroundColor Red
    exit 1
}

# Subir archivos actualizados
Write-Host "📤 Subiendo archivos actualizados..." -ForegroundColor Yellow
aws s3 sync $DIST_FOLDER s3://$BUCKET_NAME --delete

# Configurar cache para el HTML (sin cache)
Write-Host "🔧 Configurando cache para index.html..." -ForegroundColor Yellow
aws s3 cp s3://$BUCKET_NAME/index.html s3://$BUCKET_NAME/index.html --metadata-directive REPLACE --content-type "text/html" --cache-control "no-cache"

# Mostrar resultado
$WEBSITE_URL = "http://$BUCKET_NAME.s3-website-us-east-1.amazonaws.com"
Write-Host "`n✅ ¡Actualización completada!" -ForegroundColor Green
Write-Host "🌐 Tu sitio actualizado: $WEBSITE_URL" -ForegroundColor Cyan
Write-Host "💡 Los cambios deberían ser visibles inmediatamente" -ForegroundColor Yellow
