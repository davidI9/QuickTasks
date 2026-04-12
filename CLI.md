# QuickTasks CLI - Backend Manual

This document details the usage of the `task-calendar` binary for managing tasks from the terminal. The backend communicates in a standardized way using flags (`--flag value`) and always returns a response in **JSON** format.

## Binary Location

After installation, the binary should be available at: `~/.local/bin/task-calendar`

## Commands and Syntax

The QuickTasks CLI uses subcommands followed by named arguments. *Note on context:* Many commands accept the optional `--month "MM/YYYY"` argument. If included, the command will return the updated **Calendar** JSON structure. If omitted, it will return the **Bar** (TaskList) JSON structure.

### 1. Get Calendar (`get-calendar`)
Returns the matrix of cells and tasks for a specific month.
* **Required:** `--month`

```bash
task-calendar get-calendar --month "04/2026"
```

### 2. Get Task List (```get-tasks```)
Returns all saved tasks in a list format (ideal for the bar view).

Arguments: None.

```Bash
task-calendar get-tasks
```

### 3. Add a Task (```add-task```)
Creates a new task.

Required: ```--name```, ```--due```

Optional: ```--month``` (to return the updated calendar JSON).

```Bash
task-calendar add-task --name "Buy coffee" --due "15/04/2026"

# With calendar context:
task-calendar add-task --name "Meeting" --due "16/04/2026" --month "04/2026"
```

### 4. Edit a Task (```edit-task```)
Modifies the attributes of an existing task. You only need to pass the fields you want to change.

Required: ```--id```

Optional: ```--name```, ```--due```, ```--completed``` (true or false), ```--month```

```Bash
# Mark as completed
task-calendar edit-task --id "task-uuid" --completed true

# Change name and date
task-calendar edit-task --id "task-uuid" --name "Buy decaf coffee" --due "16/04/2026"
```

### 5. Remove a Task (```remove-task```)
Permanently deletes a task from the database.

Required: ```--id```

Optional: ```--month```

```Bash
task-calendar remove-task --id "task-uuid"
```

### 6. Set Featured Task (```set-featured```)
Sets which task is the main/featured one (the one likely highlighted in the bar).

Required: ```--id```

```Bash
task-calendar set-featured --id "task-uuid"
```

## Response Format (JSON)
The CLI never prints plain text; it always returns JSON through standard output (stdout).

Success (Returning a Calendar):

```JSON
{
  "type": "calendar",
  "monthYear": "04/2026",
  "featuredTaskId": "featured-uuid",
  "cells": [ ... ]
}
```

**Success (Returning a List):**

```JSON
{
  "type": "taskList",
  "featuredTaskId": "featured-uuid",
  "tasks": [ ... ]
}
```

**Error:**

```JSON
{
  "type": "error",
  "code": "INVALID_COMMAND",
  "message": "Missing subcommand"
}
```

## Global Usage (Add to PATH)
By default, the binary is installed in ```~/.local/bin```. To execute ```task-calendar``` from any directory (and for the AGS frontend to find it without issues), you must ensure this path is in your environment variable.

**Add to your Bash/Zsh:**
Run this in your terminal:

```Bash
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
# If you use zsh, use ~/.zshrc instead of ~/.bashrc
```

**Apply the changes:**

```Bash
source ~/.bashrc
```

**Verify:**

```Bash
task-calendar get-tasks
```
