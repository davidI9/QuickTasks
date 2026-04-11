import { Widget } from "ags";
import { AppState } from "../../state/AppState";
import { BackendService } from "../../services/BackendService";
import { TaskItem } from "../../types/TaskListJSON";

function currentTask(state: AppState): TaskItem | null {
    const list = state.taskList.value;
    if (!list || list.tasks.length === 0) {
        return null;
    }
    const visibleTasks = list.tasks.filter((task: TaskItem) => !task.completed);
    if (visibleTasks.length === 0) {
        return null;
    }
    const featured = state.featuredTaskId.value;
    if (featured) {
        const found = visibleTasks.find((task: TaskItem) => task.id === featured);
        if (found) {
            const index = visibleTasks.findIndex((task: TaskItem) => task.id === featured);
            state.barCurrentIndex.set(index);
            return found;
        }
    }
    const currentIndex = state.barCurrentIndex.value;
    if (currentIndex >= 0 && currentIndex < visibleTasks.length) {
        return visibleTasks[currentIndex];
    }
    state.barCurrentIndex.set(0);
    return visibleTasks[0];
}

export function createBarTaskDisplay(state: AppState, backend: BackendService): Widget.Box {
    const container = new Widget.Box({ orientation: "vertical", spacing: 6, cssClasses: ["bar-task-display"], hexpand: true });
    const nameLabel = new Widget.Label({ label: "Cargando...", xalign: 0, cssClasses: ["bar-task-name"] });
    const dueLabel = new Widget.Label({ label: "", xalign: 0, cssClasses: ["bar-task-due"] });
    const toggleButton = new Widget.Button({ label: "Marcar" });

    function render(): void {
        const task = currentTask(state);
        if (!task) {
            nameLabel.label = "No hay tareas";
            dueLabel.label = "";
            toggleButton.sensitive = false;
            return;
        }
        nameLabel.label = task.name;
        nameLabel.cssClasses = ["bar-task-name"];
        if (task.name.length > 30) {
            nameLabel.cssClasses.push("bar-task-name-marquee");
        }
        dueLabel.label = `Vence: ${task.dueDate}`;
        toggleButton.label = task.completed ? "Desmarcar" : "Marcar";
        toggleButton.sensitive = true;
    }

    toggleButton.on("clicked", async () => {
        const task = currentTask(state);
        if (!task) {
            return;
        }
        await backend.editTask(task.id, { completed: !task.completed });
        const list = await backend.getTaskList();
        state.taskList.set(list);
        state.featuredTaskId.set(list.featuredTaskId);
    });

    state.taskList.onChange(render);
    state.featuredTaskId.onChange(render);

    container.append(nameLabel);
    container.append(dueLabel);
    container.append(toggleButton);

    render();
    return container;
}
