import { state } from "../../state/AppState.ts";
import Widget from 'resource:///com/github/Aylur/ags/widget.js';
import { BackendService } from "../../services/BackendService.ts";

const backend = new BackendService();

export const CalendarHeader = () => Widget.Box({
    className: "calendar-header",
    spacing: 12,
    children: [
        Widget.Button({
            className: "calendar-nav-button",
            label: "◀",
            onClicked: () => {
                const parts = state.currentMonthYear.value.split("/");
                const date = new Date(Number(parts[1]), Number(parts[0]) - 2, 1);
                const nextValue = `${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
                state.currentMonthYear.setValue(nextValue);
                backend.getCalendar(nextValue).then(c => state.calendarData.setValue(c));
            }
        }),
        Widget.Label({
            className: "calendar-title",
            label: state.currentMonthYear.bind(),
            xalign: 0.5,
            hexpand: true,
            css: "font-weight: bold; font-size: 18px;"
        }),
        Widget.Button({
            className: "calendar-nav-button",
            label: "▶",
            onClicked: () => {
                const parts = state.currentMonthYear.value.split("/");
                const date = new Date(Number(parts[1]), Number(parts[0]), 1);
                const nextValue = `${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
                state.currentMonthYear.setValue(nextValue);
                backend.getCalendar(nextValue).then(c => state.calendarData.setValue(c));
            }
        })
    ]
});
