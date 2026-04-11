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

# Ejecución de chequeos
install_build_deps
install_gtk_deps
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

# Copiamos Frontend (Ahora copiará el código bueno que hemos salvado)
cp -r "$ROOT/task-calendar-ags"/* "$INSTALL_CONFIG/"

# Copiamos Script Lanzador
cp "$ROOT/launch.sh" "$INSTALL_BIN/task-calendar-launch"

printf "\n✅ Instalación completada con éxito.\n"
printf "Backend C++: %s/task-calendar\n" "$INSTALL_BIN"
printf "Frontend AGS: %s\n" "$INSTALL_CONFIG"
printf "Lanzador: %s/task-calendar-launch\n" "$INSTALL_BIN"