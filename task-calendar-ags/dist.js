// lib/state.ts
import Variable from "resource:///com/github/Aylur/ags/variable.js";
function createState(initial) {
  const state2 = {};
  for (const key in initial) {
    if (Object.prototype.hasOwnProperty.call(initial, key)) {
      state2[key] = Variable(initial[key]);
    }
  }
  return state2;
}

// state/AppState.ts
var today = /* @__PURE__ */ new Date();
var currentMonth = String(today.getMonth() + 1).padStart(2, "0");
var currentYear = today.getFullYear();
var actualMonthYear = `${currentMonth}/${currentYear}`;
var initialState = {
  mode: "bar",
  currentMonthYear: actualMonthYear,
  calendarData: null,
  taskList: null,
  featuredTaskId: null,
  barCurrentIndex: 0,
  loading: false,
  error: null
};
var state = createState(initialState);
function toggleMode() {
  state.mode.setValue(state.mode.value === "calendar" ? "bar" : "calendar");
}
function setFeaturedTaskId(id) {
  state.featuredTaskId.setValue(id);
}
function setCurrentMonthYear(monthYear) {
  state.currentMonthYear.setValue(monthYear);
}
function setCalendarData(data) {
  state.calendarData.setValue(data);
}
function setTaskList(list) {
  state.taskList.setValue(list);
}
function setBarCurrentIndex(index) {
  state.barCurrentIndex.setValue(index);
}

// lib/process.ts
var GLib = imports.gi.GLib;
async function execAsync(cmd) {
  const command = Array.isArray(cmd) ? cmd.join(" ") : cmd;
  return new Promise((resolve, reject) => {
    try {
      const [success, stdout, stderr, exitStatus] = GLib.spawn_command_line_sync(command);
      if (success && exitStatus === 0) {
        const decoder = new TextDecoder("utf-8");
        const output = decoder.decode(stdout);
        resolve(output.trim());
      } else {
        const decoder = new TextDecoder("utf-8");
        const errOutput = stderr ? decoder.decode(stderr) : "Unknown error";
        reject(new Error(`Command failed: ${errOutput}`));
      }
    } catch (error) {
      reject(error);
    }
  });
}

// services/ThemeService.ts
import * as Utils from "resource:///com/github/Aylur/ags/utils.js";
import App from "resource:///com/github/Aylur/ags/app.js";
var ThemeService = class {
  async loadTheme() {
    const username = String(App.configDir).split("/")[2];
    const caelestiaPath = `/home/${username}/.local/state/caelestia/scheme.json`;
    const themeOutputPath = "/tmp/task-calendar-theme.css";
    const applyColors = async () => {
      try {
        const content = await execAsync(`cat ${caelestiaPath}`);
        const data = JSON.parse(typeof content === "string" ? content : String(content));
        const colors = data.colours;
        const bg = "#" + colors.background;
        const fg = "#" + colors.onBackground;
        const accent = "#" + (colors.secondary || colors.primary || "ffffff");
        const border = "#" + (colors.surfaceVariant || colors.outline || "333333");
        const isLight = data.mode === "light";
        const bg_secondary = isLight ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.03)";
        const hover_bg = isLight ? "rgba(0,0,0,0.09)" : "rgba(255,255,255,0.05)";
        const css = `
@define-color bg_primary ${bg};
@define-color bg_secondary ${bg_secondary};
@define-color text_primary ${accent};
@define-color text_muted ${fg};
@define-color accent_color ${accent};
@define-color border_color ${border};
@define-color hover_bg ${hover_bg};
@define-color star_active ${accent};
`;
        await Utils.writeFile(css, themeOutputPath);
        console.log("Caelestia theme synced to Calendar");
        App.resetCss();
        App.applyCss(themeOutputPath);
        App.applyCss(App.configDir + "/style.css");
      } catch (error) {
        console.warn("Could not sync with Caelestia theme:", error);
      }
    };
    await applyColors();
    try {
      Utils.monitorFile(caelestiaPath, () => {
        applyColors();
      });
    } catch (error) {
      console.warn("Could not establish monitor on wal cache.");
    }
  }
};

