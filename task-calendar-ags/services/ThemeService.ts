import { Utils } from "ags";
import { ThemeState } from "../state/ThemeState";

export class ThemeService {
    state = ThemeState.instance;

    async loadTheme(): Promise<void> {
        await this.state.loadPalette("~/.cache/caelestia/colors.json");
    }

    async injectCssVariables(): Promise<void> {
        const variables = this.state.cssVariables.value;
        const declarations = Object.entries(variables)
            .map(([key, value]) => `${key}: ${value};`)
            .join("\n");
        await Utils.execAsync(`echo ":root { ${declarations} }" > /tmp/task-calendar-theme.css`);
    }
}
