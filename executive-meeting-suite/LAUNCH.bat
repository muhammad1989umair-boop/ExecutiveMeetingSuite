@echo off
setlocal enabledelayedexpansion

title Executive Meeting Suite - LAUNCHING...
color 0A

cd /d "%~dp0"

cls

echo.
echo ════════════════════════════════════════════════
echo  EXECUTIVE MEETING SUITE - APPLICATION LAUNCH
echo ════════════════════════════════════════════════
echo.

REM Start Backend
echo [1/2] Starting Backend Server (Port 5000)...
start "EMS Backend" cmd /k "cd backend && npm run dev"

REM Wait for backend
timeout /t 5 /nobreak

REM Start Frontend
echo [2/2] Starting Frontend Server (Port 3000)...
start "EMS Frontend" cmd /k "cd frontend && npm run dev"

REM Wait for frontend
timeout /t 8 /nobreak

REM Open browser
echo.
echo Opening application in browser...
start http://localhost:3000

cls

echo.
echo ════════════════════════════════════════════════
echo  ✓ APPLICATION LAUNCHED!
echo ════════════════════════════════════════════════
echo.
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:5000
echo.
echo Login Credentials:
echo   Email: umair.ilyas@gatronova.com
echo   Password: demo123
echo.
echo Two terminal windows are running your servers.
echo Close them to stop the application.
echo.
echo ════════════════════════════════════════════════
echo.

pause
