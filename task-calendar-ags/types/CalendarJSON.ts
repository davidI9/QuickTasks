import { TaskItem } from "./TaskListJSON";

export interface CalendarCell {
    day: number;
    isCurrentMonth: boolean;
    isPast: boolean;
    tasks: TaskItem[];
}

export interface CalendarJSON {
    type: "calendar";
    monthYear: string;
    featuredTaskId: string | null;
    cells: CalendarCell[];
}
