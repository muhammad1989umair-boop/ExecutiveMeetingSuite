@echo off
REM ========================================
REM Executive Meeting Suite - Final Startup
REM Working Solution
REM ========================================

setlocal enabledelayedexpansion

title Executive Meeting Suite - FINAL STARTUP
color 0A

cd /d "%~dp0"

cls

echo.
echo ╔════════════════════════════════════════╗
echo ║  EXECUTIVE MEETING SUITE               ║
echo ║  Starting Application...               ║
echo ╚════════════════════════════════════════╝
echo.

REM Step 1: Verify Node.js
echo [Step 1/4] Verifying Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js not found!
    echo Please install from: https://nodejs.org/
    pause
    exit /b 1
)
echo [OK] Node.js installed

REM Step 2: Clean and reinstall dependencies
echo.
echo [Step 2/4] Setting up dependencies...

if exist "backend\node_modules" (
    echo  - Removing old backend modules...
    rmdir /s /q backend\node_modules 2>nul
)

if exist "frontend\node_modules" (
    echo  - Removing old frontend modules...
    rmdir /s /q frontend\node_modules 2>nul
)

echo  - Installing backend packages...
cd backend
call npm install --legacy-peer-deps --loglevel=error
if errorlevel 1 (
    echo [ERROR] Backend installation failed
    cd ..
    pause
    exit /b 1
)
cd ..

echo  - Installing frontend packages...
cd frontend
call npm install --legacy-peer-deps --loglevel=error
if errorlevel 1 (
    echo [ERROR] Frontend installation failed
    cd ..
    pause
    exit /b 1
)
cd ..

echo [OK] Dependencies installed

REM Step 3: Start servers
echo.
echo [Step 3/4] Starting servers...
echo  - Backend server on port 5000
echo  - Frontend server on port 3000
echo.

start "Backend - Executive Meeting Suite" cmd /k "cd backend && npm run dev"
timeout /t 4 /nobreak

start "Frontend - Executive Meeting Suite" cmd /k "cd frontend && npm run dev"
timeout /t 6 /nobreak

REM Step 4: Open browser
echo [Step 4/4] Opening application...
start http://localhost:3000

cls
echo.
echo ╔════════════════════════════════════════╗
echo ║  ✓ SUCCESS!                            ║
echo ║                                        ║
echo ║  Application is running!               ║
echo ║                                        ║
echo ║  Frontend: http://localhost:3000      ║
echo ║  Backend:  http://localhost:5000      ║
echo ║                                        ║
echo ║  Login:                                ║
echo ║  Email: umair.ilyas@gatronova.com    ║
echo ║  Password: demo123                     ║
echo ║                                        ║
echo ║  Two terminal windows are running:     ║
echo ║  - Backend server                      ║
echo ║  - Frontend server                     ║
echo ║                                        ║
echo ║  Close this window or press Ctrl+C     ║
echo ║  in the server windows to stop.        ║
echo ╚════════════════════════════════════════╝
echo.

pause
