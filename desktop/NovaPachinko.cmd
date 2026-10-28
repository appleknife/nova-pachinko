@echo off
rem ---------------------------------------------------------------------------
rem Nova Pachinko — desktop launcher
rem
rem Opens the game in a dedicated app window instead of a browser tab:
rem no tab strip, no extensions, its own profile, and throttling switched off
rem so the window keeps its full frame rate when it loses focus.
rem
rem Usage:
rem   NovaPachinko.cmd            normal window
rem   NovaPachinko.cmd smooth     renders at 1x pixel scale (fastest, slightly
rem                               softer on a high-DPI monitor)
rem ---------------------------------------------------------------------------
setlocal
set "ROOT=%~dp0"
rem Works whether this file sits next to index.html or one folder down (desktop/).
set "HTML=%ROOT%index.html"
if not exist "%HTML%" for %%I in ("%ROOT%..\index.html") do set "HTML=%%~fI"
if not exist "%HTML%" (
  echo Could not find index.html next to this launcher.
  pause
  exit /b 1
)
set "GAME=file:///%HTML:\=/%"
set "PROFILE=%LOCALAPPDATA%\NovaPachinko"

set "FLAGS=--app="%GAME%" --user-data-dir="%PROFILE%" --window-size=1500,960 --no-first-run --no-default-browser-check --autoplay-policy=no-user-gesture-required --disable-background-timer-throttling --disable-renderer-backgrounding --disable-backgrounding-occluded-windows --disable-features=CalculateNativeWinOcclusion --enable-gpu-rasterization --enable-zero-copy --ignore-gpu-blocklist"

if /i "%~1"=="smooth" set "FLAGS=%FLAGS% --force-device-scale-factor=1"

for %%B in (
  "%ProgramFiles%\Google\Chrome\Application\chrome.exe"
  "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"
  "%LocalAppData%\Google\Chrome\Application\chrome.exe"
  "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe"
  "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"
) do (
  if exist %%B (
    start "" %%B %FLAGS%
    exit /b 0
  )
)

echo Chrome or Edge was not found. Open index.html in any modern browser instead.
pause
