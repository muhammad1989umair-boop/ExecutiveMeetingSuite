@echo off
REM Executive Meeting Suite - Automated Setup & Run
REM This script does everything needed to run the app

setlocal enabledelayedexpansion

cls
echo.
echo ════════════════════════════════════════════════════════════
echo    EXECUTIVE MEETING SUITE - AUTOMATED SETUP
echo ════════════════════════════════════════════════════════════
echo.

REM Check if PostgreSQL is running
echo Checking PostgreSQL...
psql -U postgres -c "SELECT 1" >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo ⚠️  PostgreSQL is not running!
    echo.
    echo You have 3 options:
    echo.
    echo 1. INSTALL DOCKER (Easiest)
    echo    - Download: https://www.docker.com/products/docker-desktop
    echo    - Install and restart computer
    echo    - Then run this script again
    echo.
    echo 2. START POSTGRESQL MANUALLY
    echo    - If you have PostgreSQL installed, start the service
    echo    - Windows: Services > PostgreSQL > Start
    echo    - Then run this script again
    echo.
    echo 3. DEPLOY TO CLOUD
    echo    - Use the included docker-compose.yml
    echo    - Deploy to Heroku, AWS, Google Cloud, or Azure
    echo.
    echo ════════════════════════════════════════════════════════════
    echo.
    pause
    exit /b 1
)

echo ✓ PostgreSQL is running
echo.

REM Kill any existing Node processes
echo Cleaning up old processes...
taskkill /F /IM node.exe >nul 2>&1
taskkill /F /IM npm.exe >nul 2>&1
timeout /t 2 /nobreak >nul

REM Start backend
echo Starting Backend (port 5000)...
cd /d "%~dp0backend"
start "Executive Meeting Suite - Backend" cmd /k "npm run dev"
timeout /t 5 /nobreak >nul

REM Start frontend
echo Starting Frontend (port 3000)...
cd /d "%~dp0frontend"
start "Executive Meeting Suite - Frontend" cmd /k "npm run dev"
timeout /t 8 /nobreak >nul

REM Open browser
echo Opening application in browser...
timeout /t 3 /nobreak >nul
start http://localhost:3000

echo.
echo ════════════════════════════════════════════════════════════
echo ✓ APP IS RUNNING!
echo ════════════════════════════════════════════════════════════
echo.
echo 🌐 Frontend: http://localhost:3000
echo 🔌 Backend:  http://localhost:5000
echo 🔑 Login:    umair.ilyas@gatronova.com / demo123
echo.
echo Two terminal windows should have opened above.
echo Both show live output while the app runs.
echo.
echo Close either terminal window to stop the app.
echo ════════════════════════════════════════════════════════════
echo.

pause
