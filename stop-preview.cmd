@echo off
title Stop Local Preview
echo Stopping the preview server on port 3000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do (
  taskkill /PID %%a /F >nul 2>&1
)
echo Done.
timeout /t 2 >nul
