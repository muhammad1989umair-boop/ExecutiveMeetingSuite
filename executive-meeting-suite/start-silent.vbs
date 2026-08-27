Set objShell = CreateObject("WScript.Shell")
strPath = CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName)
objShell.Run "cmd /c cd /d """ & strPath & """ && taskkill /F /IM node.exe >nul 2>&1 && timeout /t 1 /nobreak >nul && start /B /min cmd /c ""cd backend && npm run dev >nul 2>&1"" && timeout /t 4 /nobreak >nul && start /B /min cmd /c ""cd frontend && npm run dev >nul 2>&1"" && timeout /t 8 /nobreak >nul && start http://localhost:3000", 0, False
WScript.Quit
