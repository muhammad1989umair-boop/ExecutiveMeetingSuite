' SILENT LAUNCHER - No visible windows
' This runs completely hidden

Set objShell = CreateObject("WScript.Shell")
Set objFSO = CreateObject("Scripting.FileSystemObject")

strPath = objFSO.GetParentFolderName(WScript.ScriptFullName)

' Kill old processes
objShell.Run "taskkill /F /IM node.exe", 0, False
WScript.Sleep 1000

' Start backend silently
objShell.Run "cmd /c cd """ & strPath & "\backend"" && npm run dev", 0, False
WScript.Sleep 5000

' Start frontend silently
objShell.Run "cmd /c cd """ & strPath & "\frontend"" && npm run dev", 0, False
WScript.Sleep 8000

' Open browser
objShell.Run "explorer http://localhost:3000", 0, False

' Exit silently
WScript.Quit
