@echo off
echo Clearing Next.js cache and restarting development server...
echo.

echo [1/4] Stopping any running Next.js processes...
taskkill /f /im node.exe >nul 2>&1

echo [2/4] Clearing Next.js cache directories...
if exist ".next" rmdir /s /q ".next"
if exist "node_modules\.cache" rmdir /s /q "node_modules\.cache"

echo [3/4] Clearing npm cache...
npm cache clean --force >nul 2>&1

echo [4/4] Starting development server with fresh cache...
echo.
echo ================================
echo Server will start with no cache
echo Admin page will load fresh
echo ================================
echo.

npm run dev
