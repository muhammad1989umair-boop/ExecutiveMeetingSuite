@echo off
cd /d "%~dp0"

echo.
echo ========================================
echo Starting NEW Executive Meeting Suite Backend
echo ========================================
echo.

REM Make sure we're in the backend directory
cd backend

REM Check if dist/server.js exists
if not exist "dist\server.js" (
    echo ERROR: Backend not compiled!
    echo Run: npm run build
    pause
    exit /b 1
)

echo [*] Starting compiled backend server...
echo [*] Listen on: http://localhost:5000
echo [*] API: http://localhost:5000/api/health
echo.
echo Demo Login:
echo   Email: umair.ilyas@gatronova.com
echo   Password: demo123
echo.

REM Run the compiled server
node dist/server.js

pause
