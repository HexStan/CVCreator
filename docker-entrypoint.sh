#!/bin/sh
set -e

FONTS_DIR="${FONTS_DIR:-/app/fonts}"

if [ -d "$FONTS_DIR" ] && [ "$(ls -A "$FONTS_DIR" 2>/dev/null)" ]; then
    fc-cache -fv "$FONTS_DIR"
fi

exec gunicorn --bind 0.0.0.0:5000 --workers 2 --timeout 120 app:app
