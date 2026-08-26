@echo off
REM Executive Meeting Suite - Setup Verification Script

echo.
echo ========================================
echo Executive Meeting Suite - Setup Checker
echo ========================================
echo.

setlocal enabledelayedexpansion

REM Check Node.js
echo Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Node.js installed
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    echo   Version: !NODE_VERSION!
) else (
    echo ✗ Node.js NOT found - Please install from https://nodejs.org/
)

REM Check npm
echo.
echo Checking npm...
npm --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ npm installed
    for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
    echo   Version: !NPM_VERSION!
) else (
    echo ✗ npm NOT found
)

REM Check PostgreSQL
echo.
echo Checking PostgreSQL...
psql --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ PostgreSQL installed
    for /f "tokens=*" %%i in ('psql --version') do set PG_VERSION=%%i
    echo   Version: !PG_VERSION!
) else (
    echo ✗ PostgreSQL NOT found - Please install from https://www.postgresql.org/download/
)

REM Check PostgreSQL Service
echo.
echo Checking PostgreSQL Service...
sc query PostgreSQL >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ PostgreSQL service found
) else (
    echo ~ PostgreSQL service not found (might be OK if using different setup)
)

REM Check Backend Dependencies
echo.
echo Checking Backend dependencies...
if exist "backend\node_modules\express" (
    echo ✓ Backend dependencies installed
) else (
    echo ~ Backend dependencies NOT installed
    echo   Run: cd backend && npm install
)

REM Check Frontend Dependencies
echo.
echo Checking Frontend dependencies...
if exist "frontend\node_modules\react" (
    echo ✓ Frontend dependencies installed
) else (
    echo ~ Frontend dependencies NOT installed
    echo   Run: cd frontend && npm install
)

REM Check Configuration Files
echo.
echo Checking configuration files...
if exist "backend\.env" (
    echo ✓ Backend .env file found
) else (
    echo ~ Backend .env NOT found
    echo   Creating from .env.example...
    if exist "backend\.env.example" (
        copy "backend\.env.example" "backend\.env" >nul 2>&1
        echo   Created backend\.env
    )
)

REM Summary
echo.
echo ========================================
echo Setup Verification Complete
echo ========================================
echo.
echo Next Steps:
echo 1. Ensure PostgreSQL is running
echo   Windows: Check Services > PostgreSQL Server
echo.
echo 2. If dependencies are missing, run:
echo   - cd backend && npm install
echo   - cd frontend && npm install
echo.
echo 3. Start the application:
echo   - RUN_APP.bat (Windows)
echo   - Or: cd backend && npm run dev
echo           cd frontend && npm run dev
echo.
echo 4. Open http://localhost:3000 in your browser
echo.
echo 5. Login with:
echo    Email: umair.ilyas@gatronova.com
echo    Password: demo123
echo.
pause
