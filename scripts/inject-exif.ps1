$EXIFTOOL = "C:\Program Files (x86)\Exiftool\exiftool.exe"
$LANDMARK_LAT = "-53.163700"
$LANDMARK_LNG = "-70.908100"
$IMG_FOLDER = "public/assets/img"

if (-not (Test-Path $EXIFTOOL)) {
  Write-Host "exiftool not found"
  exit 1
}

Write-Host "exiftool found"

$images = @(Get-ChildItem "$IMG_FOLDER" -Include *.jpg, *.jpeg, *.webp, *.png -ErrorAction SilentlyContinue)

if ($images.Count -eq 0) {
  Write-Host "No images found in $IMG_FOLDER"
  exit 0
}

Write-Host "Processing $($images.Count) files"

foreach ($img in $images) {
  Write-Host "EXIF injected in: $($img.Name)"

  & $EXIFTOOL -GPSLatitude="$LANDMARK_LAT" -GPSLongitude="$LANDMARK_LNG" -GPSLatitudeRef="S" -GPSLongitudeRef="W" -GPSMapDatum="WGS-84" -Keywords="Punta Arenas" -ImageDescription="Pure 24 Nutrition - Punta Arenas" -LocationCreated="Punta Arenas, Chile" -Creator="Pure24 Nutrition" -Copyright="Pure24 Nutrition 2026" -overwrite_original "$($img.FullName)" 2>$null
}

Write-Host "Done"
