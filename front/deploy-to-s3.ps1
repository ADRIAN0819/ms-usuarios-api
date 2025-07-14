# Script para desplegar el frontend a S3
# Configuración
$BUCKET_NAME = "techstore-frontend-$(Get-Random -Minimum 1000 -Maximum 9999)"
$REGION = "us-east-1"
$DIST_FOLDER = ".\dist"

Write-Host "🚀 Iniciando despliegue a S3..." -ForegroundColor Green
Write-Host "📋 Información importante: Este script deshabilitará temporalmente Block Public Access para hosting web" -ForegroundColor Yellow

# Verificar que la carpeta dist existe
if (-not (Test-Path $DIST_FOLDER)) {
    Write-Host "❌ Error: La carpeta '$DIST_FOLDER' no existe. Ejecuta 'npm run build' primero." -ForegroundColor Red
    exit 1
}

# Paso 1: Crear el bucket S3
Write-Host "`n📦 Creando bucket S3: $BUCKET_NAME" -ForegroundColor Yellow
$createResult = aws s3 mb s3://$BUCKET_NAME --region $REGION 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Bucket creado exitosamente" -ForegroundColor Green
} else {
    Write-Host "⚠️  Error al crear bucket: $createResult" -ForegroundColor Red
    if ($createResult -like "*BucketAlreadyExists*") {
        Write-Host "🔄 Generando nuevo nombre de bucket..." -ForegroundColor Yellow
        $BUCKET_NAME = "techstore-frontend-$(Get-Random -Minimum 10000 -Maximum 99999)"
        Write-Host "📦 Intentando con: $BUCKET_NAME" -ForegroundColor Yellow
        aws s3 mb s3://$BUCKET_NAME --region $REGION
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ No se pudo crear el bucket. Verifica tus permisos de AWS." -ForegroundColor Red
            exit 1
        }
    } else {
        exit 1
    }
}

# Paso 2: Deshabilitar Block Public Access (necesario para hosting web)
Write-Host "`n🔓 Deshabilitando Block Public Access..." -ForegroundColor Yellow
aws s3api put-public-access-block --bucket $BUCKET_NAME --public-access-block-configuration "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false"

# Paso 3: Configurar el bucket para hosting estático
Write-Host "`n🌐 Configurando hosting estático..." -ForegroundColor Yellow
aws s3 website s3://$BUCKET_NAME --index-document index.html --error-document index.html

# Paso 4: Configurar política del bucket para acceso público
Write-Host "`n🔓 Configurando política de acceso público..." -ForegroundColor Yellow
$bucketPolicyJson = @"
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::$BUCKET_NAME/*"
        }
    ]
}
"@

# Guardar la política en un archivo temporal
$bucketPolicyJson | Out-File -FilePath "bucket-policy.json" -Encoding UTF8

# Aplicar la política
aws s3api put-bucket-policy --bucket $BUCKET_NAME --policy file://bucket-policy.json

# Paso 5: Subir los archivos
Write-Host "`n📤 Subiendo archivos al bucket..." -ForegroundColor Yellow
aws s3 sync $DIST_FOLDER s3://$BUCKET_NAME --delete

# Paso 6: Configurar tipos de contenido correctos
Write-Host "`n📝 Configurando tipos de contenido..." -ForegroundColor Yellow
aws s3 cp s3://$BUCKET_NAME/index.html s3://$BUCKET_NAME/index.html --metadata-directive REPLACE --content-type "text/html" --cache-control "no-cache"
aws s3 cp s3://$BUCKET_NAME/ s3://$BUCKET_NAME/ --recursive --exclude "*" --include "*.css" --metadata-directive REPLACE --content-type "text/css" --cache-control "max-age=31536000"
aws s3 cp s3://$BUCKET_NAME/ s3://$BUCKET_NAME/ --recursive --exclude "*" --include "*.js" --metadata-directive REPLACE --content-type "application/javascript" --cache-control "max-age=31536000"

# Paso 7: Mostrar la URL del sitio web
$WEBSITE_URL = "http://$BUCKET_NAME.s3-website-$REGION.amazonaws.com"
Write-Host "`n🎉 ¡Despliegue completado!" -ForegroundColor Green
Write-Host "🌐 Tu aplicación está disponible en: $WEBSITE_URL" -ForegroundColor Cyan
Write-Host "📦 Nombre del bucket: $BUCKET_NAME" -ForegroundColor Cyan

# Limpiar archivos temporales
Remove-Item "bucket-policy.json" -ErrorAction SilentlyContinue

Write-Host "`n📋 Comandos útiles:" -ForegroundColor Yellow
Write-Host "   Para actualizar el sitio: aws s3 sync .\dist s3://$BUCKET_NAME --delete" -ForegroundColor White
Write-Host "   Para eliminar el bucket: aws s3 rb s3://$BUCKET_NAME --force" -ForegroundColor White
