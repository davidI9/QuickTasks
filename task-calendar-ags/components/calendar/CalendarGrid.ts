import { Widget } from "ags";
import { AppState } from "../../state/AppState";
import { BackendService } from "../../services/BackendService";
import { CalendarJSON } from "../../types/CalendarJSON";
import { createCalendarCellWidget } from "./CalendarCellWidget";

export function createCalendarGrid(state: AppState, backend: BackendService): Widget.Box {
    const grid = new Widget.Box({ orientation: "vertical", spacing: 8, cssClasses: ["calendar-grid"] });
    const dayNames = ["L", "M", "X", "J", "V", "S", "D"];

    function render(calendar: CalendarJSON): void {
        while (grid.children.length > 0) {
            grid.remove(grid.children[0]);
        }

        const headerRow = new Widget.Box({ orientation: "horizontal", spacing: 8, cssClasses: ["calendar-grid-header"] });
        for (const dayName of dayNames) {
            headerRow.append(new Widget.Label({ label: dayName, cssClasses: ["calendar-header-cell"] }));
        }
        grid.append(headerRow);

        for (let row = 0; row < 6; row += 1) {
            const rowBox = new Widget.Box({ orientation: "horizontal", spacing: 8 });
            for (let col = 0; col < 7; col += 1) {
                const index = row * 7 + col;
                const cell = calendar.cells[index];
                rowBox.append(createCalendarCellWidget(cell, state, backend, calendar.monthYear));
            }
            grid.append(rowBox);
        }
    }

    state.calendarData.onChange((calendar: CalendarJSON | null) => {
        if (calendar) {
            render(calendar);
        }
    });

    if (state.calendarData.value) {
        render(state.calendarData.value);
    }

    return grid;
}
