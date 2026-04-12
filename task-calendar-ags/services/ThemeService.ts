import { execAsync } from "../lib/process.ts";
import * as Utils from 'resource:///com/github/Aylur/ags/utils.js';
import App from 'resource:///com/github/Aylur/ags/app.js';

export class ThemeService {
    async loadTheme(): Promise<void> {
        const username = String(App.configDir).split('/')[2];
        const caelestiaPath = `/home/${username}/.local/state/caelestia/scheme.json`;
        const themeOutputPath = '/tmp/task-calendar-theme.css';

        const applyColors = async () => {
            try {
                const content = await execAsync(`cat ${caelestiaPath}`);
                const data = JSON.parse(typeof content === "string" ? content : String(content));
                const colors = data.colours;
                
                const bg = "#" + colors.background;
                const fg = "#" + colors.onBackground;
                const accent = "#" + (colors.secondary || colors.primary || "ffffff");
                const border = "#" + (colors.surfaceVariant || colors.outline || "333333");
                
                const isLight = data.mode === "light";
                const bg_secondary = isLight ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.03)";
                const hover_bg = isLight ? "rgba(0,0,0,0.09)" : "rgba(255,255,255,0.05)";

                // Create GTK 3 theme bindings
                const css = `
@define-color bg_primary ${bg};
@define-color bg_secondary ${bg_secondary};
@define-color text_primary ${accent};
@define-color text_muted ${fg};
@define-color accent_color ${accent};
@define-color border_color ${border};
@define-color hover_bg ${hover_bg};
@define-color star_active ${accent};
`;
                await Utils.writeFile(css, themeOutputPath);
                console.log("Caelestia theme synced to Calendar");
                
                // Force AGS to re-apply the root style
                App.resetCss();
                App.applyCss(themeOutputPath);
                App.applyCss(App.configDir + "/style.css");
            } catch (error) {
                console.warn("Could not sync with Caelestia theme:", error);
            }
        };

        // Apply immediately
        await applyColors();

        // Monitor for live Caelestia updates
        try {
            Utils.monitorFile(caelestiaPath, () => {
                applyColors();
            });
        } catch (error) {
            console.warn("Could not establish monitor on wal cache.");
        }
    }
}

