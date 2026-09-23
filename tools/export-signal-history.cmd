@echo off
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0export-signal-history.ps1"
echo.
pause
