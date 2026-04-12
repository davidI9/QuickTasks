import { state } from "../../state/AppState.ts";
import Widget from 'resource:///com/github/Aylur/ags/widget.js';
import { BackendService } from "../../services/BackendService.ts";
import { TaskItem, CalendarCell } from "../../types/CalendarJSON.ts";
import { showEditTaskDialog } from "./EditTaskDialog.ts";

const backend = new BackendService();

export const TaskChip = (task: TaskItem) => Widget.Box({
    className: task.isFeatured ? "task-chip task-chip-featured" : "task-chip",
    spacing: 2,
    children: [
        Widget.Button({
            className: "task-chip-checkbox",
            label: task.completed ? "●" : "○",
            onClicked: async () => {
                await backend.editTask(task.id, { completed: !task.completed }, state.currentMonthYear.value);
                backend.getCalendar(state.currentMonthYear.value).then(c => state.calendarData.setValue(c));
            }
        }),
        Widget.Label({
            label: task.name,
            xalign: 0,
            wrap: true,
            hexpand: true,
            css: task.completed ? "font-size: 11px; text-decoration: line-through; opacity: 0.6;" : "font-size: 11px;"
        }),
        Widget.Button({
            className: "task-chip-star",
            label: task.isFeatured ? "✦" : "✧",
            onClicked: async () => {
                await backend.setFeatured(task.id);
                backend.getCalendar(state.currentMonthYear.value).then(c => {
                    state.calendarData.setValue(c);
                    state.featuredTaskId.setValue(c.featuredTaskId);
                });
                backend.getTaskList().then(lst => {
                    state.taskList.setValue(lst);
                    const idx = lst.tasks.findIndex((t: any) => t.id === task.id);
                    if (idx !== -1) {
                        state.barCurrentIndex.setValue(idx);
                    }
                });
            }
        }),
        Widget.Button({
            className: "task-chip-star",
            label: "✎",
            onClicked: () => {
                showEditTaskDialog(task.id, task.name, task.dueDate);
            }
        }),
        Widget.Button({
            className: "task-chip-delete",
            label: "×",
            onClicked: async () => {
                await backend.removeTask(task.id, state.currentMonthYear.value);
                backend.getCalendar(state.currentMonthYear.value).then(c => state.calendarData.setValue(c));
            }
        })
    ]
});
