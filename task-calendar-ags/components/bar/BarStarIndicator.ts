import { Widget } from "ags";

export function createBarStarIndicator(): Widget.Label {
    return new Widget.Label({ label: "★", cssClasses: ["bar-star"] });
}
