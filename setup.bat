@echo off
echo ========================================
echo YCNews Setup Script
echo ========================================
echo.

echo Step 1: Setting up Backend...
cd backend

echo Creating virtual environment...
python -m venv venv

echo Activating virtual environment...
call venv\Scripts\activate

echo Installing dependencies...
pip install -r requirements.txt

echo Creating .env file...
if not exist .env (
    copy .env.example .env
    echo .env file created. Please edit it with your database credentials.
) else (
    echo .env file already exists.
)

cd ..

echo.
echo Step 2: Setting up Frontend...
cd frontend

echo Installing npm dependencies...
call npm install

cd ..

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Edit backend/.env with your database credentials
echo 2. Run: cd backend
echo 3. Run: venv\Scripts\activate
echo 4. Run: alembic upgrade head
echo 5. Run: python init_db.py
echo 6. Use start-backend.bat and start-frontend.bat to run the application
echo.
pause
