@echo off
cd /d "%~dp0"
start "API" cmd /k "cd server && npm run dev"
start "Site" cmd /k "npm run dev"
timeout /t 6 >nul
start http://localhost:8443