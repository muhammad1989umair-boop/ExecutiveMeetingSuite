@echo off
echo.
echo ════════════════════════════════════════════════════════
echo    EXECUTIVE MEETING SUITE - PRODUCTION START
echo ════════════════════════════════════════════════════════
echo.

REM Kill any existing processes
taskkill /F /IM node.exe >nul 2>&1
taskkill /F /IM npm.exe >nul 2>&1
timeout /t 2 /nobreak >nul

REM Start Backend
echo Starting Backend Server (Port 5000)...
cd /d "%~dp0backend"
start "EMS - Backend" cmd /k "npm run dev"
timeout /t 5 /nobreak >nul

REM Start Frontend
echo Starting Frontend Server (Port 3000)...
cd /d "%~dp0frontend"
start "EMS - Frontend" cmd /k "npm run dev"
timeout /t 8 /nobreak >nul

REM Open Application
echo Opening Application in Browser...
timeout /t 2 /nobreak >nul
start http://localhost:3000

echo.
echo ════════════════════════════════════════════════════════
echo ✅ EXECUTIVE MEETING SUITE RUNNING
echo ════════════════════════════════════════════════════════
echo.
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:5000
echo.
echo Login:
echo   Email: umair.ilyas@gatronova.com
echo   Password: demo123
echo.
echo Two windows opened above - keep them open while using app
echo.
pause
