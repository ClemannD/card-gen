@echo off
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

echo.
echo ============================================
echo Card Generator - Starting Application
echo ============================================
echo.

REM Check if Node.js is installed
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed or not in PATH.
    echo Please install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

REM Display Node.js version
echo [INFO] Node.js version:
node --version
echo.

REM Check if npm is available
where npm >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] npm is not installed or not in PATH.
    echo Please install Node.js (which includes npm) from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

REM Check if node_modules exists, if not install dependencies
if not exist "node_modules" (
    echo [INFO] Installing dependencies (this may take a few minutes)...
    echo.
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Failed to install dependencies.
        echo.
        pause
        exit /b 1
    )
    echo.
    echo [SUCCESS] Dependencies installed successfully!
    echo.
) else (
    echo [INFO] Dependencies already installed.
    echo.
)

REM Check if .env exists, if not create it
if not exist ".env" (
    echo [INFO] Creating .env file...
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
    echo.
) else (
    echo [INFO] .env file already exists.
    echo.
)

REM Generate Prisma client
echo [INFO] Generating Prisma client...
call npm run prisma-generate
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to generate Prisma client.
    echo.
    pause
    exit /b 1
)
echo.

REM Push database schema
echo [INFO] Initializing database...
call npm run prisma-push
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to initialize database.
    echo.
    pause
    exit /b 1
)
echo.

REM Start the development server
echo ============================================
echo [SUCCESS] Starting development server...
echo ============================================
echo.
echo The application will be available at: http://localhost:3000
echo.
echo Press Ctrl+C to stop the server.
echo.
echo ============================================
echo.

call npm run dev

pause

