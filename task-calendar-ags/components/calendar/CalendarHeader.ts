import { Widget } from "ags";
import { AppState } from "../../state/AppState";
import { BackendService } from "../../services/BackendService";

export function createCalendarHeader(state: AppState, backend: BackendService): Widget.Box {
    const previous = new Widget.Button({ label: "◀" });
    const title = new Widget.Label({ label: state.currentMonthYear.value, xalign: 0.5 });
    const next = new Widget.Button({ label: "▶" });

    const header = new Widget.Box({ orientation: "horizontal", spacing: 10, margin: 12 });
    header.append(previous);
    header.append(title, { expand: true });
    header.append(next);

    state.currentMonthYear.onChange((value: string) => {
        title.label = value;
    });

    previous.on("clicked", async () => {
        const [month, year] = state.currentMonthYear.value.split("/").map(Number);
        const date = new Date(year, month - 2, 1);
        const nextValue = `${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
        state.currentMonthYear.set(nextValue);
    });

    next.on("clicked", async () => {
        const [month, year] = state.currentMonthYear.value.split("/").map(Number);
        const date = new Date(year, month, 1);
        const nextValue = `${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
        state.currentMonthYear.set(nextValue);
    });

    return header;
}
