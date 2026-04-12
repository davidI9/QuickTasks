import { state } from "../../state/AppState.ts";
import Widget from 'resource:///com/github/Aylur/ags/widget.js';
import { CalendarCell } from "../../types/CalendarJSON.ts";
import { TaskChip } from "./TaskChip.ts";
import { showAddTaskDialog } from "./AddTaskDialog.ts";

export const CalendarCellWidget = (cell: CalendarCell) => {
    return Widget.EventBox({
        onHover: (self) => { self.child.toggleClassName('calendar-cell-hovered', true);  },
        onHoverLost: (self) => { self.child.toggleClassName('calendar-cell-hovered', false); },
        child: Widget.Box({
            vertical: true,
            className: cell.isCurrentMonth ? "calendar-cell" : "calendar-cell calendar-day-muted",
            spacing: 2,
            children: [
                Widget.Box({
                    spacing: 2,
                    children: [
                        Widget.Label({
                            label: String(cell.day),
                            className: "calendar-day",
                            hexpand: true,
                            xalign: 0
                        }),
                        Widget.Button({
                            label: "+",
                            className: "calendar-add-button",
                            onClicked: () => {
                                showAddTaskDialog(`${String(cell.day).padStart(2, "0")}/${state.currentMonthYear.value}`);
                            }
                        })
                    ]
                }),
                Widget.Scrollable({
                    vscroll: "automatic",
                    hscroll: "never",
                    vexpand: true,
                    child: Widget.Box({
                        vertical: true,
                        spacing: 2,
                        children: cell.tasks.map(t => TaskChip(t))
                    })
                })
            ]
        })
    });
};
