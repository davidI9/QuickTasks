import { Widget } from "ags";
import { AppState } from "../../state/AppState";
import { BackendService } from "../../services/BackendService";
import { createCalendarHeader } from "./CalendarHeader";
import { createCalendarGrid } from "./CalendarGrid";
import { createAddTaskDialog } from "./AddTaskDialog";

export function createCalendarWidget(state: AppState, backend: BackendService): Widget.Box {
    const root = new Widget.Box({ orientation: "vertical", spacing: 12, margin: 16 });
    const header = createCalendarHeader(state, backend);
    const calendarGrid = createCalendarGrid(state, backend);
    const addDialog = createAddTaskDialog(state, backend);

    const toggleButton = new Widget.Button({ label: "Cambiar a barra" });
    toggleButton.on("clicked", () => state.toggleMode());

    root.append(header);
    root.append(toggleButton);
    root.append(calendarGrid, { expand: true });
    root.append(addDialog);

    return root;
}
