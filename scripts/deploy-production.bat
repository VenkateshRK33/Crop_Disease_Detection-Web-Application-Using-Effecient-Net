@echo off
REM ###############################################################################
REM KrishiRaksha Production Deployment Script (Windows)
REM 
REM This script automates the deployment process for production environment
REM 
REM Usage: scripts\deploy-production.bat
REM ###############################################################################

echo.
echo ========================================
echo KrishiRaksha Production Deployment
echo ========================================
echo.

REM Check if .env exists
if not exist .env (
    echo [ERROR] .env file not found
    echo Please copy .env.example to .env and configure it
    exit /b 1
)

REM Check if NODE_ENV is production
findstr /C:"NODE_ENV=production" .env >nul
if errorlevel 1 (
    echo [WARNING] NODE_ENV is not set to production
    set /p CONTINUE="Continue anyway? (y/n): "
    if /i not "%CONTINUE%"=="y" exit /b 1
)

echo [1/7] Installing dependencies...
call npm install --production
cd frontend-react
call npm install --production
cd ..
pip install -r requirements_ml.txt

echo.
echo [2/7] Building frontend...
cd frontend-react
call npm run build
cd ..

echo.
echo [3/7] Running tests...
call npm run test:backend
call npm run test:integration

echo.
echo [4/7] Analyzing build...
node scripts\optimize-build.js

echo.
echo [5/7] Creating logs directory...
if not exist logs mkdir logs

echo.
echo [6/7] Starting services with PM2...
pm2 delete all 2>nul
pm2 start ecosystem.config.js --env production
pm2 save

echo.
echo [7/7] Setting up PM2 startup...
pm2 startup

echo.
echo ========================================
echo Deployment Complete!
echo ========================================
echo.
echo Next steps:
echo   1. Configure IIS or Apache (see DEPLOYMENT.md)
echo   2. Set up SSL certificates
echo   3. Test all features
echo   4. Monitor logs: pm2 logs
echo   5. Check status: pm2 status
echo.
echo Access your application:
echo   Backend: http://localhost:4000
echo   Frontend: Configure web server to serve frontend-react\build
echo.
pause
