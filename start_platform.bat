@echo off
TITLE RiskRadar Platform Launcher
echo =======================================================
echo        Starting RiskRadar DRP Platform (Full Stack)
echo =======================================================
echo.

echo [1/2] Starting FastAPI Backend on http://127.0.0.1:8000 ...
start "RiskRadar Backend (FastAPI)" cmd /k "cd backend && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

timeout /t 3 /nobreak >nul

echo [2/2] Starting React Vite Frontend on http://127.0.0.1:5173 ...
start "RiskRadar Frontend (React)" cmd /k "cd frontend && npm run dev"

echo.
echo =======================================================
echo  RiskRadar Platform is booting up!
echo  - Frontend Web UI:  http://127.0.0.1:5173
echo  - Backend REST API: http://127.0.0.1:8000
echo  - Swagger API Docs: http://127.0.0.1:8000/docs
echo =======================================================
echo.
