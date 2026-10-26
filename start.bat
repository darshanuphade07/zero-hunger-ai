@echo off
setlocal
cd /d "%~dp0"
TITLE AgriSmart AI Launcher

echo Starting Zero Hunger AI...
where python >nul 2>nul
if errorlevel 1 (
  echo ERROR: Python not found. Install Python and add it to PATH.
  pause
  exit /b 1
)
where npm >nul 2>nul
if errorlevel 1 (
  echo ERROR: npm not found. Install Node.js LTS and restart this terminal.
  pause
  exit /b 1
)
if not exist "backend\.env" (
  echo NOTE: backend\.env missing. Gemini will run in offline demo mode.
  echo Copy backend\.env.example to backend\.env and add GEMINI_API_KEY privately.
)
start "AgriSmart AI Backend" cmd /k "cd /d ""%~dp0backend"" && python -m pip install -r requirements.txt && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"
start "AgriSmart AI Frontend" cmd /k "cd /d ""%~dp0frontend"" && if not exist node_modules npm install && npm run dev"
echo Backend: http://127.0.0.1:8000/api/health
echo Frontend: http://localhost:3000
pause
