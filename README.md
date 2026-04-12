# QuickTasks

## Description

QuickTasks is a Linux desktop widget that allows the user to display a calendar grid where they can add their own TO-DO tasks. This cool tool can be turned into a bar which displays the current active task with fluid navigation throughout it. It also features synergy with Caelestia shell's dynamic color palette.

More info soon!

## Installation

This project contains a C++ backend CLI and an AGS TypeScript frontend.

### Requirements
1. `bash` environment on Linux.
2. `sudo` privileges to install system dependencies.

### Steps
1. Run `./install.sh` from the repository root.
2. The script will attempt to install the necessary build dependencies (`cmake`, `g++`, `make`, `git`).
3. It will also try to install `ags` if the package is available in your package manager.
4. It will then compile `task-calendar` and copy the binary to `~/.local/bin/task-calendar`.
5. The AGS frontend will be installed in `~/.config/task-calendar/`.
6. The launch script will be available as `~/.local/bin/task-calendar-launch`.

### Run
```bash
task-calendar-launch
```

## Configuration
### Default Startup View (Bar vs. Calendar)
You can easily configure whether QuickTasks opens the Bar or the Calendar by default upon launch.

Open the state file located at task-calendar-ags/state/AppState.ts (or ~/.config/task-calendar/state/AppState.ts if you have already installed it).

Look for the initialState object.

Change the mode property to either "bar" or "calendar" depending on your preference:

```TypeScript
TypeScript
const initialState: AppStateType = {
    mode: "bar", // Change this to "calendar" to open the calendar view by default
    currentMonthYear: actualMonthYear,
    // ...
};
```

### Hyprland Integration
To integrate QuickTasks into Hyprland, add the following snippet to your hyprland.conf:

```bash
bind = SUPER, T, exec, ~/.local/bin/task-calendar-launch
```

### Structure
The AGS frontend is located in the task-calendar-ags/ directory, and the C++ backend handles the rest of the repository.

## Notes
The frontend expects the binary to be located at ```~/QuickTasks/build/task-calendar```.

If you change the project location, make sure to update the path in ```task-calendar-ags/services/BackendService.ts``` and ```task-calendar-ags/dist.js```
