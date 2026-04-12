import { state } from "../../state/AppState.ts";
import Widget from 'resource:///com/github/Aylur/ags/widget.js';
import { BackendService } from "../../services/BackendService.ts";
import Variable from 'resource:///com/github/Aylur/ags/variable.js';

const backend = new BackendService();
export const editDialogVisible = Variable(false);

let currentEditId: string = "";
let currentEditNameInput: any = null;
let currentEditDueInput: any = null;
let currentEditErrorLabel: any = null;

export function showEditTaskDialog(id: string, name: string, date: string) {
    currentEditId = id;
    if (currentEditNameInput) currentEditNameInput.text = name;
    if (currentEditDueInput) currentEditDueInput.text = date;
    if (currentEditErrorLabel) currentEditErrorLabel.label = "";
    editDialogVisible.setValue(true);
}

export const EditTaskDialog = () => {
    currentEditErrorLabel = Widget.Label({ label: "", className: "dialog-error" });
    currentEditNameInput = Widget.Entry({ placeholder_text: "Nombre de la tarea", hexpand: true });
    currentEditDueInput = Widget.Entry({ placeholder_text: "DD/MM/YYYY", hexpand: true });

    return Widget.Box({
        vertical: true,
        className: "add-task-dialog",
        spacing: 12,
        visible: editDialogVisible.bind(),
        children: [
            Widget.Label({ label: "Editar tarea", className: "dialog-title" }),
            currentEditNameInput,
            currentEditDueInput,
            currentEditErrorLabel,
            Widget.Box({
                spacing: 8,
                halign: 3, // ALIGN_END
                children: [
                    Widget.Button({
                        label: "Cancelar",
                        onClicked: () => { editDialogVisible.setValue(false); }
                    }),
                    Widget.Button({
                        label: "Guardar",
                        className: "bar-toggle-button",
                        onClicked: async () => {
                            const name = currentEditNameInput.text?.trim();
                            const due = currentEditDueInput.text?.trim();
                            if (!name || !due) {
                                currentEditErrorLabel.label = "Completa nombre y fecha.";
                                return;
                            }
                            try {
                                const mode = state.currentMonthYear.value;
                                await backend.editTask(currentEditId, { name, dueDate: due }, mode);
                                const cal = await backend.getCalendar(mode);
                                state.calendarData.setValue(cal);
                                editDialogVisible.setValue(false);
                            } catch (e) {
                                currentEditErrorLabel.label = String(e);
                            }
                        }
                    })
                ]
            })
        ]
    });
};
