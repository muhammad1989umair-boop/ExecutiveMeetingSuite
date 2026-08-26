@echo off
setlocal enabledelayedexpansion
cls

echo.
echo ════════════════════════════════════════════════════════════════
echo    ✨ EXECUTIVE MEETING SUITE - STARTUP
echo ════════════════════════════════════════════════════════════════
echo.

REM Check if running from correct directory
if not exist "backend" (
  echo ❌ ERROR: backend folder not found
  echo Please run this script from: C:\Users\DELL\Desktop\Claude Code\executive-meeting-suite
  pause
  exit /b 1
)

REM Kill any existing processes
echo 🔄 Cleaning up existing processes...
taskkill /F /IM node.exe >nul 2>&1
taskkill /F /IM npm.exe >nul 2>&1
timeout /t 1 /nobreak >nul

REM Free up ports
echo 🔌 Freeing ports 5000 and 3000...
netsh int ipv4 set excludedportrange protocol=tcp startport=3000 numberofports=1 store=persistent >nul 2>&1
netsh int ipv4 set excludedportrange protocol=tcp startport=5000 numberofports=1 store=persistent >nul 2>&1

REM Start Backend
echo.
echo 🚀 Starting Backend Server (Port 5000)...
cd /d "%~dp0backend"
start "EMS - Backend Server" cmd /k "npm run dev"
timeout /t 6 /nobreak >nul

REM Start Frontend
echo 🎨 Starting Frontend Server (Port 3000)...
cd /d "%~dp0frontend"
start "EMS - Frontend Server" cmd /k "npm run dev"
timeout /t 10 /nobreak >nul

REM Open Application
echo 🌐 Opening application in browser...
timeout /t 2 /nobreak >nul
start "" http://localhost:3000

echo.
echo ════════════════════════════════════════════════════════════════
echo ✅ EXECUTIVE MEETING SUITE IS RUNNING
echo ════════════════════════════════════════════════════════════════
echo.
echo 📍 Frontend: http://localhost:3000
echo 📍 Backend:  http://localhost:5000
echo.
echo 🔑 Demo Login:
echo    Email:    umair.ilyas@gatronova.com
echo    Password: demo123
echo.
echo ⚠️  IMPORTANT: Keep both terminal windows open while using the app
echo    - Backend window (shows "Server listening on port 5000")
echo    - Frontend window (shows "Local: http://localhost:3000")
echo.
echo 💡 TIP: Press Ctrl+F5 in browser if page is blank
echo.
echo ════════════════════════════════════════════════════════════════
echo.
pause
