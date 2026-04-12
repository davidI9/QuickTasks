import { state } from "../../state/AppState.ts";
import Widget from 'resource:///com/github/Aylur/ags/widget.js';
import { BackendService } from "../../services/BackendService.ts";

const backend = new BackendService();

export const BarPrevButton = () => Widget.Button({
    label: "◀",
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
            await backend.setFeatured(task.id);
            state.featuredTaskId.setValue(task.id);
        }
    }
});

export const BarNextButton = () => Widget.Button({
    label: "▶",
    className: "bar-nav-button",
    onClicked: async () => {
        const list = state.taskList.value?.tasks || [];
        const current = state.barCurrentIndex.value;
        if (list.length === 0) return;
        let next = (current + 1) % list.length;
        state.barCurrentIndex.setValue(next);
        const task = list[next];
        if (task) {
            await backend.setFeatured(task.id);
            state.featuredTaskId.setValue(task.id);
        }
    }
});
