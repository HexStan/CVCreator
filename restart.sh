#!/usr/bin/env bash
echo "=== CV Creator - Restarting ==="

ROOT="$(cd "$(dirname "$0")" && pwd)"

bash "$ROOT/stop.sh"

echo ""
sleep 2

bash "$ROOT/start.sh"
