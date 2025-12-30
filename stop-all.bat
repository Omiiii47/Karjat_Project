@echo off
echo Stopping all Villa Booking services...

taskkill /FI "WINDOWTITLE eq Backend API*" /T /F 2>nul
taskkill /FI "WINDOWTITLE eq Frontend*" /T /F 2>nul

echo ✅ All services stopped!
pause
