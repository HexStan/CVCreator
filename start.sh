#!/usr/bin/env bash
echo "=== CV Creator - Starting ==="

ROOT="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$ROOT/backend"
FRONTEND_DIR="$ROOT/frontend"

echo "Starting Flask backend..."
python "$BACKEND_DIR/app.py" &
BACKEND_PID=$!

echo "Starting Vite frontend..."
(cd "$FRONTEND_DIR" && npx vite) &
FRONTEND_PID=$!

sleep 3

echo ""
echo "Backend:  http://localhost:5000"
echo "Frontend: http://localhost:5173"
echo ""
echo "Open http://localhost:5173 in browser"
