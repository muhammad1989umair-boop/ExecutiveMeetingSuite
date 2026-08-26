@echo off
REM Executive Meeting Suite - Start Everything

cd /d "%~dp0"

echo.
echo ════════════════════════════════════════════════════════════
echo           EXECUTIVE MEETING SUITE - STARTING ALL
echo ════════════════════════════════════════════════════════════
echo.

REM Check if backend is compiled
if not exist "backend\dist\server.js" (
    echo ERROR: Backend not compiled!
    echo Please run: cd backend ^&^& npm run build
    pause
    exit /b 1
)

REM Start Backend in a new window
echo [1/2] Starting Backend Server (port 5000)...
start "EMS-Backend" cmd /k "cd /d %cd%\backend && echo Starting backend... && node dist/server.js"

REM Wait a bit for backend to start
timeout /t 3 /nobreak >nul

REM Start Frontend in a new window
echo [2/2] Starting Frontend Server (port 3000)...
start "EMS-Frontend" cmd /k "cd /d %cd%\frontend && echo Starting frontend... && npm run dev"

echo.
echo ════════════════════════════════════════════════════════════
echo                    SERVERS STARTING
echo ════════════════════════════════════════════════════════════
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:3000
echo API:      http://localhost:5000/api/health
echo.
echo Demo Login:
echo   Email:    umair.ilyas@gatronova.com
echo   Password: demo123
echo.
echo You should see two terminal windows open above.
echo The frontend will automatically open in your browser.
echo.
echo Close the terminal windows to stop the servers.
echo ════════════════════════════════════════════════════════════
echo.

pause
