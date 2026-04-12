# QuickTasks

## Description

QuickTasks is an Hyprland desktop widget that allows the user to display a calendar grid where they can add their own TO-DO tasks. This cool tool can be turned into a bar which displays the currently doing task with a fluid navigation throughout it. Also it has synergy with caelestia shell's dynamics colors palette.

More info soon!

## Installation

This project contains a C++ backend CLI and an AGS TypeScript frontend.

### Requisitos
1. `bash` en Linux.
2. `sudo` disponible para instalar dependencias del sistema.

### Pasos
1. Ejecuta `./install.sh` desde la raíz del repositorio.
2. El script intentará instalar las dependencias de compilación necesarias (`cmake`, `g++`, `make`, `git`).
3. También intentará instalar `ags` si el paquete está disponible en tu gestor de paquetes.
4. Luego compila `task-calendar` y copia el binario a `~/.local/bin/task-calendar`.
5. También instala el frontend AGS en `~/.config/task-calendar/`.
6. El script de lanzamiento queda disponible como `~/.local/bin/task-calendar-launch`.

### Ejecutar
```bash
task-calendar-launch
```

## Hyprland
Para integrar QuickTasks en Hyprland, añade el siguiente snippet a tu `hyprland.conf`:

```ini
bind = SUPER, T, exec, ~/.local/bin/task-calendar-launch
```

## Estructura
El frontend AGS está en `task-calendar-ags/` y el backend C++ en el resto del repositorio.

## Notas
- El frontend espera el binario en `/home/david/Codigos/quickTasks/build/task-calendar`.
- Si cambias la ubicación del proyecto, actualiza `task-calendar-ags/services/BackendService.ts`.