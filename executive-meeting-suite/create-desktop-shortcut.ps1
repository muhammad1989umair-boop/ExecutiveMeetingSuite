# Create Desktop Shortcut for Executive Meeting Suite
# Run this PowerShell script to create a desktop shortcut

# Get the directory where this script is located
$scriptPath = Split-Path -Parent -Path $MyInvocation.MyCommand.Definition
$batFilePath = Join-Path -Path $scriptPath -ChildPath "start-app.bat"

# Desktop path
$desktopPath = [System.IO.Path]::Combine($env:USERPROFILE, "Desktop")

# Shortcut path
$shortcutPath = Join-Path -Path $desktopPath -ChildPath "Executive Meeting Suite.lnk"

# Create the shortcut
$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut($shortcutPath)
$Shortcut.TargetPath = $batFilePath
$Shortcut.WorkingDirectory = $scriptPath
$Shortcut.Description = "Start Executive Meeting Suite - Click to launch the app"
$Shortcut.IconLocation = "C:\Windows\System32\cmd.exe,0"
$Shortcut.Save()

Write-Host "✓ Desktop shortcut created successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "You can now double-click 'Executive Meeting Suite' on your desktop to launch the app."
Write-Host ""
Write-Host "Shortcut location: $shortcutPath"
Write-Host "Target batch file: $batFilePath"
