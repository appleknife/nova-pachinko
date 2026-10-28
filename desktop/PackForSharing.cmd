@echo off
rem ---------------------------------------------------------------------------
rem Nova Pachinko — build the folder you can send to a friend.
rem
rem Double-click this: it writes NovaPachinko-Windows.zip next to the game,
rem containing only the files the desktop version needs, the launcher, and a
rem START HERE page. See desktop/README.md for what to tell the friend.
rem ---------------------------------------------------------------------------
setlocal
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0pack.ps1"
if errorlevel 1 (
  echo.
  echo Packing failed. The message above says why.
)
echo.
pause
