import { Widget } from "ags";
import { AppState } from "../../state/AppState";
import { BackendService } from "../../services/BackendService";
import { CalendarCell } from "../../types/CalendarJSON";
import { createTaskChip } from "./TaskChip";
import { showAddTaskDialog } from "./AddTaskDialog";

export function createCalendarCellWidget(cell: CalendarCell, state: AppState, backend: BackendService, monthYear: string): Widget.Box {
    const card = new Widget.Box({ orientation: "vertical", spacing: 6, cssClasses: ["calendar-cell"] });
    const dayLabel = new Widget.Label({ label: String(cell.day), cssClasses: [cell.isCurrentMonth ? "calendar-day" : "calendar-day-muted"] });
    const tasksBox = new Widget.Box({ orientation: "vertical", spacing: 3 });
    const actions = new Widget.Box({ orientation: "horizontal", spacing: 4, cssClasses: ["calendar-cell-actions"] });
    const addButton = new Widget.Button({ label: "+", cssClasses: ["calendar-add-button"] });

    for (const task of cell.tasks) {
        tasksBox.append(createTaskChip(task, state, backend, monthYear));
    }

    addButton.on("clicked", () => {
        showAddTaskDialog(`${String(cell.day).padStart(2, "0")}/${monthYear}`);
    });
    actions.append(addButton);

    card.append(dayLabel);
    card.append(actions);
    card.append(tasksBox);

    card.on("enter-notify-event", () => {
        card.cssClasses = [...(card.cssClasses || []), "calendar-cell-hovered"];
        addButton.visible = true;
    });
    card.on("leave-notify-event", () => {
        card.cssClasses = (card.cssClasses || []).filter((cls: string) => cls !== "calendar-cell-hovered");
        addButton.visible = false;
    });

    addButton.visible = false;
    return card;
}
