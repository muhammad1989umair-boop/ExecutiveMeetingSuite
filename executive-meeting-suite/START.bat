@echo off
setlocal enabledelayedexpansion

title Executive Meeting Suite - LAUNCHING
color 0A

cd /d "%~dp0"

echo.
echo ════════════════════════════════════════
echo  EXECUTIVE MEETING SUITE
echo  Starting Application...
echo ════════════════════════════════════════
echo.

REM Kill any existing processes
taskkill /F /IM node.exe >nul 2>&1
taskkill /F /IM python.exe >nul 2>&1
timeout /t 2 /nobreak >nul

echo [1/2] Starting Backend Server...
cd backend
start "EMS Backend" cmd /k "npm run dev"

REM Wait for backend to start
timeout /t 15 /nobreak >nul

echo [2/2] Opening Application...
start http://localhost:5000

echo.
echo ════════════════════════════════════════
echo  ✓ APPLICATION LAUNCHED
echo ════════════════════════════════════════
echo.
echo Backend:  http://localhost:5000
echo.
echo Login with:
echo   Email: umair.ilyas@gatronova.com
echo   Password: demo123
echo.
echo Keep the backend window open.
echo Close it to stop the application.
echo.
pause
