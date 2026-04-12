import { state } from "../../state/AppState.ts";
import Widget from 'resource:///com/github/Aylur/ags/widget.js';
import { BackendService } from "../../services/BackendService.ts";

const backend = new BackendService();

export const BarTaskDisplay = () => Widget.Box({
    className: "bar-task-display",
    spacing: 10,
    hexpand: true,
    setup: self => {
        const updateTask = () => {
            const list = state.taskList.value?.tasks || [];
            const currentIndex = state.barCurrentIndex.value || 0;
            const task = list[currentIndex];

            if (!task) {
                self.children = [Widget.Label("There are no tasks to display.")];
                return;
            }

            self.children = [
                Widget.Button({
                    className: "task-chip-checkbox",
                    label: task.completed ? "●" : "○",
                    onClicked: async () => {
                        await backend.editTask(task.id, { completed: !task.completed });
                        const newTasks = await backend.getTaskList();
                        state.taskList.setValue(newTasks);
                        
                        const nextUncompleted = newTasks.tasks.findIndex((t: any) => !t.completed);
                        if (nextUncompleted !== -1) {
                            state.barCurrentIndex.setValue(nextUncompleted);
                            await backend.setFeatured(newTasks.tasks[nextUncompleted].id);
                        }
                    }
                }),
                Widget.Box({
                    vertical: true,
                    hexpand: true,
                    children: [
                        Widget.Label({
                            label: task.name,
                            className: "bar-task-name",
                            xalign: 0,
                            truncate: "end",
                            css: task.completed ? "text-decoration: line-through; opacity: 0.6;" : ""
                        }),
                        Widget.Label({
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
