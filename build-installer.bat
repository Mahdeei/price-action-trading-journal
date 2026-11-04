@echo off
title Building Price Action Trading Journal Windows Installer
echo ========================================================
echo   1. Installing Dependencies (Electron & Builder)...
echo ========================================================
call npm install
echo.
echo ========================================================
echo   2. Building Windows 64-bit Setup.exe Installer...
echo ========================================================
call npm run dist
echo.
echo ========================================================
echo   DONE! Open the "dist" folder to run Setup.exe
echo ========================================================
explorer dist
pause