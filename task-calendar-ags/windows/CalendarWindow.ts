import { Window, Widget } from "ags";
import { AppState } from "../state/AppState";
import { BackendService } from "../services/BackendService";
import { createCalendarWidget } from "../components/calendar/CalendarWidget";

export function createCalendarWindow(state: AppState, backend: BackendService): Window {
    const content = createCalendarWidget(state, backend);

    const window = new Window({
        title: "QuickTasks - Calendario",
        width: 960,
        height: 720,
        resizable: true,
        visible: state.mode.value === "calendar",
    });

    window.setChild(content);
    return window;
}
