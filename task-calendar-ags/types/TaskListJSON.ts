export interface TaskItem {
    id: string;
    name: string;
    dueDate: string;
    completed: boolean;
    isFeatured: boolean;
}

export interface TaskListJSON {
    type: "taskList";
    featuredTaskId: string | null;
    tasks: TaskItem[];
}
