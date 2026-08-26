@echo off
REM Executive Meeting Suite - Start Script
REM This script starts both backend and frontend servers

title Executive Meeting Suite
color 0A

echo.
echo ========================================
echo  Executive Meeting Suite
echo ========================================
echo.
echo Starting servers...
echo.

REM Get the directory where this script is located
cd /d "%~dp0"

REM Check if backend and frontend directories exist
if not exist "backend" (
    echo ERROR: backend folder not found!
    echo Please run this script from the executive-meeting-suite root directory.
    pause
    exit /b 1
)

if not exist "frontend" (
    echo ERROR: frontend folder not found!
    echo Please run this script from the executive-meeting-suite root directory.
    pause
    exit /b 1
)

REM Check if node_modules exist, if not install dependencies
if not exist "backend\node_modules" (
    echo Installing backend dependencies...
    cd backend
    call npm install
    cd ..
)

if not exist "frontend\node_modules" (
    echo Installing frontend dependencies...
    cd frontend
    call npm install
    cd ..
)

REM Start backend in a new window
echo.
echo [1/2] Starting Backend Server (Port 5000)...
start "Executive Meeting Suite - Backend" cmd /k "cd backend && npm run dev"

REM Wait a moment for backend to start
timeout /t 3 /nobreak

REM Start frontend in a new window
echo [2/2] Starting Frontend Server (Port 3000)...
start "Executive Meeting Suite - Frontend" cmd /k "cd frontend && npm run dev"

REM Wait for frontend to start and open browser
timeout /t 5 /nobreak

REM Open browser to application
echo.
echo ========================================
echo Opening application in browser...
echo ========================================
echo.
start http://localhost:3000

echo.
echo ========================================
echo SUCCESS!
echo ========================================
echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Login with:
echo  Email: umair.ilyas@gatronova.com
echo  Password: demo123
echo.
echo To stop the servers, close the terminal windows.
echo.
pause
