' SILENT LAUNCHER - No visible windows
' This runs completely hidden

Set objShell = CreateObject("WScript.Shell")
Set objFSO = CreateObject("Scripting.FileSystemObject")

strPath = objFSO.GetParentFolderName(WScript.ScriptFullName)

' Kill old processes
objShell.Run "taskkill /F /IM node.exe >nul 2>&1", 0, False
WScript.Sleep 1000

' Start backend silently (no window)
objShell.Run "cmd /c cd """ & strPath & "\backend"" && npm run dev >nul 2>&1", 0, False
WScript.Sleep 5000

' Start frontend silently (no window)
objShell.Run "cmd /c cd """ & strPath & "\frontend"" && npm run dev >nul 2>&1", 0, False
WScript.Sleep 10000

' Open browser ONCE (using iexplore to avoid opening twice)
objShell.Run "cmd /c start http://localhost:3000", 0, False

' Exit silently
WScript.Quit
