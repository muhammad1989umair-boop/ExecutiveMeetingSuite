@echo off
REM Executive Meeting Suite - Fresh Start (Clears cache and restarts)
REM This ensures you get the latest version

cd /d "%~dp0"

echo.
echo ════════════════════════════════════════════════════════════
echo  EXECUTIVE MEETING SUITE - FRESH START
echo  Clearing cache and restarting application...
echo ════════════════════════════════════════════════════════════
echo.

REM Kill any existing Node processes
echo [1/5] Stopping existing servers...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 1 /nobreak >nul

REM Clear browser cache for localhost
echo [2/5] Clearing browser cache...
REM Delete Chrome cache
if exist "%USERPROFILE%\AppData\Local\Google\Chrome\User Data\Default\Cache" (
    rmdir /s /q "%USERPROFILE%\AppData\Local\Google\Chrome\User Data\Default\Cache" >nul 2>&1
)

REM Delete Edge cache
if exist "%USERPROFILE%\AppData\Local\Microsoft\Edge\User Data\Default\Cache" (
    rmdir /s /q "%USERPROFILE%\AppData\Local\Microsoft\Edge\User Data\Default\Cache" >nul 2>&1
)

echo [3/5] Starting backend server...
start "EMS Server" /B node server.js

REM Wait for server to start
timeout /t 3 /nobreak >nul

echo [4/5] Opening application in browser...
start http://localhost:5000

echo.
echo ════════════════════════════════════════════════════════════
echo  ✓ APPLICATION RESTARTED WITH LATEST VERSION
echo ════════════════════════════════════════════════════════════
echo.
echo  The application is now running with:
echo  ✓ Latest code changes
echo  ✓ Cleared browser cache
echo  ✓ Fresh server instance
echo  ✓ No-cache headers enabled
echo.
echo  If it still shows old version:
echo  1. Press Ctrl+F5 in browser (hard refresh)
echo  2. Or open http://localhost:5000 in incognito/private window
echo.
echo  Server running at: http://localhost:5000
echo  Press any key to keep server running...
echo.
pause
