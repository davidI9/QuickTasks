import Widget from 'resource:///com/github/Aylur/ags/widget.js';
import { toggleMode, state } from "../../state/AppState.ts";
import { BarPrevButton, BarNextButton } from "./BarNavButtons.ts";
import { BarTaskDisplay } from "./BarTaskDisplay.ts";
import { BackendService } from "../../services/BackendService.ts";

const backend = new BackendService();

export const BarWidget = () => Widget.Box({
    className: "bar-root",
    spacing: 12,
    children: [
        BarPrevButton(),
        Widget.Label({ label: "✦", className: "bar-star" }),
        BarTaskDisplay(),
        Widget.Button({
            label: "Calendar",
            className: "bar-toggle-button",
            onClicked: async () => {
                const cal = await backend.getCalendar(state.currentMonthYear.value);
                state.calendarData.setValue(cal);
                toggleMode();
            }
        }),
        BarNextButton()
    ]
});
