import { Widget } from "ags";
import { AppState } from "../../state/AppState";
import { BackendService } from "../../services/BackendService";

let dialogBox: Widget.Box | null = null;
let nameInput: any;
let dueInput: any;
let errorLabel: any;
let activeState: AppState | null = null;
let activeBackend: BackendService | null = null;

export function createAddTaskDialog(state: AppState, backend: BackendService): Widget.Box {
    activeState = state;
    activeBackend = backend;

    dialogBox = new Widget.Box({
        orientation: "vertical",
        spacing: 12,
        margin: 14,
        cssClasses: ["add-task-dialog"],
    });

    const title = new Widget.Label({ label: "Nueva tarea", cssClasses: ["dialog-title"] });
    nameInput = new Widget.Entry({ placeholderText: "Nombre de la tarea" });
    dueInput = new Widget.Entry({ placeholderText: "DD/MM/YYYY" });
    errorLabel = new Widget.Label({ label: "", cssClasses: ["dialog-error"] });
    const actions = new Widget.Box({ orientation: "horizontal", spacing: 8 });
    const addButton = new Widget.Button({ label: "Agregar" });
    const cancelButton = new Widget.Button({ label: "Cancelar" });

    addButton.on("clicked", async () => {
        if (!activeState || !activeBackend || !dialogBox) {
            return;
        }

        const name = nameInput.text.trim();
        const dueDate = dueInput.text.trim();
        if (!name || !dueDate) {
            errorLabel.label = "Completa nombre y fecha.";
            return;
        }

        try {
            const month = activeState.currentMonthYear.value;
            await activeBackend.addTask(name, dueDate, month);
            const calendar = await activeBackend.getCalendar(month);
            activeState.calendarData.set(calendar);
            activeState.featuredTaskId.set(calendar.featuredTaskId);
            dialogBox.visible = false;
        } catch (error) {
            errorLabel.label = error instanceof Error ? error.message : String(error);
        }
    });

    cancelButton.on("clicked", () => {
        if (dialogBox) {
            dialogBox.visible = false;
        }
    });

    actions.append(addButton);
    actions.append(cancelButton);
    dialogBox.append(title);
    dialogBox.append(nameInput);
    dialogBox.append(dueInput);
    dialogBox.append(errorLabel);
    dialogBox.append(actions);
    dialogBox.visible = false;
    return dialogBox;
}

export function showAddTaskDialog(dueDate: string): void {
    if (!dialogBox || !nameInput || !dueInput) {
        return;
    }
    nameInput.text = "";
    dueInput.text = dueDate;
    errorLabel.label = "";
    dialogBox.visible = true;
}
