@echo off
echo ===============================================
echo    MAESTRANZA SA - DESARROLLO LOCAL
echo ===============================================
echo.
echo ✅ Configuracion simplificada con Supabase
echo.
echo ANTES DE CONTINUAR:
echo 1. 🌐 Crea proyecto en https://supabase.com  
echo 2. ⚙️  Configura backend/.env con credenciales
echo 3. 🚀 Ejecuta este script
echo.
pause

echo 📦 Verificando dependencias...

REM Verificar .env existe
if not exist backend\.env (
    echo ❌ ERROR: Configura backend/.env primero
    pause
    exit /b 1
)

echo ✅ Configuracion OK
echo.
echo ================================================
echo 🚀 Iniciando Backend (puerto 8000)...
echo ================================================
cd backend
start "🔧 Backend - Maestranza SA" cmd /k "python run_local.py"
timeout /t 3 /nobreak > nul

echo.
echo ================================================
echo 🌐 Iniciando Frontend (puerto 3000)...  
echo ================================================
cd ..\frontend
start "🎨 Frontend - Maestranza SA" cmd /k "npm run dev"

echo.
echo ===============================================
echo    ✅ APLICACION INICIADA
echo ===============================================
echo.
echo 🎯 URLs:
echo    👨‍💻 Backend:  http://localhost:8000
echo    🎨 Frontend: http://localhost:3000
echo.
echo 📊 Crear datos: POST /create-sample-data
echo.
echo Presiona cualquier tecla para salir...
pause > nul
