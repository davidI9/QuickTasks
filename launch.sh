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

# 1. Limpiamos por si acaso
pkill agsv1 || true

# 2. Transpilamos (esto ya sabemos que funciona perfecto)
cd ~/.config/task-calendar
esbuild app.ts --bundle --format=esm --outfile=dist.js --external:resource://* --external:gi://*

# 3. LANZAMOS CON RUTA ABSOLUTA
agsv1 -c "$PWD/dist.js"