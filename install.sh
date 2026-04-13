#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BUILD_DIR="$ROOT/build"

command_exists() {
    command -v "$1" >/dev/null 2>&1
}

install_packages() {
    local manager="$1"
    shift
    local packages=("$@")
    case "$manager" in
        apt) sudo apt update && sudo apt install -y "${packages[@]}" ;;
        pacman) sudo pacman -Syu --noconfirm "${packages[@]}" ;;
        dnf) sudo dnf install -y "${packages[@]}" ;;
        zypper) sudo zypper install -y "${packages[@]}" ;;
        *) return 1 ;;
    esac
}

install_build_deps() {
    if command_exists cmake && command_exists g++ && command_exists make && command_exists git; then
        printf "Build dependencies already installed.\n"
    else
        printf "Installing build dependencies...\n"
        if command_exists apt; then install_packages apt cmake build-essential git
        elif command_exists pacman; then install_packages pacman cmake base-devel git
        elif command_exists dnf; then install_packages dnf cmake gcc-c++ make git
        elif command_exists zypper; then install_packages zypper cmake gcc-c++ make git
        else
            printf "Please install cmake, g++, make, and git manually.\n"
            return 1
        fi
    fi
}

install_gtk_deps() {
    if command_exists pkg-config && pkg-config --exists gtk+-3.0; then
        printf "GTK3 development libraries already installed.\n"
        return 0
    fi
    printf "Installing GTK3 development libraries...\n"
    if command_exists apt; then install_packages apt libgtk-3-dev libgtk-3-0
    elif command_exists pacman; then install_packages pacman gtk3
    elif command_exists dnf; then install_packages dnf gtk3-devel
    elif command_exists zypper; then install_packages zypper gtk3-devel
    else
        printf "Please install GTK3 development libraries manually.\n"
        return 1
    fi
}

check_ags() {
    if command_exists agsv1; then
        printf "AGS V1 runtime detected correctly.\n"
    else
        printf "Warning: agsv1 runtime not found in PATH.\n"
        printf "Please ensure AGS V1 is installed via AUR (agsv1).\n"
    fi
}

install_esbuild() {
    if command_exists esbuild; then
        printf "esbuild (TypeScript compiler) is already installed.\n"
        return 0
    fi
    printf "Installing esbuild (TypeScript compiler)...\n"
    if command_exists npm; then sudo npm install -g esbuild
    elif command_exists pacman; then install_packages pacman esbuild
    elif command_exists apt; then install_packages apt esbuild
    elif command_exists dnf; then install_packages dnf esbuild
    else
        printf "Warning: Please install esbuild manually (e.g. npm install -g esbuild).\n"
    fi
}

configure_hyprland_rule() {
    local hyprland_conf=""
    local hyprland_candidates=(
        "$HOME/.config/hypr/hyprland.conf"
        "$HOME/.conf/hypr/hyprland.conf"
    )
    local layer_rule='layerrule = order 1, match:namespace bar'
        local legacy_rule='layerrule = order 1, namespace:bar'

    for candidate in "${hyprland_candidates[@]}"; do
        if [[ -e "$candidate" ]]; then
            hyprland_conf="$candidate"
            break
        fi
    done

    if [[ -z "$hyprland_conf" ]]; then
        echo "Warning: no encuentro ${hyprland_candidates[0]} ni ${hyprland_candidates[1]}."
        echo "Si usas Caelestia, añade manualmente esta regla exacta en Hyprland:"
        echo "$layer_rule"
        return 0
    fi

    if [[ ! -r "$hyprland_conf" || ! -w "$hyprland_conf" ]]; then
        echo "Warning: no tengo permisos de lectura/escritura sobre $hyprland_conf."
        echo "Si usas Caelestia, añade manualmente esta regla exacta en Hyprland:"
        echo "$layer_rule"
        return 0
    fi

    if grep -Fxq "$layer_rule" "$hyprland_conf"; then
        printf "Hyprland ya contiene la regla de QuickTasks.\n"
        return 0
    fi

    if grep -Eq 'layerrule[[:space:]]*=[[:space:]]*order[[:space:]]*1,[[:space:]]*namespace:bar' "$hyprland_conf"; then
        python3 - "$hyprland_conf" "$layer_rule" <<'PY'
from pathlib import Path
import sys

path = Path(sys.argv[1])
replacement = sys.argv[2]
text = path.read_text()
lines = text.splitlines()
updated = []
changed = False

for line in lines:
    if line.lstrip().startswith('layerrule') and 'namespace:bar' in line:
        updated.append(replacement)
        changed = True
    else:
        updated.append(line)

new_text = '\n'.join(updated)
if text.endswith('\n'):
    new_text += '\n'

if changed:
    path.write_text(new_text)
    print(f"Regla corregida en {path}")
else:
    print(f"No se encontraron cambios en {path}")
PY
        return 0
    fi

    echo "No se encontró la regla de QuickTasks en $hyprland_conf."
    if [[ -t 0 ]]; then
        read -r -p "¿Quieres añadirla al final del archivo? [y/N] " reply
        if [[ "$reply" =~ ^[Yy]$ ]]; then
            {
                echo
                echo "# QuickTasks"
                echo "$layer_rule"
            } >> "$hyprland_conf"
            printf "Regla añadida a %s\n" "$hyprland_conf"
        else
            printf "Regla no añadida.\n"
        fi
    else
        echo "Warning: no puedo pedir confirmación interactiva."
        echo "Si usas Caelestia, añade manualmente esta regla exacta en Hyprland:"
        echo "$layer_rule"
    fi
}

# Ejecución de chequeos
install_build_deps
install_gtk_deps
install_esbuild
check_ags

# Compilación de C++
mkdir -p "$BUILD_DIR"
cmake -S "$ROOT" -B "$BUILD_DIR"
cmake --build "$BUILD_DIR" --target task-calendar -- -j$(nproc)

# Instalación
INSTALL_BIN="$HOME/.local/bin"
INSTALL_CONFIG="$HOME/.config/task-calendar"

mkdir -p "$INSTALL_BIN"
mkdir -p "$INSTALL_CONFIG"

# Copiamos binario C++
cp "$BUILD_DIR/task-calendar" "$INSTALL_BIN/task-calendar"

# Compilación AGS Typescript
cd "$ROOT/task-calendar-ags"
esbuild app.ts --bundle --format=esm --outfile=dist.js --external:resource://* --external:gi://*

# Copiamos Frontend (Ahora copiará el código bueno que hemos salvado incluido dist.js)
cp -r "$ROOT/task-calendar-ags"/* "$INSTALL_CONFIG/"

# Copiamos Script Lanzador
cp "$ROOT/launch.sh" "$INSTALL_BIN/task-calendar-launch"

configure_hyprland_rule

printf "\n✅ Instalación completada con éxito.\n"
printf "Backend C++: %s/task-calendar\n" "$INSTALL_BIN"
printf "Frontend AGS: %s\n" "$INSTALL_CONFIG"
printf "Lanzador: %s/task-calendar-launch\n" "$INSTALL_BIN"