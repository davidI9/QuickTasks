import Widget from 'resource:///com/github/Aylur/ags/widget.js';

export const BarWindow = Widget.Window({
name: "bar",
    className: "bar", // Para el CSS
    layer: "top",     // ¡VITAL! Pone la barra por encima de todo
    exclusivity: "exclusive", // Reserva espacio (como Waybar)
    anchor: ["top", "left", "right"], // Se pega arriba y se estira
    visible: true,
    child: Widget.Box({
        className: "bar-window",
        css: "background-color: #1e1e2e; padding: 8px 20px; border-radius: 20px; border: 2px solid #cba6f7; color: white;",
        children: [
            Widget.Label({
                label: "⭐ Tarea Destacada: ",
                css: "font-weight: bold; color: #f9e2af; margin-right: 10px;"
            }),
            Widget.Label({
                label: "A la espera del backend...",
                css: "font-style: italic;"
            })
        ]
    })
});