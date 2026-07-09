@echo off
echo Starting MuleShield AI...

set PROJECT_DIR=%~dp0

cd /d "%PROJECT_DIR%backend"

if not exist venv (
  echo Creating Python venv...
  python -m venv venv
)

call venv\Scripts\activate

if exist requirements.txt (
  pip install -r requirements.txt
) else (
  pip install fastapi uvicorn pydantic
)

cd /d "%PROJECT_DIR%frontend"

if not exist node_modules (
  echo Installing frontend dependencies...
  npm install
)

start cmd /k "cd /d %PROJECT_DIR%backend && call venv\Scripts\activate && uvicorn main:app --reload"

start cmd /k "cd /d %PROJECT_DIR%frontend && npm run dev"

timeout /t 3 >nul
start http://localhost:5173

echo MuleShield AI started.
pause