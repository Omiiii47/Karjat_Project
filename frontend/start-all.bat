@echo off
echo Starting Villa Booking System...
echo.

REM Start Backend API
echo [1/2] Starting Backend API Server (Port 4000)...
start "Backend API" cmd /k "cd backend && npm run dev"
timeout /t 3 /nobreak > nul

REM Start Frontend
echo [2/2] Starting Frontend (Port 3000)...
start "Frontend" cmd /k "npm run dev"

echo.
echo ✅ All services started!
echo.
echo 📱 Frontend:    http://localhost:3000
echo 🔧 Backend API: http://localhost:4000
echo 💼 Sales Login: http://localhost:3000/sales
echo.
echo Press any key to close this window (servers will keep running)...
pause > nul
