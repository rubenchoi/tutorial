@echo off

echo Converting %1
python %~dp0convert_log.py %1
pause