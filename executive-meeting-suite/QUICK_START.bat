@echo off
title Executive Meeting Suite
setlocal enabledelayedexpansion

cd /d "%~dp0"

echo.
echo ════════════════════════════════════════
echo  EXECUTIVE MEETING SUITE
echo  Starting Application...
echo ════════════════════════════════════════
echo.

REM Kill any existing Node processes on port 5000
taskkill /F /IM node.exe >nul 2>&1
timeout /t 1 /nobreak >nul

echo [*] Starting server...
start "EMS Server" /B node server.js

REM Wait for server to start
timeout /t 3 /nobreak >nul

echo [*] Opening application in browser...
start http://localhost:5000

echo.
echo ════════════════════════════════════════
echo  ✓ APPLICATION STARTED
echo ════════════════════════════════════════
echo.
echo The server is running on http://localhost:5000
echo.
echo Login with:
echo   Email: umair.ilyas@gatronova.com
echo   Password: demo123
echo.
echo This window will stay open. Close it to stop the app.
echo.
pause
