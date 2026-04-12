import { state } from "../../state/AppState.ts";
import Widget from 'resource:///com/github/Aylur/ags/widget.js';
import { CalendarCellWidget } from "./CalendarCellWidget.ts";

export const CalendarGrid = () => Widget.Box({
    vertical: true,
    className: "calendar-grid",
    spacing: 8,
    setup: self => self.hook(state.calendarData, () => {
        const cal = state.calendarData.value;
        if (!cal || !cal.cells) return;
        const dayNames = ["L", "M", "X", "J", "V", "S", "D"];
        const headerRow = Widget.Box({
            spacing: 8,
            className: "calendar-grid-header",
            children: dayNames.map(day => Widget.Label({ label: day, className: "calendar-header-cell", hexpand: true }))
        });
        
        const children = [headerRow];
        for (let row = 0; row < 6; row++) {
            const rowBox = Widget.Box({ spacing: 8, homogeneous: true });
            for (let col = 0; col < 7; col++) {
                const idx = row * 7 + col;
                if (cal.cells[idx]) {
                    rowBox.children = [...rowBox.children, CalendarCellWidget(cal.cells[idx])];
                }
            }
            children.push(rowBox);
        }
        self.children = children;
    })
});
