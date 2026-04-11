import { execAsync } from "../lib/process";
import { updateThemeFromPalette, getCssVariables } from "../state/ThemeState";

declare const imports: any;

export class ThemeService {
    async loadTheme(): Promise<void> {
        // In GJS, use GLib.get_home_dir() instead of process.env.HOME
        const homeDir = imports.gi.GLib.get_home_dir();
        const expandedPath = `${homeDir}/.cache/caelestia/colors.json`;
        try {
            const content = await execAsync(`cat ${expandedPath}`);
            const data = JSON.parse(typeof content === "string" ? content : String(content)) as Record<string, string>;
            updateThemeFromPalette(data);
        } catch (error) {
            console.warn("Could not load theme from caelestia:", error);
        }
    }

    async injectCssVariables(): Promise<void> {
        const variables = getCssVariables();
        const declarations = Object.entries(variables)
            .map(([key, value]) => `${key}: ${value};`)
            .join("\n");
        const css = `:root { ${declarations} }`;
        
        try {
            await execAsync(`echo "${css}" > /tmp/task-calendar-theme.css`);
        } catch (error) {
            console.warn("Could not write theme CSS:", error);
        }
    }
}

