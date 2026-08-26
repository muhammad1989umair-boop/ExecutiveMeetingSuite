@echo off
echo.
echo ════════════════════════════════════════════════════════
echo    CLEAN START - Clear Cache & Restart All Services
echo ════════════════════════════════════════════════════════
echo.

REM Kill all node processes
echo Killing all processes...
taskkill /F /IM node.exe >nul 2>&1
taskkill /F /IM npm.exe >nul 2>&1
timeout /t 3 /nobreak >nul

REM Clear Vite cache
echo Clearing Vite cache...
cd /d "%~dp0frontend"
rmdir /S /Q node_modules\.vite >nul 2>&1
rmdir /S /Q dist >nul 2>&1

REM Clear Node cache
echo Clearing Node cache...
npm cache clean --force >nul 2>&1

REM Restart backend
echo.
echo Starting Backend (Port 5000)...
cd /d "%~dp0backend"
start "Executive Meeting Suite - BACKEND" cmd /k "npm run dev"
timeout /t 5 /nobreak >nul

REM Restart frontend
echo Starting Frontend (Port 3000)...
cd /d "%~dp0frontend"
start "Executive Meeting Suite - FRONTEND" cmd /k "npm run dev"
timeout /t 8 /nobreak >nul

REM Open app
echo Opening application...
timeout /t 2 /nobreak >nul
start http://localhost:3000

echo.
echo ════════════════════════════════════════════════════════
echo ✅ CLEAN START COMPLETE
echo ════════════════════════════════════════════════════════
echo.
echo Both servers should now be running fresh:
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:5000
echo.
echo Two command windows opened above showing live logs.
echo.
pause
