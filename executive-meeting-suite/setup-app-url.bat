@echo off
REM Setup Script: Configure APP_URL for Deployment

echo.
echo ==========================================
echo Executive Meeting Suite - App URL Setup
echo ==========================================
echo.

REM Check if backend/.env exists
if not exist "backend\.env" (
    echo Error: backend\.env not found
    exit /b 1
)

echo Enter your app's deployed URL
echo Example: https://app.gatronova.com
echo.

set /p APP_URL="APP_URL: "

if "%APP_URL%"=="" (
    echo Error: APP_URL cannot be empty
    exit /b 1
)

echo.
echo Configuring app with:
echo   APP_URL: %APP_URL%
echo.

REM Update backend/.env using PowerShell
powershell -Command "^
    $content = Get-Content 'backend\.env'; ^
    $content = $content -replace 'APP_URL=.*', 'APP_URL=%APP_URL%'; ^
    $content = $content -replace 'CLIENT_URL=.*', 'CLIENT_URL=%APP_URL%'; ^
    $content = $content -replace 'CORS_ORIGIN=.*', 'CORS_ORIGIN=%APP_URL%'; ^
    Set-Content 'backend\.env' $content ^
"

if %errorlevel% equ 0 (
    echo.
    echo Updated backend\.env with:
    echo   APP_URL=%APP_URL%
    echo   CLIENT_URL=%APP_URL%
    echo   CORS_ORIGIN=%APP_URL%
    echo.
    echo Configuration complete!
    echo.
    echo Next steps:
    echo 1. Restart the application
    echo 2. Send a test email to verify the link works
    echo 3. Responsible persons should receive emails with: %APP_URL%
    echo.
    pause
) else (
    echo Error: Failed to update backend\.env
    pause
    exit /b 1
)
