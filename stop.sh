#!/usr/bin/env bash
echo "=== CV Creator - Stopping ==="

ROOT="$(cd "$(dirname "$0")" && pwd)"

echo "Stopping Flask backend (port 5000)..."
BACKEND_PIDS=$(lsof -ti :5000 2>/dev/null)
if [ -n "$BACKEND_PIDS" ]; then
    echo "$BACKEND_PIDS" | xargs kill 2>/dev/null
    echo "Backend stopped."
else
    echo "Backend is not running."
fi

echo "Stopping Vite frontend (port 5173)..."
FRONTEND_PIDS=$(lsof -ti :5173 2>/dev/null)
if [ -n "$FRONTEND_PIDS" ]; then
    echo "$FRONTEND_PIDS" | xargs kill 2>/dev/null
    echo "Frontend stopped."
else
    echo "Frontend is not running."
fi

echo "All services stopped."