// services/BackendService.ts
var BIN_PATH = "~/QuickTasks/build/task-calendar";
var BackendService = class {
  buildCommand(args) {
    return [BIN_PATH, ...args].map((part) => {
      if (part.includes(" ") || part.includes('"')) {
        return `"${part.replace(/(["\\])/g, "\\$1")}"`;
      }
      return part;
    }).join(" ");
  }
  async execBackend(args) {
    const command = this.buildCommand(args);
    const stdout = await execAsync(command);
    const raw = typeof stdout === "string" ? stdout : String(stdout);
    const parsed = JSON.parse(raw);
    if (parsed.type === "error") {
      throw new Error(`${parsed.code}: ${parsed.message}`);
    }
    return parsed;
  }
  async getCalendar(monthYear) {
    const result = await this.execBackend(["get-calendar", "--month", monthYear]);
    if (result.type !== "calendar") {
      throw new Error("Unexpected backend response for get-calendar");
    }
    return result;
  }
  async getTaskList() {
    const result = await this.execBackend(["get-tasks"]);
    if (result.type !== "taskList") {
      throw new Error("Unexpected backend response for get-tasks");
    }
    return result;
  }
  async addTask(name, dueDate, monthYear) {
    const args = ["add-task", "--name", name, "--due", dueDate];
    if (monthYear) {
      args.push("--month", monthYear);
    }
    return this.execBackend(args);
  }
  async removeTask(id, monthYear) {
    const args = ["remove-task", "--id", id];
    if (monthYear) {
      args.push("--month", monthYear);
    }
    return this.execBackend(args);
  }
  async editTask(id, fields, monthYear) {
    const args = ["edit-task", "--id", id];
    if (fields.name !== void 0) {
      args.push("--name", fields.name);
    }
    if (fields.dueDate !== void 0) {
      args.push("--due", fields.dueDate);
    }
    if (fields.completed !== void 0) {
      args.push("--completed", fields.completed ? "true" : "false");
    }
    if (monthYear) {
      args.push("--month", monthYear);
    }
    return this.execBackend(args);
  }
  async setFeatured(id) {
    const result = await this.execBackend(["set-featured", "--id", id]);
    if (result.type !== "taskList") {
      throw new Error("Unexpected backend response for set-featured");
    }
    return result;
  }
};

// windows/CalendarWindow.ts
import Widget8 from "resource:///com/github/Aylur/ags/widget.js";

// components/calendar/CalendarWidget.ts
import Widget7 from "resource:///com/github/Aylur/ags/widget.js";

