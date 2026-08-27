# Silent launcher for Executive Meeting Suite
# Run with: powershell -WindowStyle Hidden -ExecutionPolicy Bypass -File launch.ps1

$appPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $appPath

# Kill existing node processes
Stop-Process -Name node -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 1

# Start backend silently
Start-Process -WindowStyle Hidden -FilePath "cmd.exe" -ArgumentList "/c cd backend && npm run dev"

# Wait for backend to start
Start-Sleep -Seconds 5

# Start frontend silently
Start-Process -WindowStyle Hidden -FilePath "cmd.exe" -ArgumentList "/c cd frontend && npm run dev"

# Wait for frontend to start
Start-Sleep -Seconds 8

# Open browser
Start-Process "http://localhost:3000"

# Exit
Exit
