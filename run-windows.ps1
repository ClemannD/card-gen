# ============================================
# Card Generator - Windows PowerShell Quick Start Script
# ============================================
# This script will:
# 1. Check for Node.js installation
# 2. Install dependencies if needed
# 3. Set up environment file if needed
# 4. Initialize database
# 5. Start the development server
# ============================================

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Card Generator - Starting Application" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "[INFO] Node.js version: $nodeVersion" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "[ERROR] Node.js is not installed or not in PATH." -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if npm is available
try {
    $npmVersion = npm --version
    Write-Host "[INFO] npm version: $npmVersion" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "[ERROR] npm is not installed or not in PATH." -ForegroundColor Red
    Write-Host "Please install Node.js (which includes npm) from https://nodejs.org/" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if node_modules exists, if not install dependencies
if (-Not (Test-Path "node_modules")) {
    Write-Host "[INFO] Installing dependencies (this may take a few minutes)..." -ForegroundColor Yellow
    Write-Host ""
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Failed to install dependencies." -ForegroundColor Red
        Write-Host ""
        Read-Host "Press Enter to exit"
        exit 1
    }
    Write-Host ""
    Write-Host "[SUCCESS] Dependencies installed successfully!" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "[INFO] Dependencies already installed." -ForegroundColor Green
    Write-Host ""
}

# Check if .env exists, if not create it
if (-Not (Test-Path ".env")) {
    Write-Host "[INFO] Creating .env file..." -ForegroundColor Yellow
    $envContent = @"
DATABASE_URL=file:./prisma/dev.db
NODE_ENV=development
PORT=3000

# Airwallex API Configuration (optional - can be set in Settings UI)
# AIRWALLEX_CLIENT_ID=
# AIRWALLEX_API_KEY=
# AIRWALLEX_ENV=demo
# AIRWALLEX_CARDHOLDER_ID=
"@
    $envContent | Out-File -FilePath ".env" -Encoding utf8
    Write-Host "[SUCCESS] .env file created!" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "[INFO] .env file already exists." -ForegroundColor Green
    Write-Host ""
}

# Generate Prisma client
Write-Host "[INFO] Generating Prisma client..." -ForegroundColor Yellow
npm run prisma-generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Failed to generate Prisma client." -ForegroundColor Red
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host ""

# Push database schema
Write-Host "[INFO] Initializing database..." -ForegroundColor Yellow
npm run prisma-push
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Failed to initialize database." -ForegroundColor Red
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host ""

# Start the development server
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "[SUCCESS] Starting development server..." -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "The application will be available at: http://localhost:3000" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press Ctrl+C to stop the server." -ForegroundColor Yellow
Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

npm run dev

