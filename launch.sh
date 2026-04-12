#!/usr/bin/env bash
set -euo pipefail

# 1. Comprobamos dependencias
if ! command -v agsv1 >/dev/null 2>&1; then
    echo "Error: agsv1 no está instalado." >&2
    exit 1
fi

if ! command -v esbuild >/dev/null 2>&1; then
    echo "Error: esbuild no está instalado (necesario para TypeScript)." >&2
    exit 1
fi

CONFIG_DIR="$HOME/.config/task-calendar"

# Si ya está corriendo nuestra instancia específica, la matamos (Toggle)
if pgrep -f "agsv1 -c $CONFIG_DIR/dist.js" >/dev/null; then
    pkill -f "agsv1 -c $CONFIG_DIR/dist.js"
else
    # Si no, la lanzamos en segundo plano
    agsv1 -c "$CONFIG_DIR/dist.js" > /tmp/task-calendar.log 2>&1 &
fi