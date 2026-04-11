import { Widget } from "ags";
import { AppState } from "../../state/AppState";
import { BackendService } from "../../services/BackendService";
import { TaskItem } from "../../types/TaskListJSON";

export function createTaskChip(task: TaskItem, state: AppState, backend: BackendService, monthYear: string): Widget.Box {
    const row = new Widget.Box({ orientation: "horizontal", spacing: 6, cssClasses: ["task-chip"] });
    const checkbox = new Widget.Button({ label: task.completed ? "☑" : "☐", cssClasses: ["task-chip-checkbox"] });
    const nameLabel = new Widget.Label({ label: task.name, xalign: 0, wrap: false, ellipsize: "end", cssClasses: [task.isFeatured ? "task-chip-featured" : ""] });
    const starButton = new Widget.Button({ label: task.isFeatured ? "★" : "☆", cssClasses: ["task-chip-star"] });
    const deleteButton = new Widget.Button({ label: "🗑", cssClasses: ["task-chip-delete"] });

    checkbox.on("clicked", async () => {
        await backend.editTask(task.id, { completed: !task.completed }, monthYear);
        await backend.getCalendar(monthYear).then((calendar) => state.calendarData.set(calendar));
    });

    starButton.on("clicked", async () => {
        await backend.setFeatured(task.id);
        const calendar = await backend.getCalendar(monthYear);
        state.calendarData.set(calendar);
        state.featuredTaskId.set(calendar.featuredTaskId);
    });

    deleteButton.on("clicked", async () => {
        await backend.removeTask(task.id, monthYear);
        const calendar = await backend.getCalendar(monthYear);
        state.calendarData.set(calendar);
    });

    row.append(checkbox);
    row.append(nameLabel, { expand: true });
    row.append(starButton);
    row.append(deleteButton);
    return row;
}
