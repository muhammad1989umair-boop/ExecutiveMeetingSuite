# Create Attractive Desktop Shortcut with Custom Icon
# This creates a shortcut with a beautiful icon

$DesktopPath = "$env:USERPROFILE\Desktop"
$BatchFilePath = "C:\Users\DELL\Desktop\Claude Code\executive-meeting-suite\start-app.bat"
$ShortcutPath = "$DesktopPath\Executive Meeting Suite.lnk"
$ProjectPath = "C:\Users\DELL\Desktop\Claude Code\executive-meeting-suite"

Write-Host "Creating attractive shortcut..." -ForegroundColor Green

# Create the shortcut
$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut($ShortcutPath)
$Shortcut.TargetPath = $BatchFilePath
$Shortcut.WorkingDirectory = $ProjectPath
$Shortcut.Description = "Executive Meeting Suite - Click to launch the app"

# Set icon - Using PowerPoint icon which looks nice
# You can change this to any .exe, .ico, or .dll file
$Shortcut.IconLocation = "C:\Windows\System32\powerpnt.exe,0"

# Add window style (Normal = 1)
$Shortcut.WindowStyle = 1

$Shortcut.Save()

Write-Host "✓ Attractive shortcut created!" -ForegroundColor Green
Write-Host "Location: $ShortcutPath" -ForegroundColor Green
Write-Host ""
Write-Host "The shortcut now has a professional blue icon!" -ForegroundColor Cyan
Write-Host ""
Write-Host "You can change the icon later by:" -ForegroundColor Yellow
Write-Host "1. Right-click the shortcut"
Write-Host "2. Select 'Properties'"
Write-Host "3. Click 'Change Icon'"
Write-Host "4. Browse to any .exe, .ico, or .dll file"
