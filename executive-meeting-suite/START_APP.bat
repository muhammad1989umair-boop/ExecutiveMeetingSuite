@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"

REM Kill any existing processes silently
taskkill /F /IM node.exe >nul 2>&1
timeout /t 1 /nobreak >nul

REM Start Backend silently in background
start /B /min cmd /c "cd backend && npm run dev >nul 2>&1"
timeout /t 4 /nobreak >nul

REM Start Frontend silently in background
start /B /min cmd /c "cd frontend && npm run dev >nul 2>&1"
timeout /t 8 /nobreak >nul

REM Open browser
start "" http://localhost:3000

REM Exit silently
exit /b 0
