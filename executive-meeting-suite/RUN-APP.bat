@echo off
REM ========================================
REM Executive Meeting Suite - Complete Startup
REM ========================================

title Executive Meeting Suite - Starting...
color 0A

cd /d "%~dp0"

echo.
echo ========================================
echo  EXECUTIVE MEETING SUITE
echo  Complete Application Startup
echo ========================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js not found!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo [OK] Node.js installed

REM Check backend dependencies
if not exist "backend\node_modules" (
    echo.
    echo [ERROR] Backend dependencies missing!
    echo Installing now...
    cd backend
    npm install
    cd ..
)

REM Check frontend dependencies
if not exist "frontend\node_modules" (
    echo.
    echo [ERROR] Frontend dependencies missing!
    echo Installing now...
    cd frontend
    npm install
    cd ..
)

echo.
echo ========================================
echo Starting Application...
echo ========================================
echo.

REM Start backend
echo [1/2] Starting Backend Server...
start "Executive Meeting Suite - Backend" cmd /k "cd backend && npm run dev"

REM Wait for backend to start
timeout /t 5 /nobreak

REM Start frontend
echo [2/2] Starting Frontend Server...
start "Executive Meeting Suite - Frontend" cmd /k "cd frontend && npm run dev"

REM Wait for frontend to start
timeout /t 8 /nobreak

REM Open browser
echo.
echo Opening application in browser...
start http://localhost:3000

echo.
echo ========================================
echo SUCCESS!
echo ========================================
echo.
echo Application is running!
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Login with:
echo   Email: umair.ilyas@gatronova.com
echo   Password: demo123
echo.
echo Keep this window open. Close it to stop the application.
echo.
pause
