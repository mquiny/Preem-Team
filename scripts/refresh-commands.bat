@echo off
REM Double-click this to refresh docs/commands/assets/spawn_commands.json
REM after updating the collection (adding/removing mods).
REM
REM Doesn't touch git -- it only regenerates the JSON file. You still need
REM to commit + push it (or hand it to Claude to do so) for the live site
REM to pick up the change.
REM
REM Reads the Nexus API key from the ncrbot repo's own .env so it isn't
REM duplicated here in plain text. If that .env moves, update ENV_FILE
REM below to match.

setlocal enabledelayedexpansion

set "REPO=C:\Users\Gaming-PC\Documents\Preem-Team"
set "ENV_FILE=C:\Users\Gaming-PC\Documents\testCPEBot\.env"
set "STAGING=F:\Vortex\Vortex Staging\Cyberpunk 2077"
set "EXTRAFILES=F:\GOG Galaxy\Cyberpunk 2077\Cyberpunk 2077\V2077\mod-extra-files"

if not exist "%ENV_FILE%" (
  echo Could not find %ENV_FILE%
  echo Edit ENV_FILE at the top of this script if it's moved.
  pause
  exit /b 1
)

for /f "usebackq tokens=1,2 delims==" %%A in ("%ENV_FILE%") do (
  if "%%A"=="NEXUS_API_KEY" set "NEXUS_API_KEY=%%B"
  if "%%A"=="APP_NAME" set "APP_NAME=%%B"
  if "%%A"=="APP_VERSION" set "APP_VERSION=%%B"
)

if "%NEXUS_API_KEY%"=="" (
  echo Could not read NEXUS_API_KEY from %ENV_FILE%
  pause
  exit /b 1
)

echo Refreshing spawn commands directory...
echo   Staging:    %STAGING%
echo   Extra files: %EXTRAFILES%
echo.

node "%REPO%\scripts\generate-spawn-commands.js" "%STAGING%" "%EXTRAFILES%"

echo.
echo Done. If the mod list changed, commit + push:
echo   docs\commands\assets\spawn_commands.json
echo for the live site to show the update.
pause
