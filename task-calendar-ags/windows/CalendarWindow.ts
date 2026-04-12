import Widget from 'resource:///com/github/Aylur/ags/widget.js';
import { state } from '../state/AppState.ts';
import { CalendarWidget } from '../components/calendar/CalendarWidget.ts';

export const CalendarWindow = Widget.Window({
    name: "calendar",
    className: "calendar",
    layer: "overlay",
    anchor: [],
    margins: [10, 10],
    keymode: "on-demand",
    css: "background-color: transparent;",
    setup: self => self.hook(state.mode, () => {
        self.visible = state.mode.value === "calendar";
    }),
    child: Widget.Box({
        className: "calendar-window",
        vertical: true,
        child: CalendarWidget()
    })
});