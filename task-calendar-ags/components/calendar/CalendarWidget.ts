import Widget from 'resource:///com/github/Aylur/ags/widget.js';
import { CalendarHeader } from "./CalendarHeader.ts";
import { CalendarGrid } from "./CalendarGrid.ts";
import { AddTaskDialog } from "./AddTaskDialog.ts";
import { EditTaskDialog } from "./EditTaskDialog.ts";
import { toggleMode, state } from "../../state/AppState.ts";
import { BackendService } from "../../services/BackendService.ts";

const backend = new BackendService();

export const CalendarWidget = () => Widget.Box({
    vertical: true,
    spacing: 12,
    margin: 16,
    children: [
        CalendarHeader(),
        Widget.Button({
            label: "Bar View",
            className: "bar-toggle-button",
            onClicked: async () => {
                const list = await backend.getTaskList();
                state.taskList.setValue(list);
                toggleMode();
            }
        }),
        CalendarGrid(),
        AddTaskDialog(),
        EditTaskDialog()
    ]
});
