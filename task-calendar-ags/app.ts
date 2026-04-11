import { AppState } from "./state/AppState";
import { ThemeService } from "./services/ThemeService";
import { BackendService } from "./services/BackendService";
import { createCalendarWindow } from "./windows/CalendarWindow";
import { createBarWindow } from "./windows/BarWindow";

const state = AppState.instance;
const backend = new BackendService();
const themeService = new ThemeService();

async function initialize(): Promise<void> {
    await themeService.loadTheme();
    await themeService.injectCssVariables();

    const calendarWindow = createCalendarWindow(state, backend);
    const barWindow = createBarWindow(state, backend);

    state.mode.onChange((mode: "calendar" | "bar") => {
        calendarWindow.visible = mode === "calendar";
        barWindow.visible = mode === "bar";
    });

    state.currentMonthYear.onChange(async (monthYear: string) => {
        if (state.mode.value === "calendar") {
            try {
                const calendar = await backend.getCalendar(monthYear);
                state.calendarData.set(calendar);
                state.featuredTaskId.set(calendar.featuredTaskId);
            } catch (error) {
                state.error.set(error instanceof Error ? error.message : String(error));
            }
        }
    });

    state.mode.set("calendar");
    state.currentMonthYear.set("04/2026");
    await Promise.all([backend.getCalendar(state.currentMonthYear.value), backend.getTaskList()])
        .then(([calendar, taskList]) => {
            state.calendarData.set(calendar);
            state.taskList.set(taskList);
            state.featuredTaskId.set(calendar.featuredTaskId ?? taskList.featuredTaskId);
            state.barCurrentIndex.set(0);
        })
        .catch((error) => {
            state.error.set(error instanceof Error ? error.message : String(error));
        });
}

initialize().catch((error) => {
    console.error(error);
});
