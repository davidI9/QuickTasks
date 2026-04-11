import Widget from 'resource:///com/github/Aylur/ags/widget.js';

export const CalendarWindow = Widget.Window({
    name: "calendar",
    className: "calendar",
    layer: "overlay", // El calendario suele ir en una capa superior (overlay)
    anchor: ["top", "right"], // Esquina superior derecha
    margins: [10, 10], // Un poco de aire
    visible: true,
    child: Widget.Box({
        className: "calendar-window",
        vertical: true,
        css: "background-color: #1e1e2e; padding: 20px; border-radius: 12px; color: white; min-width: 300px;",
        children: [
            Widget.Label({
                label: "🗓️ Task Calendar (AGS 3.1 Edition xd)",
                css: "font-size: 24px; font-weight: bold; margin-bottom: 15px;"
            }),
            Widget.Label({
                label: "¡El Frontend está vivo! 🚀",
                css: "margin-bottom: 10px;"
            }),
            Widget.Button({
                label: "Haz clic para saludar a C++",
                css: "background-color: #89b4fa; color: #11111b; padding: 5px; border-radius: 5px;",
                onClicked: () => console.log("¡Botón pulsado!")
            })
        ]
    })
});