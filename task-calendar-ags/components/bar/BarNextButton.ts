import { Widget } from "ags";
import { AppState } from "../../state/AppState";
import { BackendService } from "../../services/BackendService";
import { TaskItem } from "../../types/TaskListJSON";

function findVisibleTasks(taskList: TaskItem[] | null): TaskItem[] {
    return taskList ? taskList.filter((task) => !task.completed) : [];
}

export function createBarNextButton(state: AppState, backend: BackendService): Widget.Button {
    const button = new Widget.Button({ label: "▶", cssClasses: ["bar-nav-button"] });
    button.on("clicked", async () => {
        const tasks = findVisibleTasks(state.taskList.value?.tasks ?? null);
        if (tasks.length === 0) {
            return;
        }
        const currentId = state.featuredTaskId.value;
        const currentIndex = tasks.findIndex((task) => task.id === currentId);
        const nextIndex = currentIndex === tasks.length - 1 ? 0 : currentIndex + 1;
        const nextTask = tasks[nextIndex];
        if (nextTask) {
            const list = await backend.setFeatured(nextTask.id);
            state.taskList.set(list);
            state.featuredTaskId.set(nextTask.id);
            state.barCurrentIndex.set(nextIndex);
        }
    });
    return button;
}
