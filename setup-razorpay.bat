@echo off
echo.
echo ========================================
echo RENSELL - Razorpay Integration Setup
echo ========================================
echo.

REM Check if .env.local exists
if not exist .env.local (
    echo Creating .env.local file...
    copy .env.example .env.local
    echo [OK] .env.local created
    echo.
    echo [WARNING] IMPORTANT: Update .env.local with your credentials:
    echo    1. MongoDB URI
    echo    2. JWT Secret
    echo    3. Razorpay API Keys
    echo.
) else (
    echo [OK] .env.local already exists
    echo.
)

REM Install dependencies
echo Installing dependencies...
call npm install

if %errorlevel% equ 0 (
    echo [OK] Dependencies installed successfully
) else (
    echo [ERROR] Failed to install dependencies
    exit /b 1
)

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next Steps:
echo    1. Get Razorpay API keys from: https://dashboard.razorpay.com
echo    2. Update .env.local with your keys
echo    3. Set up MongoDB Atlas: https://cloud.mongodb.com
echo    4. Run: npm run dev
echo    5. Visit: http://localhost:3000
echo.
echo Read RAZORPAY_INTEGRATION.md for detailed guide
echo.
pause
