@echo off
REM Executive Meeting Suite - Quick Start Script for Windows

echo.
echo ========================================
echo Executive Meeting Suite - Starting...
echo ========================================
echo.

REM Check if PostgreSQL is available
echo Checking PostgreSQL connection...
psql -U postgres -c "SELECT 1" >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: PostgreSQL is not running or not installed
    echo Please install PostgreSQL and ensure it's running on localhost:5432
    pause
    exit /b 1
)

REM Check if database exists, if not create it
psql -U postgres -d executive_meeting_suite -c "SELECT 1" >nul 2>&1
if %errorlevel% neq 0 (
    echo Creating database...
    psql -U postgres -c "CREATE DATABASE executive_meeting_suite;" >nul 2>&1
)

REM Start backend in a new window
echo Starting Backend Server (port 5000)...
start "Executive Meeting Suite - Backend" cmd /k "cd backend && npm run dev"

REM Wait a few seconds for backend to start
timeout /t 3 /nobreak

REM Start frontend in a new window
echo Starting Frontend Server (port 3000)...
start "Executive Meeting Suite - Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo Services Started!
echo ========================================
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:3000
echo API:      http://localhost:5000/api/health
echo.
echo Login with:
echo   Email: umair.ilyas@gatronova.com
echo   Password: demo123
echo.
echo Close the command windows to stop the servers.
echo ========================================
echo.
