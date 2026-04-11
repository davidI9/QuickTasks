import { Variable } from "ags";
import { CalendarJSON } from "../types/CalendarJSON";
import { TaskListJSON } from "../types/TaskListJSON";

export class AppState {
    static instance = new AppState();

    mode = new Variable<"calendar" | "bar">("calendar");
    currentMonthYear = new Variable<string>("04/2026");
    calendarData = new Variable<CalendarJSON | null>(null);
    taskList = new Variable<TaskListJSON | null>(null);
    featuredTaskId = new Variable<string | null>(null);
    barCurrentIndex = new Variable<number>(0);
    loading = new Variable<boolean>(false);
    error = new Variable<string | null>(null);

    toggleMode(): void {
        this.mode.set(this.mode.value === "calendar" ? "bar" : "calendar");
    }

    setFeaturedTaskId(id: string | null): void {
        this.featuredTaskId.set(id);
    }
}
