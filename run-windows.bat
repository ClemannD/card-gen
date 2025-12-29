@echo off
setlocal enabledelayedexpansion
REM ============================================
REM Card Generator - Windows Quick Start Script
REM ============================================
REM This script will:
REM 1. Check for Node.js installation
REM 2. Install dependencies if needed
REM 3. Set up environment file if needed
REM 4. Initialize database
REM 5. Start the development server
REM ============================================

REM Create log file with timestamp
set "LOG_FILE=run-log.txt"
echo ============================================ > "%LOG_FILE%"
echo Card Generator - Run Log >> "%LOG_FILE%"
echo Started: %DATE% %TIME% >> "%LOG_FILE%"
echo ============================================ >> "%LOG_FILE%"
echo. >> "%LOG_FILE%"

echo.
echo ============================================
echo Card Generator - Starting Application
echo ============================================
echo Logs are being saved to: %LOG_FILE%
echo.

echo. >> "%LOG_FILE%"
echo ============================================ >> "%LOG_FILE%"
echo Card Generator - Starting Application >> "%LOG_FILE%"
echo ============================================ >> "%LOG_FILE%"
echo. >> "%LOG_FILE%"

REM Check if Node.js is installed
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed or not in PATH.
    echo Please install Node.js from https://nodejs.org/
    echo.
    echo [ERROR] Node.js is not installed or not in PATH. >> "%LOG_FILE%"
    echo Please install Node.js from https://nodejs.org/ >> "%LOG_FILE%"
    echo. >> "%LOG_FILE%"
    echo ============================================ >> "%LOG_FILE%"
    echo Script failed at: %DATE% %TIME% >> "%LOG_FILE%"
    echo ============================================ >> "%LOG_FILE%"
    echo.
    echo ============================================
    echo ERROR: Node.js not found!
    echo ============================================
    echo.
    echo Check the log file for details: %LOG_FILE%
    echo.
    pause
    exit /b 1
)

REM Display Node.js version
echo [INFO] Checking Node.js installation...
echo [INFO] Checking Node.js installation... >> "%LOG_FILE%"
node --version
node --version >> "%LOG_FILE%" 2>&1
echo.
echo. >> "%LOG_FILE%"

REM Check if npm is available
where npm >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] npm is not installed or not in PATH.
    echo Please install Node.js (which includes npm) from https://nodejs.org/
    echo.
    echo [ERROR] npm is not installed or not in PATH. >> "%LOG_FILE%"
    echo Please install Node.js (which includes npm) from https://nodejs.org/ >> "%LOG_FILE%"
    echo. >> "%LOG_FILE%"
    echo ============================================ >> "%LOG_FILE%"
    echo Script failed at: %DATE% %TIME% >> "%LOG_FILE%"
    echo ============================================ >> "%LOG_FILE%"
    echo.
    echo ============================================
    echo ERROR: npm not found!
    echo ============================================
    echo.
    echo Check the log file for details: %LOG_FILE%
    echo.
    pause
    exit /b 1
)

REM Check if node_modules exists, if not install dependencies
if not exist "node_modules" (
    echo [INFO] Installing dependencies (this may take a few minutes)...
    echo [INFO] Installing dependencies (this may take a few minutes)... >> "%LOG_FILE%"
    echo Output will be logged to %LOG_FILE%
    echo.
    echo. >> "%LOG_FILE%"
    call npm install >> "%LOG_FILE%" 2>&1
    if %ERRORLEVEL% NEQ 0 (
        echo.
        echo [ERROR] Failed to install dependencies.
        echo Check %LOG_FILE% for details.
        echo.
        echo [ERROR] Failed to install dependencies. >> "%LOG_FILE%"
        echo. >> "%LOG_FILE%"
        echo ============================================ >> "%LOG_FILE%"
        echo Script failed at: %DATE% %TIME% >> "%LOG_FILE%"
        echo ============================================ >> "%LOG_FILE%"
        echo.
        echo ============================================
        echo ERROR: Installation failed!
        echo ============================================
        echo.
        echo Check the log file for details: %LOG_FILE%
        echo.
        pause
        exit /b 1
    )
    echo.
    echo [SUCCESS] Dependencies installed successfully!
    echo [SUCCESS] Dependencies installed successfully! >> "%LOG_FILE%"
    echo. >> "%LOG_FILE%"
) else (
    echo [INFO] Dependencies already installed.
    echo [INFO] Dependencies already installed. >> "%LOG_FILE%"
    echo. >> "%LOG_FILE%"
)

