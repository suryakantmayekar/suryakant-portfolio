@echo off
title Suryakant Mayekar - Local Preview
cd /d "%~dp0"
echo Starting local preview...
echo.
start "" "http://localhost:3000/"
npm run serve
pause
