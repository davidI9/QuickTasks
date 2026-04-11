import { Variable, Utils } from "ags";

export class ThemeState {
    static instance = new ThemeState();

    isDark = new Variable<boolean>(true);
    cssVariables = new Variable<Record<string, string>>({
        "--bg-primary": "#0a0a0a",
        "--bg-secondary": "#111111",
        "--text-primary": "#f5f5f5",
        "--text-muted": "#b8b8b8",
        "--accent-color": "#7ca7ff",
        "--border-color": "#2a2a2a",
        "--hover-bg": "#1a1a1a",
        "--star-active": "#f5c518",
        "--past-day-opacity": "0.36",
        "--transition-speed": "180ms",
    });

    async loadPalette(filePath: string): Promise<void> {
        try {
            const raw = await Utils.execAsync(`cat ${filePath}`);
            if (typeof raw !== "string") {
                return;
            }
            const data = JSON.parse(raw) as Record<string, string>;
            const dominant = data["dominant"] || data["primary"] || "#000000";
            const dark = this.isColorDark(dominant);
            this.isDark.set(dark);
            this.cssVariables.set({
                ...this.cssVariables.value,
                ...(dark ? {
                    "--bg-primary": "#0a0a0a",
                    "--bg-secondary": "#111111",
                    "--text-primary": "#f5f5f5",
                    "--text-muted": "#b8b8b8",
                } : {
                    "--bg-primary": "#f2f2f2",
                    "--bg-secondary": "#e8e8e8",
                    "--text-primary": "#111111",
                    "--text-muted": "#595959",
                }),
                "--accent-color": data["accent"] || this.cssVariables.value["--accent-color"],
                "--border-color": data["border"] || this.cssVariables.value["--border-color"],
                "--hover-bg": data["hover"] || this.cssVariables.value["--hover-bg"],
            });
        } catch {
            // Keep defaults.
        }
    }

    private isColorDark(hex: string): boolean {
        const normalized = hex.replace("#", "");
        if (normalized.length !== 6) {
            return true;
        }
        const r = parseInt(normalized.slice(0, 2), 16);
        const g = parseInt(normalized.slice(2, 4), 16);
        const b = parseInt(normalized.slice(4, 6), 16);
        const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
        return luminance < 128;
    }
}
