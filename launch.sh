#!/usr/bin/env bash
set -euo pipefail

if ! command -v ags >/dev/null 2>&1; then
    echo "Error: ags is not installed or not in PATH." >&2
    exit 1
fi

CONFIG="$HOME/.config/task-calendar/app.ts"
if [[ ! -f "$CONFIG" ]]; then
    echo "Error: AGS configuration not found at $CONFIG" >&2
    exit 1
fi

exec ags -b task-calendar -c "$CONFIG"
