@echo off
REM Run PowerShell launcher silently
powershell -WindowStyle Hidden -ExecutionPolicy Bypass -File "%~dp0launch.ps1"
exit /b 0
