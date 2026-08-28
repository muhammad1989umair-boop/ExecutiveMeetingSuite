@echo off
REM EXECUTIVE MEETING SUITE - SIMPLE LAUNCHER
REM Direct starter - no PowerShell dependencies

cd /d "%~dp0"

REM Kill old processes
taskkill /F /IM node.exe >nul 2>&1
timeout /t 1 /nobreak >nul

REM Start backend in background
start "EMS Backend" cmd /c "cd backend && npm run dev"
timeout /t 5 /nobreak >nul

REM Start frontend in background
start "EMS Frontend" cmd /c "cd frontend && npm run dev"
timeout /t 8 /nobreak >nul

REM Open browser
start http://localhost:5000

REM Show status
echo.
echo ========================================
echo   Executive Meeting Suite Started
echo ========================================
echo.
echo Frontend: http://localhost:5000
echo Backend:  http://localhost:3000
echo.
echo Demo Login:
echo   Email: umair.ilyas@gatronova.com
echo   Password: demo123
echo.
echo Keep this window open while using the app
echo ========================================
echo.
pause
