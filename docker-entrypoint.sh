#!/bin/sh
set -e

if [ -d /usr/share/fonts/custom ] && [ "$(ls -A /usr/share/fonts/custom 2>/dev/null)" ]; then
    fc-cache -fv /usr/share/fonts/custom
fi

exec gunicorn --bind 0.0.0.0:5000 --workers 2 --timeout 120 app:app