// components/calendar/CalendarHeader.ts
import Widget from "resource:///com/github/Aylur/ags/widget.js";
var backend = new BackendService();
var CalendarHeader = () => Widget.Box({
  className: "calendar-header",
  spacing: 12,
  children: [
    Widget.Button({
      className: "calendar-nav-button",
      label: "\u25C0",
      onClicked: () => {
        const parts = state.currentMonthYear.value.split("/");
        const date = new Date(Number(parts[1]), Number(parts[0]) - 2, 1);
        const nextValue = `${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
        state.currentMonthYear.setValue(nextValue);
        backend.getCalendar(nextValue).then((c) => state.calendarData.setValue(c));
      }
    }),
    Widget.Label({
      className: "calendar-title",
      label: state.currentMonthYear.bind(),
      xalign: 0.5,
      hexpand: true,
      css: "font-weight: bold; font-size: 18px;"
    }),
    Widget.Button({
      className: "calendar-nav-button",
      label: "\u25B6",
      onClicked: () => {
        const parts = state.currentMonthYear.value.split("/");
        const date = new Date(Number(parts[1]), Number(parts[0]), 1);
        const nextValue = `${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
        state.currentMonthYear.setValue(nextValue);
        backend.getCalendar(nextValue).then((c) => state.calendarData.setValue(c));
      }
    })
  ]
});

// components/calendar/CalendarGrid.ts
import Widget6 from "resource:///com/github/Aylur/ags/widget.js";

// components/calendar/CalendarCellWidget.ts
import Widget5 from "resource:///com/github/Aylur/ags/widget.js";

// components/calendar/TaskChip.ts
import Widget3 from "resource:///com/github/Aylur/ags/widget.js";

// components/calendar/EditTaskDialog.ts
import Widget2 from "resource:///com/github/Aylur/ags/widget.js";
import Variable2 from "resource:///com/github/Aylur/ags/variable.js";
var backend2 = new BackendService();
var editDialogVisible = Variable2(false);
var currentEditId = "";
var currentEditNameInput = null;
var currentEditDueInput = null;
var currentEditErrorLabel = null;
function showEditTaskDialog(id, name, date) {
  currentEditId = id;
  if (currentEditNameInput) currentEditNameInput.text = name;
  if (currentEditDueInput) currentEditDueInput.text = date;
  if (currentEditErrorLabel) currentEditErrorLabel.label = "";
  editDialogVisible.setValue(true);
}
var EditTaskDialog = () => {
  currentEditErrorLabel = Widget2.Label({ label: "", className: "dialog-error" });
  currentEditNameInput = Widget2.Entry({ placeholder_text: "Nombre de la tarea", hexpand: true });
  currentEditDueInput = Widget2.Entry({ placeholder_text: "DD/MM/YYYY", hexpand: true });
  return Widget2.Box({
    vertical: true,
    className: "add-task-dialog",
    spacing: 12,
    visible: editDialogVisible.bind(),
    children: [
      Widget2.Label({ label: "Editar tarea", className: "dialog-title" }),
      currentEditNameInput,
      currentEditDueInput,
      currentEditErrorLabel,
      Widget2.Box({
        spacing: 8,
        halign: 3,
        // ALIGN_END
        children: [
          Widget2.Button({
            label: "Cancelar",
            onClicked: () => {
              editDialogVisible.setValue(false);
            }
          }),
          Widget2.Button({
            label: "Guardar",
            className: "bar-toggle-button",
            onClicked: async () => {
              const name = currentEditNameInput.text?.trim();
              const due = currentEditDueInput.text?.trim();
              if (!name || !due) {
                currentEditErrorLabel.label = "Completa nombre y fecha.";
                return;
              }
              try {
                const mode = state.currentMonthYear.value;
                await backend2.editTask(currentEditId, { name, dueDate: due }, mode);
                const cal = await backend2.getCalendar(mode);
                state.calendarData.setValue(cal);
                editDialogVisible.setValue(false);
              } catch (e) {
                currentEditErrorLabel.label = String(e);
              }
            }
          })
        ]
      })
    ]
  });
};

// components/calendar/TaskChip.ts
var backend3 = new BackendService();
var TaskChip = (task) => Widget3.Box({
  className: task.isFeatured ? "task-chip task-chip-featured" : "task-chip",
  spacing: 2,
  children: [
    Widget3.Button({
      className: "task-chip-checkbox",
      label: task.completed ? "\u25CF" : "\u25CB",
      onClicked: async () => {
        await backend3.editTask(task.id, { completed: !task.completed }, state.currentMonthYear.value);
        backend3.getCalendar(state.currentMonthYear.value).then((c) => state.calendarData.setValue(c));
      }
    }),
    Widget3.Label({
      label: task.name,
      xalign: 0,
      wrap: true,
      hexpand: true,
      css: task.completed ? "font-size: 11px; text-decoration: line-through; opacity: 0.6;" : "font-size: 11px;"
    }),
    Widget3.Button({
      className: "task-chip-star",
      label: task.isFeatured ? "\u2726" : "\u2727",
      onClicked: async () => {
        await backend3.setFeatured(task.id);
        backend3.getCalendar(state.currentMonthYear.value).then((c) => {
          state.calendarData.setValue(c);
          state.featuredTaskId.setValue(c.featuredTaskId);
        });
        backend3.getTaskList().then((lst) => {
          state.taskList.setValue(lst);
          const idx = lst.tasks.findIndex((t) => t.id === task.id);
          if (idx !== -1) {
            state.barCurrentIndex.setValue(idx);
          }
        });
      }
    }),
    Widget3.Button({
      className: "task-chip-star",
      label: "\u270E",
      onClicked: () => {
        showEditTaskDialog(task.id, task.name, task.dueDate);
      }
    }),
    Widget3.Button({
      className: "task-chip-delete",
      label: "\xD7",
      onClicked: async () => {
        await backend3.removeTask(task.id, state.currentMonthYear.value);
        backend3.getCalendar(state.currentMonthYear.value).then((c) => state.calendarData.setValue(c));
      }
    })
  ]
});

// components/calendar/AddTaskDialog.ts
import Widget4 from "resource:///com/github/Aylur/ags/widget.js";
import Variable3 from "resource:///com/github/Aylur/ags/variable.js";
var backend4 = new BackendService();
var dialogVisible = Variable3(false);
var currentDueInput = null;
var currentNameInput = null;
var currentErrorLabel = null;
function showAddTaskDialog(date) {
  if (currentDueInput) currentDueInput.text = date;
  if (currentNameInput) currentNameInput.text = "";
  if (currentErrorLabel) currentErrorLabel.label = "";
  dialogVisible.setValue(true);
}
var AddTaskDialog = () => {
  currentErrorLabel = Widget4.Label({ label: "", className: "dialog-error" });
  currentNameInput = Widget4.Entry({ placeholder_text: "Nombre de la tarea", hexpand: true });
  currentDueInput = Widget4.Entry({ placeholder_text: "DD/MM/YYYY", hexpand: true });
  return Widget4.Box({
    vertical: true,
    className: "add-task-dialog",
    spacing: 12,
    visible: dialogVisible.bind(),
    children: [
      Widget4.Label({ label: "Nueva tarea", className: "dialog-title" }),
      currentNameInput,
      currentDueInput,
      currentErrorLabel,
      Widget4.Box({
        spacing: 8,
        halign: 3,
        // ALIGN_END
        children: [
          Widget4.Button({
            label: "Cancelar",
            onClicked: () => {
              dialogVisible.setValue(false);
            }
          }),
          Widget4.Button({
            label: "Agregar",
            className: "bar-toggle-button",
            onClicked: async () => {
              const name = currentNameInput.text?.trim();
              const due = currentDueInput.text?.trim();
              if (!name || !due) {
                currentErrorLabel.label = "Completa nombre y fecha.";
                return;
              }
              try {
                const mode = state.currentMonthYear.value;
                await backend4.addTask(name, due, mode);
                const cal = await backend4.getCalendar(mode);
                state.calendarData.setValue(cal);
                dialogVisible.setValue(false);
              } catch (e) {
                currentErrorLabel.label = String(e);
              }
            }
          })
        ]
      })
    ]
  });
};

// components/calendar/CalendarCellWidget.ts
var CalendarCellWidget = (cell) => {
  return Widget5.EventBox({
    onHover: (self) => {
      self.child.toggleClassName("calendar-cell-hovered", true);
    },
    onHoverLost: (self) => {
      self.child.toggleClassName("calendar-cell-hovered", false);
    },
    child: Widget5.Box({
      vertical: true,
      className: cell.isCurrentMonth ? "calendar-cell" : "calendar-cell calendar-day-muted",
      spacing: 2,
      children: [
        Widget5.Box({
          spacing: 2,
          children: [
            Widget5.Label({
              label: String(cell.day),
              className: "calendar-day",
              hexpand: true,
              xalign: 0
            }),
            Widget5.Button({
              label: "+",
              className: "calendar-add-button",
              onClicked: () => {
                showAddTaskDialog(`${String(cell.day).padStart(2, "0")}/${state.currentMonthYear.value}`);
              }
            })
          ]
        }),
        Widget5.Scrollable({
          vscroll: "automatic",
          hscroll: "never",
          vexpand: true,
          child: Widget5.Box({
            vertical: true,
            spacing: 2,
            children: cell.tasks.map((t) => TaskChip(t))
          })
        })
      ]
    })
  });
};

// components/calendar/CalendarGrid.ts
var CalendarGrid = () => Widget6.Box({
  vertical: true,
  className: "calendar-grid",
  spacing: 8,
  setup: (self) => self.hook(state.calendarData, () => {
    const cal = state.calendarData.value;
    if (!cal || !cal.cells) return;
    const dayNames = ["L", "M", "X", "J", "V", "S", "D"];
    const headerRow = Widget6.Box({
      spacing: 8,
      className: "calendar-grid-header",
      children: dayNames.map((day) => Widget6.Label({ label: day, className: "calendar-header-cell", hexpand: true }))
    });
    const children = [headerRow];
    for (let row = 0; row < 6; row++) {
      const rowBox = Widget6.Box({ spacing: 8, homogeneous: true });
      for (let col = 0; col < 7; col++) {
        const idx = row * 7 + col;
        if (cal.cells[idx]) {
          rowBox.children = [...rowBox.children, CalendarCellWidget(cal.cells[idx])];
        }
      }
      children.push(rowBox);
    }
    self.children = children;
  })
});

// components/calendar/CalendarWidget.ts
var backend5 = new BackendService();
var CalendarWidget = () => Widget7.Box({
  vertical: true,
  spacing: 12,
  margin: 16,
  children: [
    CalendarHeader(),
    Widget7.Button({
      label: "Cambiar a barra",
      className: "bar-toggle-button",
      onClicked: async () => {
        const list = await backend5.getTaskList();
        state.taskList.setValue(list);
        toggleMode();
      }
    }),
    CalendarGrid(),
    AddTaskDialog(),
    EditTaskDialog()
  ]
});

// windows/CalendarWindow.ts
var CalendarWindow = Widget8.Window({
  name: "calendar",
  className: "calendar",
  layer: "top",
  exclusivity: "exclusive",
  anchor: [],
  margins: [10, 10],
  visible: state.mode.value === "calendar",
  keymode: "on-demand",
  css: "background-color: transparent;",
  setup: (self) => self.hook(state.mode, () => {
    self.visible = state.mode.value === "calendar";
  }),
  child: Widget8.Box({
    className: "calendar-window",
    vertical: true,
    child: CalendarWidget()
  })
});

// windows/BarWindow.ts
import Widget12 from "resource:///com/github/Aylur/ags/widget.js";

// components/bar/BarWidget.ts
import Widget11 from "resource:///com/github/Aylur/ags/widget.js";

// components/bar/BarNavButtons.ts
import Widget9 from "resource:///com/github/Aylur/ags/widget.js";
var backend6 = new BackendService();
var BarPrevButton = () => Widget9.Button({
  label: "\u25C0",
  className: "bar-nav-button",
  onClicked: async () => {
    const list = state.taskList.value?.tasks || [];
    const current = state.barCurrentIndex.value;
    if (list.length === 0) return;
    let prev = current - 1;
    if (prev < 0) prev = list.length - 1;
    state.barCurrentIndex.setValue(prev);
    const task = list[prev];
    if (task) {
      await backend6.setFeatured(task.id);
      state.featuredTaskId.setValue(task.id);
    }
  }
});
var BarNextButton = () => Widget9.Button({
  label: "\u25B6",
  className: "bar-nav-button",
  onClicked: async () => {
    const list = state.taskList.value?.tasks || [];
    const current = state.barCurrentIndex.value;
    if (list.length === 0) return;
    let next = (current + 1) % list.length;
    state.barCurrentIndex.setValue(next);
    const task = list[next];
    if (task) {
      await backend6.setFeatured(task.id);
      state.featuredTaskId.setValue(task.id);
    }
  }
});

// components/bar/BarTaskDisplay.ts
import Widget10 from "resource:///com/github/Aylur/ags/widget.js";
var backend7 = new BackendService();
var BarTaskDisplay = () => Widget10.Box({
  className: "bar-task-display",
  spacing: 10,
  hexpand: true,
  setup: (self) => {
    const updateTask = () => {
      const list = state.taskList.value?.tasks || [];
      const currentIndex = state.barCurrentIndex.value || 0;
      const task = list[currentIndex];
      if (!task) {
        self.children = [Widget10.Label("No hay tareas")];
        return;
      }
      self.children = [
        Widget10.Button({
          className: "task-chip-checkbox",
          label: task.completed ? "\u25CF" : "\u25CB",
          onClicked: async () => {
            await backend7.editTask(task.id, { completed: !task.completed });
            const newTasks = await backend7.getTaskList();
            state.taskList.setValue(newTasks);
            const nextUncompleted = newTasks.tasks.findIndex((t) => !t.completed);
            if (nextUncompleted !== -1) {
              state.barCurrentIndex.setValue(nextUncompleted);
              await backend7.setFeatured(newTasks.tasks[nextUncompleted].id);
            }
          }
        }),
        Widget10.Box({
          vertical: true,
          hexpand: true,
          children: [
            Widget10.Label({
              label: task.name,
              className: "bar-task-name",
              xalign: 0,
              truncate: "end",
              css: task.completed ? "text-decoration: line-through; opacity: 0.6;" : ""
            }),
            Widget10.Label({
              label: task.dueDate,
              className: "bar-task-due",
              xalign: 0
            })
          ]
        })
      ];
    };
    self.hook(state.taskList, updateTask);
    self.hook(state.barCurrentIndex, updateTask);
  }
});

// components/bar/BarWidget.ts
var backend8 = new BackendService();
var BarWidget = () => Widget11.Box({
  className: "bar-root",
  spacing: 12,
  children: [
    BarPrevButton(),
    Widget11.Label({ label: "\u2726", className: "bar-star" }),
    BarTaskDisplay(),
    Widget11.Button({
      label: "Calendario",
      className: "bar-toggle-button",
      onClicked: async () => {
        const cal = await backend8.getCalendar(state.currentMonthYear.value);
        state.calendarData.setValue(cal);
        toggleMode();
      }
    }),
    BarNextButton()
  ]
});

// windows/BarWindow.ts
var BarWindow = Widget12.Window({
  name: "bar",
  className: "bar",
  layer: "bottom",
  exclusivity: "exclusive",
  anchor: ["top", "left", "right"],
  margins: [20, 20, -10, 70],
  visible: state.mode.value === "bar",
  keymode: "on-demand",
  css: "background-color: transparent;",
  setup: (self) => self.hook(state.mode, () => {
    self.visible = state.mode.value === "bar";
  }),
  child: Widget12.Box({
    className: "bar-window",
    child: BarWidget()
  })
});

// app.ts
import App2 from "resource:///com/github/Aylur/ags/app.js";
var backend9 = new BackendService();
var themeService = new ThemeService();
async function initData() {
  try {
    console.log("Starting theme service initialization...");
    await themeService.loadTheme().catch(() => console.log("Tema ignorado."));
    setCurrentMonthYear("04/2026");
    console.log("Fetching calendar and task data...");
    const [calendar, taskList] = await Promise.all([
      backend9.getCalendar(state.currentMonthYear.value || "04/2026"),
      backend9.getTaskList()
    ]);
    console.log("Data fetched, updating state...");
    setCalendarData(calendar);
    setTaskList(taskList);
    setFeaturedTaskId(calendar.featuredTaskId ?? taskList.featuredTaskId ?? null);
    setBarCurrentIndex(0);
    console.log("Task Calendar initialized successfully");
  } catch (error) {
    console.error("Initialization failed:", error);
  }
}
initData();
App2.config({
  windows: [
    CalendarWindow,
    BarWindow
  ]
});
