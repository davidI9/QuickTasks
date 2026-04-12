import { state, setError, setCalendarData, setTaskList, setFeaturedTaskId, setBarCurrentIndex, setCurrentMonthYear } from "./state/AppState.ts";
import { ThemeService } from "./services/ThemeService.ts";
import { BackendService } from "./services/BackendService.ts";
import { CalendarWindow } from "./windows/CalendarWindow.ts";
import { BarWindow } from "./windows/BarWindow.ts";

const backend = new BackendService();
const themeService = new ThemeService();

async function initData() {
    try {
        console.log("Starting theme service initialization...");
        await themeService.loadTheme().catch(() => console.log("Tema ignorado."));
        
        setCurrentMonthYear("04/2026");
        console.log("Fetching calendar and task data...");
        const [calendar, taskList] = await Promise.all([
            backend.getCalendar(state.currentMonthYear.value || "04/2026"),
            backend.getTaskList()
        ]);
        console.log("Data fetched, updating state...");

        setCalendarData(calendar);
        setTaskList(taskList);
        setFeaturedTaskId(calendar.featuredTaskId ?? taskList.featuredTaskId ?? null);
        setBarCurrentIndex(0);

        console.log("Task Calendar initialized successfully");
    } catch (error) {
        console.error("Initialization failed:", error);
    }
}

// Arrancamos la carga de datos en segundo plano
initData();

// LA MAGIA: Simplemente exportamos la configuración por defecto y AGS hace el resto.
// Esto evita tener que importar "App" y romper GJS.
import App from 'resource:///com/github/Aylur/ags/app.js';

App.config({
    windows: [
        CalendarWindow,
        BarWindow
    ]
});