REM Check if .env exists, if not create it
if not exist ".env" (
    echo [INFO] Creating .env file...
    echo [INFO] Creating .env file... >> "%LOG_FILE%"
    (
        echo DATABASE_URL=file:./prisma/dev.db
        echo NODE_ENV=development
        echo PORT=3000
        echo.
        echo # Airwallex API Configuration (optional - can be set in Settings UI)
        echo # AIRWALLEX_CLIENT_ID=
        echo # AIRWALLEX_API_KEY=
        echo # AIRWALLEX_ENV=demo
        echo # AIRWALLEX_CARDHOLDER_ID=
    ) > .env
    echo [SUCCESS] .env file created!
    echo [SUCCESS] .env file created! >> "%LOG_FILE%"
    echo. >> "%LOG_FILE%"
) else (
    echo [INFO] .env file already exists.
    echo [INFO] .env file already exists. >> "%LOG_FILE%"
    echo. >> "%LOG_FILE%"
)

REM Generate Prisma client
echo [INFO] Generating Prisma client...
echo [INFO] Generating Prisma client... >> "%LOG_FILE%"
call npm run prisma-generate >> "%LOG_FILE%" 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Failed to generate Prisma client.
    echo Check %LOG_FILE% for details.
    echo.
    echo [ERROR] Failed to generate Prisma client. >> "%LOG_FILE%"
    echo. >> "%LOG_FILE%"
    echo ============================================ >> "%LOG_FILE%"
    echo Script failed at: %DATE% %TIME% >> "%LOG_FILE%"
    echo ============================================ >> "%LOG_FILE%"
    echo.
    echo ============================================
    echo ERROR: Prisma generation failed!
    echo ============================================
    echo.
    echo Check the log file for details: %LOG_FILE%
    echo.
    pause
    exit /b 1
)
echo [SUCCESS] Prisma client generated successfully.
echo [SUCCESS] Prisma client generated successfully. >> "%LOG_FILE%"
echo. >> "%LOG_FILE%"

REM Push database schema
echo [INFO] Initializing database...
echo [INFO] Initializing database... >> "%LOG_FILE%"
call npm run prisma-push >> "%LOG_FILE%" 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Failed to initialize database.
    echo Check %LOG_FILE% for details.
    echo.
    echo [ERROR] Failed to initialize database. >> "%LOG_FILE%"
    echo. >> "%LOG_FILE%"
    echo ============================================ >> "%LOG_FILE%"
    echo Script failed at: %DATE% %TIME% >> "%LOG_FILE%"
    echo ============================================ >> "%LOG_FILE%"
    echo.
    echo ============================================
    echo ERROR: Database initialization failed!
    echo ============================================
    echo.
    echo Check the log file for details: %LOG_FILE%
    echo.
    pause
    exit /b 1
)
echo [SUCCESS] Database initialized successfully.
echo [SUCCESS] Database initialized successfully. >> "%LOG_FILE%"
echo. >> "%LOG_FILE%"

REM Start the development server
echo.
echo ============================================
echo [SUCCESS] Starting development server...
echo ============================================
echo.
echo The application will be available at: http://localhost:3000
echo.
echo Press Ctrl+C to stop the server.
echo Logs are being saved to: %LOG_FILE%
echo.
echo ============================================
echo.
echo ============================================ >> "%LOG_FILE%"
echo [SUCCESS] Starting development server... >> "%LOG_FILE%"
echo ============================================ >> "%LOG_FILE%"
echo Application available at: http://localhost:3000 >> "%LOG_FILE%"
echo. >> "%LOG_FILE%"

REM Start server - output visible in console, errors logged
call npm run dev

REM If we get here, the server stopped
echo. >> "%LOG_FILE%"
echo Server stopped at: %DATE% %TIME% >> "%LOG_FILE%"
echo.
echo Server stopped. Logs saved to: %LOG_FILE%
pause
exit /b 0
