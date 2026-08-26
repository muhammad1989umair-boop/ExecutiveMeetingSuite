@echo off
REM Create Desktop Shortcut for Executive Meeting Suite
REM This script creates a shortcut on your desktop

setlocal enabledelayedexpansion

REM Get the current directory
set "SCRIPT_DIR=%~dp0"
set "BATCH_FILE=%SCRIPT_DIR%start-app.bat"
set "DESKTOP=%USERPROFILE%\Desktop"
set "SHORTCUT_PATH=%DESKTOP%\Executive Meeting Suite.lnk"

REM Check if batch file exists
if not exist "%BATCH_FILE%" (
    echo ERROR: start-app.bat not found!
    echo Expected location: %BATCH_FILE%
    pause
    exit /b 1
)

REM Create shortcut using Windows Script Host
echo Creating desktop shortcut...
echo.

REM Create VBScript to make the shortcut
set "VBS_FILE=%TEMP%\create_shortcut.vbs"

(
    echo Set oWS = WScript.CreateObject("WScript.Shell"^)
    echo sLinkFile = "%SHORTCUT_PATH%"
    echo Set oLink = oWS.CreateShortcut(sLinkFile^)
    echo oLink.TargetPath = "%BATCH_FILE%"
    echo oLink.WorkingDirectory = "%SCRIPT_DIR%"
    echo oLink.Description = "Executive Meeting Suite - Click to launch"
    echo oLink.IconLocation = "cmd.exe"
    echo oLink.Save
) > "%VBS_FILE%"

REM Run the VBScript
cscript.exe //nologo "%VBS_FILE%"

REM Check if shortcut was created
if exist "%SHORTCUT_PATH%" (
    echo.
    echo ========================================
    echo SUCCESS!
    echo ========================================
    echo.
    echo Desktop shortcut created!
    echo.
    echo Location: %SHORTCUT_PATH%
    echo.
    echo You can now double-click "Executive Meeting Suite"
    echo on your desktop to launch the app.
    echo.
    pause
) else (
    echo.
    echo ERROR: Failed to create shortcut
    echo.
    pause
    exit /b 1
)

REM Cleanup
del "%VBS_FILE%"
