import { Widget } from "ags";
import { AppState } from "../../state/AppState";
import { BackendService } from "../../services/BackendService";
import { createBarPrevButton } from "./BarPrevButton";
import { createBarTaskDisplay } from "./BarTaskDisplay";
import { createBarStarIndicator } from "./BarStarIndicator";
import { createBarNextButton } from "./BarNextButton";

export function createBarWidget(state: AppState, backend: BackendService): Widget.Box {
    const root = new Widget.Box({ orientation: "horizontal", spacing: 12, margin: 16, cssClasses: ["bar-root"] });

    const prevButton = createBarPrevButton(state, backend);
    const star = createBarStarIndicator();
    const taskDisplay = createBarTaskDisplay(state, backend);
    const nextButton = createBarNextButton(state, backend);

    const toggleButton = new Widget.Button({ label: "Calendario", cssClasses: ["bar-toggle-button"] });
    toggleButton.on("clicked", () => state.toggleMode());

    root.append(prevButton);
    root.append(star);
    root.append(taskDisplay, { expand: true });
    root.append(toggleButton);
    root.append(nextButton);

    return root;
}
