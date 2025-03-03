@echo off
echo Installing Cypress locally...

REM Navigate to project root directory
cd /d "C:\Users\adamd\OneDrive\Documents\Programming\autoprompt"

REM Remove any existing package-lock.json to avoid conflicts
if exist package-lock.json del /f package-lock.json

REM Install Cypress explicitly with the exact version
npm install --save-dev cypress@12.17.4

REM Create the cypress directory if it doesn't exist
if not exist cypress mkdir cypress
if not exist cypress\e2e mkdir cypress\e2e
if not exist cypress\support mkdir cypress\support
if not exist cypress\fixtures mkdir cypress\fixtures

echo Installation complete. You can now run Cypress with:
echo npm run cypress
pause
