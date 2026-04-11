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
        apt)
            sudo apt update
            sudo apt install -y "${packages[@]}"
            ;;
        pacman)
            sudo pacman -Syu --noconfirm "${packages[@]}"
            ;;
        dnf)
            sudo dnf install -y "${packages[@]}"
            ;;
        zypper)
            sudo zypper install -y "${packages[@]}"
            ;;
        *)
            return 1
            ;;
    esac
}

install_build_deps() {
    if command_exists cmake && command_exists g++ && command_exists make && command_exists git; then
        printf "Build dependencies already installed.\n"
        return 0
    fi

    printf "Installing build dependencies...\n"
    if command_exists apt; then
        install_packages apt cmake build-essential git
    elif command_exists pacman; then
        install_packages pacman cmake base-devel git
    elif command_exists dnf; then
        install_packages dnf cmake gcc-c++ make git
    elif command_exists zypper; then
        install_packages zypper cmake gcc-c++ make git
    else
        printf "Could not detect a supported package manager.\n"
        printf "Please install cmake, g++, make, and git manually.\n"
        return 1
    fi
}

try_install_ags() {
    if command_exists ags; then
        printf "AGS runtime already installed.\n"
        return 0
    fi

    printf "AGS runtime not found in PATH. Trying to install AGS if available...\n"
    if command_exists apt && apt-cache show ags >/dev/null 2>&1; then
        sudo apt install -y ags
    elif command_exists pacman && pacman -Ss '^ags$' | grep -q '^community/ags\|^extra/ags\|^core/ags'; then
        sudo pacman -S --noconfirm ags
    elif command_exists dnf && dnf list ags >/dev/null 2>&1; then
        sudo dnf install -y ags
    elif command_exists zypper && zypper se -s ags | grep -q '^i\|^S'; then
        sudo zypper install -y ags
    fi

    if ! command_exists ags; then
        printf "Warning: AGS runtime still not found after package installation.\n"
        printf "Please install AGS manually and ensure it is available in PATH.\n"
    fi
}

install_build_deps
try_install_ags

mkdir -p "$BUILD_DIR"
cmake -S "$ROOT" -B "$BUILD_DIR"
cmake --build "$BUILD_DIR" --target task-calendar -- -j$(nproc)

INSTALL_BIN="$HOME/.local/bin"
INSTALL_CONFIG="$HOME/.config/task-calendar"

mkdir -p "$INSTALL_BIN"
mkdir -p "$INSTALL_CONFIG"
cp "$BUILD_DIR/task-calendar" "$INSTALL_BIN/task-calendar"
cp -r "$ROOT/task-calendar-ags"/* "$INSTALL_CONFIG/"
cp "$ROOT/launch.sh" "$INSTALL_BIN/task-calendar-launch"

printf "Installed backend binary to %s/task-calendar\n" "$INSTALL_BIN"
printf "Installed AGS frontend to %s\n" "$INSTALL_CONFIG"
printf "Installed launch script to %s/task-calendar-launch\n" "$INSTALL_BIN"
