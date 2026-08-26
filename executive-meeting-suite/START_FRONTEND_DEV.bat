@echo off
cd /d "%~dp0"

echo.
echo ========================================
echo Starting Executive Meeting Suite Frontend
echo ========================================
echo.

REM Make sure we're in the frontend directory
cd frontend

echo [*] Starting Vite dev server...
echo [*] Frontend will open at: http://localhost:3000
echo [*] (Press Ctrl+C to stop)
echo.

REM Run the dev server
npm run dev

pause
