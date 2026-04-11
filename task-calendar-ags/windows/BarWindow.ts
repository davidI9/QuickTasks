import { Window } from "ags";
import { AppState } from "../state/AppState";
import { BackendService } from "../services/BackendService";
import { createBarWidget } from "../components/bar/BarWidget";

export function createBarWindow(state: AppState, backend: BackendService): Window {
    const content = createBarWidget(state, backend);

    const window = new Window({
        title: "QuickTasks - Barra",
        width: 820,
        height: 160,
        resizable: false,
        visible: state.mode.value === "bar",
    });

    window.setChild(content);
    return window;
}
