import { createState } from "../lib/state";

interface ThemeStateType {
    isDark: any; // Variable
    cssVariables: any; // Variable
}

const initialTheme: ThemeStateType = {
    isDark: true,
    cssVariables: {
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
    },
};

export const themeState = createState(initialTheme);

export function isColorDark(hex: string): boolean {
    const rgb = parseInt(hex.slice(1), 16);
    const r = (rgb >> 16) & 255;
    const g = (rgb >> 8) & 255;
    const b = rgb & 255;
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance < 0.5;
}

export function updateThemeFromPalette(data: Record<string, string>): void {
    const dominant = data["dominant"] || data["primary"] || "#000000";
    const dark = isColorDark(dominant);

    themeState.isDark.set(dark);
    themeState.cssVariables.set({
        ...themeState.cssVariables.value,
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
        "--accent-color": data["accent"] || themeState.cssVariables.value["--accent-color"],
        "--border-color": data["border"] || themeState.cssVariables.value["--border-color"],
        "--hover-bg": data["hover"] || themeState.cssVariables.value["--hover-bg"],
    });
}

export function getCssVariables(): Record<string, string> {
    return themeState.cssVariables.value;
}

