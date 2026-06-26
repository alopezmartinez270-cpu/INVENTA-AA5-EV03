@echo off
cd /d "%~dp0"

if not exist "src\server.js" (
  echo ERROR: No se encontro src\server.js.
  echo Extraiga primero toda la carpeta del proyecto.
  pause
  exit /b 1
)

echo Iniciando INVENTA API...
echo La documentacion se abrira en http://localhost:3000
echo Mantenga esta ventana abierta mientras utiliza el servicio.
echo.
start "" powershell.exe -NoProfile -WindowStyle Hidden -Command "Start-Sleep -Seconds 2; Start-Process 'http://localhost:3000/'"
node src\server.js
echo.
pause
