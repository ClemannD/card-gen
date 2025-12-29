@echo off
setlocal enabledelayedexpansion
REM ============================================
REM Card Generator - Windows Quick Start Script
REM ============================================

REM Trap errors and ensure window stays open
set "SCRIPT_EXIT_CODE=0"

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
echo [STEP 1/6] Checking Node.js installation...
echo [STEP 1/6] Checking Node.js installation... >> "%LOG_FILE%"
where node >nul 2>&1
if errorlevel 1 (
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
    echo Press any key to exit...
    pause >nul
    if errorlevel 1 pause
    set "SCRIPT_EXIT_CODE=1"
    goto :script_end
)

REM Display Node.js version
node --version
node --version >> "%LOG_FILE%" 2>&1
echo.
echo. >> "%LOG_FILE%"

REM Check if npm is available
echo [STEP 2/6] Checking npm installation...
echo [STEP 2/6] Checking npm installation... >> "%LOG_FILE%"
echo [DEBUG] About to test npm command... >> "%LOG_FILE%"

REM Try to get npm version - if this fails, npm isn't working
echo [DEBUG] Attempting to run: npm --version >> "%LOG_FILE%"
npm --version >nul 2>&1
set "NPM_RESULT=%ERRORLEVEL%"
echo [DEBUG] npm --version returned: %NPM_RESULT% >> "%LOG_FILE%"

if %NPM_RESULT% NEQ 0 (
    echo [ERROR] npm command failed!
    echo.
    echo [ERROR] npm command failed! >> "%LOG_FILE%"
    echo Attempting to diagnose... >> "%LOG_FILE%"
    
    REM Try to see what happens when we run npm
    echo Testing npm command output: >> "%LOG_FILE%"
    npm --version >> "%LOG_FILE%" 2>&1
    echo. >> "%LOG_FILE%"
    
    echo ============================================
    echo ERROR: npm not working!
    echo ============================================
    echo.
    echo Node.js is installed (v24.12.0), but npm is not working.
    echo This is unusual - npm should come with Node.js.
    echo.
    echo Possible solutions:
    echo 1. Reinstall Node.js from https://nodejs.org/
    echo 2. Check if npm is in your PATH
    echo 3. Check the log file for more details: %LOG_FILE%
    echo.
    echo ============================================ >> "%LOG_FILE%"
    echo Script failed at: %DATE% %TIME% >> "%LOG_FILE%"
    echo ============================================ >> "%LOG_FILE%"
    echo.
    echo Press any key to exit...
    pause >nul
    if errorlevel 1 pause
    set "SCRIPT_EXIT_CODE=1"
    goto :script_end
)

REM Show npm version
echo [INFO] npm version:
echo [DEBUG] About to display npm version... >> "%LOG_FILE%"
npm --version
npm --version >> "%LOG_FILE%" 2>&1
echo [SUCCESS] npm found and working
echo [SUCCESS] npm found and working >> "%LOG_FILE%"
echo [DEBUG] Continuing to next step... >> "%LOG_FILE%"
echo.
echo. >> "%LOG_FILE%"

REM Check if node_modules exists, if not install dependencies
echo [STEP 3/6] Checking dependencies...
echo [STEP 3/6] Checking dependencies... >> "%LOG_FILE%"
if not exist "node_modules" (
    echo [INFO] Installing dependencies (this may take a few minutes)...
    echo [INFO] Installing dependencies (this may take a few minutes)... >> "%LOG_FILE%"
    echo Output will be logged to %LOG_FILE%
    echo.
    echo. >> "%LOG_FILE%"
    call npm install >> "%LOG_FILE%" 2>&1
    if errorlevel 1 (
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
        echo Press any key to exit...
        pause >nul
        if errorlevel 1 pause
        set "SCRIPT_EXIT_CODE=1"
        goto :script_end
    )
    echo.
    echo [SUCCESS] Dependencies installed successfully!
    echo [SUCCESS] Dependencies installed successfully! >> "%LOG_FILE%"
    echo. >> "%LOG_FILE%"
) else (
    echo [SUCCESS] Dependencies already installed.
    echo [SUCCESS] Dependencies already installed. >> "%LOG_FILE%"
    echo. >> "%LOG_FILE%"
)

REM Check if .env exists, if not create it
echo [STEP 4/6] Checking environment configuration...
echo [STEP 4/6] Checking environment configuration... >> "%LOG_FILE%"
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
    echo [SUCCESS] .env file already exists.
    echo [SUCCESS] .env file already exists. >> "%LOG_FILE%"
    echo. >> "%LOG_FILE%"
)

REM Generate Prisma client
echo [STEP 5/6] Generating Prisma client...
echo [STEP 5/6] Generating Prisma client... >> "%LOG_FILE%"
call npm run prisma-generate >> "%LOG_FILE%" 2>&1
if errorlevel 1 (
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
    echo Press any key to exit...
    pause >nul
    if errorlevel 1 pause
    set "SCRIPT_EXIT_CODE=1"
    goto :script_end
)
echo [SUCCESS] Prisma client generated successfully.
echo [SUCCESS] Prisma client generated successfully. >> "%LOG_FILE%"
echo. >> "%LOG_FILE%"

REM Push database schema
echo [STEP 6/6] Initializing database...
echo [STEP 6/6] Initializing database... >> "%LOG_FILE%"
call npm run prisma-push >> "%LOG_FILE%" 2>&1
if errorlevel 1 (
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
    echo Press any key to exit...
    pause >nul
    if errorlevel 1 pause
    set "SCRIPT_EXIT_CODE=1"
    goto :script_end
)
echo [SUCCESS] Database initialized successfully.
echo [SUCCESS] Database initialized successfully. >> "%LOG_FILE%"
echo. >> "%LOG_FILE%"

REM Start the development server
echo.
echo ============================================
echo [SUCCESS] All checks passed!
echo Starting development server...
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
set "SERVER_EXIT_CODE=%ERRORLEVEL%"

REM If we get here, the server stopped
echo. >> "%LOG_FILE%"
echo Server stopped at: %DATE% %TIME% >> "%LOG_FILE%"
echo Exit code: %SERVER_EXIT_CODE% >> "%LOG_FILE%"
set "SCRIPT_EXIT_CODE=%SERVER_EXIT_CODE%"
goto :script_end

:script_end
echo.
echo ============================================
if %SCRIPT_EXIT_CODE% NEQ 0 (
    echo Script completed with errors.
    echo Exit code: %SCRIPT_EXIT_CODE%
) else (
    echo Script completed successfully.
)
echo ============================================
echo.
echo Logs saved to: %LOG_FILE%
echo.
echo Press any key to close this window...
pause >nul
if errorlevel 1 pause
exit /b %SCRIPT_EXIT_CODE%
