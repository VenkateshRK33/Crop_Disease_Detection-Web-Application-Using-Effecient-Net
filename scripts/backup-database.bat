@echo off
REM ###############################################################################
REM Database Backup Script (Windows)
REM 
REM Creates a backup of the MongoDB database
REM 
REM Usage: scripts\backup-database.bat
REM ###############################################################################

setlocal enabledelayedexpansion

REM Load MONGODB_URI from .env
for /f "tokens=1,2 delims==" %%a in ('type .env ^| findstr /v "^#"') do (
    if "%%a"=="MONGODB_URI" set MONGODB_URI=%%b
)

REM Configuration
set BACKUP_DIR=backups\mongodb
set DATE=%date:~-4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set DATE=%DATE: =0%
set BACKUP_NAME=krishiraksha_backup_%DATE%

echo.
echo ========================================
echo Database Backup
echo ========================================
echo.

REM Create backup directory
if not exist %BACKUP_DIR% mkdir %BACKUP_DIR%

REM Perform backup
echo Backing up to: %BACKUP_DIR%\%BACKUP_NAME%
mongodump --uri="%MONGODB_URI%" --out="%BACKUP_DIR%\%BACKUP_NAME%"

REM Compress backup (requires 7-Zip or similar)
if exist "C:\Program Files\7-Zip\7z.exe" (
    echo Compressing backup...
    "C:\Program Files\7-Zip\7z.exe" a -tzip "%BACKUP_DIR%\%BACKUP_NAME%.zip" "%BACKUP_DIR%\%BACKUP_NAME%"
    rmdir /s /q "%BACKUP_DIR%\%BACKUP_NAME%"
)

echo.
echo Recent backups:
dir /b /o-d %BACKUP_DIR% | findstr /i ".zip"

echo.
echo ========================================
echo Backup completed successfully!
echo ========================================
echo Backup location: %BACKUP_DIR%\%BACKUP_NAME%.zip
echo.
pause
