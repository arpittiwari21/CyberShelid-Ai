@echo off
title CyberShield AI - Intelligent Cybersecurity & Fraud Detection Platform
color 0B

echo ======================================================================
echo                CYBERSHIELD AI - FULL STACK LAUNCHER
echo                     Detect - Explain - Protect
echo ======================================================================
echo.

cd /d "%~dp0"

echo [1/3] Activating Virtual Environment...
call backend\venv\Scripts\activate.bat

echo [2/3] Starting FastAPI Backend on http://127.0.0.1:8000 ...
start "CyberShield AI - Backend" cmd /k "backend\venv\Scripts\uvicorn.exe app.main:app --host 127.0.0.1 --port 8000"

echo [3/3] Starting React Vite Frontend on http://127.0.0.1:5173 ...
start "CyberShield AI - Frontend" cmd /k "cd frontend && npm run dev"

timeout /t 3 >nul

echo.
echo ======================================================================
echo  CyberShield AI is now running!
echo  - Frontend UI:  http://127.0.0.1:5173
echo  - Backend API:  http://127.0.0.1:8000
echo  - Swagger Docs: http://127.0.0.1:8000/docs
echo ======================================================================
echo.
pause
