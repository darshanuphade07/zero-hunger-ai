@echo off
TITLE AgriSmart AI Launcher
echo ========================================================
echo   AgriSmart AI - Zero Hunger (SDG 2) Precision Platform
echo ========================================================
echo.
echo Starting FastAPI Backend on http://127.0.0.1:8000...
start "AgriSmart AI - Backend" cmd /k "cd backend && set PYTHONPATH=. && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

echo Starting Next.js Frontend on http://localhost:3000...
start "AgriSmart AI - Frontend" cmd /k "cd frontend && set PATH=C:\Users\DARSHAN UPHADE\AppData\Local\Programs\nodejs;%%PATH%% && npm run dev"

echo.
echo ========================================================
echo   Services launched!
echo   Frontend: http://localhost:3000
echo   Backend API: http://127.0.0.1:8000
echo   API Docs: http://127.0.0.1:8000/docs
echo ========================================================
pause
