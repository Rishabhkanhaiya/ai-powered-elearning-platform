@echo off
echo ==========================================
echo Starting AI-Powered eLearning Platform
echo ==========================================

echo Starting Backend (FastAPI on port 5000)...
start "AI eLearning Backend (Port 5000)" cmd /k "cd /d %~dp0backend && python -m uvicorn main:app --host 0.0.0.0 --port 5000 --reload"

echo Starting Frontend (Next.js on port 3000)...
start "AI eLearning Frontend (Port 3000)" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo Both services are launching:
echo - Frontend: http://localhost:3000
echo - Backend:  http://localhost:5000
echo - Health:   http://localhost:5000/api/health
echo ==========================================
