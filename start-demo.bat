@echo off
echo ============================================================
echo   Starting Plant Disease AI Assistant Demo
echo ============================================================
echo.

echo Checking services...
echo.

REM Check if Python is available
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python not found! Please install Python.
    pause
    exit /b 1
)

REM Check if Node.js is available
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js not found! Please install Node.js.
    pause
    exit /b 1
)

echo [OK] Python and Node.js found
echo.

echo Starting services...
echo.

REM Start ML API in new window
echo [1/3] Starting ML API (Python)...
start "ML API" cmd /k "python api_service.py"
timeout /t 3 /nobreak >nul

REM Start Chatbot Server in new window
echo [2/3] Starting Chatbot Server (Node.js)...
start "Chatbot Server" cmd /k "node chatbot-server.js"
timeout /t 2 /nobreak >nul

REM Open demo page in default browser
echo [3/3] Opening demo page...
start demo.html

echo.
echo ============================================================
echo   All services started!
echo ============================================================
echo.
echo   ML API:          http://localhost:5000
echo   Chatbot Server:  http://localhost:4000
echo   Demo Page:       Opened in browser
echo.
echo   Note: If Ollama is not installed, chatbot will use
echo         fallback mode with pre-written advice.
echo.
echo   To install Ollama:
echo   1. Download from https://ollama.ai/download
echo   2. Run: ollama pull llama3.2:3b
echo   3. Run: ollama serve
echo.
echo   Press any key to close this window...
echo   (Services will keep running in other windows)
echo ============================================================
pause >nul
