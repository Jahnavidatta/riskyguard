# RiskRadar Platform Launcher for Windows PowerShell
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "       Starting RiskRadar DRP Platform (Full Stack)    " -ForegroundColor White
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1/2] Starting FastAPI Backend on http://127.0.0.1:8000 ..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

Start-Sleep -Seconds 3

Write-Host "[2/2] Starting React Frontend on http://127.0.0.1:5173 ..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"

Write-Host ""
Write-Host "=======================================================" -ForegroundColor Green
Write-Host " RiskRadar Platform is launching!" -ForegroundColor Green
Write-Host " - Frontend Web UI:  http://127.0.0.1:5173" -ForegroundColor White
Write-Host " - Backend REST API: http://127.0.0.1:8000" -ForegroundColor White
Write-Host " - Swagger API Docs: http://127.0.0.1:8000/docs" -ForegroundColor White
Write-Host "=======================================================" -ForegroundColor Green
