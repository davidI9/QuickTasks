import Widget from 'resource:///com/github/Aylur/ags/widget.js';
import { state } from '../state/AppState.ts';
import { BarWidget } from '../components/bar/BarWidget.ts';

export const BarWindow = Widget.Window({
    name: "bar",
    className: "bar",
    layer: "top",
    exclusivity: "exclusive",
    anchor: ["top", "left", "right"],
    margins: [20, 20, -10, 70],
    visible: state.mode.value === "bar",
    keymode: "on-demand",
    css: "background-color: transparent;",
    setup: self => self.hook(state.mode, () => {
        self.visible = state.mode.value === "bar";
    }),
    child: Widget.Box({
        className: "bar-window",
        child: BarWidget()
    })
});