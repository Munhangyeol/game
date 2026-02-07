@echo off
echo ========================================
echo MapleQuest RPG Server
echo ========================================
echo.
cd /d "%~dp0.."
python scripts/server.py
pause
