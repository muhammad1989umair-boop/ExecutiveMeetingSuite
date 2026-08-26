Set objShell = CreateObject("WScript.Shell")
Set objFSO = CreateObject("Scripting.FileSystemObject")

' Get the directory where this script is located
strScriptDir = objFSO.GetParentFolderName(WScript.ScriptFullName)

' Kill any existing Node processes (silently)
objShell.Run "taskkill /F /IM node.exe >nul 2>&1", 0, True

' Create a hidden batch file to run Node in background
strTempBatch = strScriptDir & "\run_server.cmd"
Set objFile = objFSO.CreateTextFile(strTempBatch, True)
objFile.WriteLine "@echo off"
objFile.WriteLine "cd /d """ & strScriptDir & """"
objFile.WriteLine "node server.js"
objFile.Close

' Start the batch file invisibly in background
objShell.Run "cmd /c """ & strTempBatch & """", 0, False

' Wait for server to start
WScript.Sleep 3000

' Open browser to the app
objShell.Run "explorer http://localhost:5000", 1, False

' Clean up temp file after a delay
WScript.Sleep 500
If objFSO.FileExists(strTempBatch) Then
    objFSO.DeleteFile strTempBatch, True
End If

' Exit silently
WScript.Quit
