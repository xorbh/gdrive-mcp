@echo off
setlocal enabledelayedexpansion

:: Go to the folder where this script lives
cd /d "%~dp0"

echo.
echo ========================================
echo   Google Drive MCP Server -- Setup
echo ========================================
echo.

:: --- Step 1: Check for Node.js ---
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo X Node.js is not installed.
    echo.
    echo Please install Node.js first:
    echo   1. Go to https://nodejs.org
    echo   2. Click the big green button to download the LTS version
    echo   3. Run the installer
    echo   4. RESTART YOUR COMPUTER after installing
    echo   5. Then double-click this setup file again
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%v in ('node --version') do set NODE_VERSION=%%v
echo OK Found Node.js %NODE_VERSION%

:: --- Step 2: Check for credentials.json ---
if exist "config\default\credentials.json" (
    echo OK Found credentials.json
) else if exist "credentials.json" (
    echo OK Found credentials.json -- moving it into place...
    if not exist "config\default" mkdir "config\default"
    move "credentials.json" "config\default\" >nul
) else (
    echo.
    echo X credentials.json not found!
    echo.
    echo You need to get this file from Google first.
    echo Check the README for instructions (look for 'Get Your Google Credentials').
    echo.
    echo Once you have the file:
    echo   1. Rename it to 'credentials.json'
    echo   2. Drop it into this folder (opening it now...)
    echo   3. Then double-click this setup file again
    echo.
    explorer .
    pause
    exit /b 1
)

:: --- Step 3: Install dependencies ---
echo.
echo Installing dependencies (this may take a minute)...
echo.
call npm install --loglevel=error
if %errorlevel% neq 0 (
    echo.
    echo X Something went wrong installing dependencies.
    echo   Try deleting the 'node_modules' folder and running this setup again.
    pause
    exit /b 1
)
echo OK Dependencies installed

:: --- Step 4: Build ---
echo.
echo Building the project...
call npm run build --silent
if %errorlevel% neq 0 (
    echo.
    echo X Build failed. Please check the error messages above.
    pause
    exit /b 1
)
echo OK Build complete

:: --- Step 5: Run auth flow ---
echo.
echo ========================================
echo   Google Authorization
echo ========================================
echo.
echo In a moment, a long URL will appear below.
echo.
echo   1. Copy the entire URL
echo   2. Paste it into your web browser
echo   3. Sign in with your Google account
echo   4. If you see 'Google hasn't verified this app',
echo      click 'Advanced' then 'Go to MCP Server (unsafe)'
echo      (This is safe -- you created this app yourself!)
echo   5. Click 'Allow'
echo   6. You'll see 'Authorization successful!' -- come back here
echo.
echo Starting authorization...
echo.
call npm run auth -- --config-dir config/default
if %errorlevel% neq 0 (
    echo.
    echo X Authorization failed. Please try running this setup again.
    pause
    exit /b 1
)

:: --- Step 6: Print Claude Desktop config ---
set "PROJECT_DIR=%cd%"
set "PROJECT_DIR_JSON=%PROJECT_DIR:\=\\%"

echo.
echo.
echo ========================================
echo   Setup Complete!
echo ========================================
echo.
echo One last step -- add this server to Claude Desktop:
echo.
echo   1. Open Claude Desktop
echo   2. Click the Claude menu, then Settings
echo   3. Click 'Developer' on the left side
echo   4. Click 'Edit Config'
echo   5. Replace everything in the file with this:
echo.
echo {
echo   "mcpServers": {
echo     "gdrive": {
echo       "command": "node",
echo       "args": ["%PROJECT_DIR_JSON%\\dist\\index.js", "--config-dir", "%PROJECT_DIR_JSON%\\config\\default"]
echo     }
echo   }
echo }
echo.
echo   6. Save the file (Ctrl+S)
echo   7. Close Claude Desktop completely and reopen it
echo.
echo You should see a hammer icon in the chat box.
echo That means it's working! Try asking Claude:
echo   'What files are in my Google Drive?'
echo.
pause
