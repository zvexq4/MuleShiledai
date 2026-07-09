#!/bin/bash

echo "🛡 Starting MuleShield AI..."

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"

cd "$PROJECT_DIR/backend" || exit

if [ ! -d "venv" ]; then
  echo "📦 Creating Python venv..."
  python3 -m venv venv
fi

source venv/bin/activate

if [ -f requirements.txt ]; then
  pip install -r requirements.txt
else
  pip install fastapi uvicorn pydantic
fi

cd "$PROJECT_DIR/frontend" || exit

if [ ! -d "node_modules" ]; then
  echo "📦 Installing frontend dependencies..."
  npm install
fi

osascript -e "tell app \"Terminal\" to do script \"cd '$PROJECT_DIR/backend' && source venv/bin/activate && uvicorn main:app --reload\""

osascript -e "tell app \"Terminal\" to do script \"cd '$PROJECT_DIR/frontend' && npm run dev\""

sleep 3
open http://localhost:5173

echo "✅ MuleShield AI started."