import { state } from "../../state/AppState.ts";
import Widget from 'resource:///com/github/Aylur/ags/widget.js';
import { BackendService } from "../../services/BackendService.ts";
import Variable from 'resource:///com/github/Aylur/ags/variable.js';

const backend = new BackendService();
export const dialogVisible = Variable(false);

let currentDueInput: any = null;
let currentNameInput: any = null;
let currentErrorLabel: any = null;

export function showAddTaskDialog(date: string) {
    if (currentDueInput) currentDueInput.text = date;
    if (currentNameInput) currentNameInput.text = "";
    if (currentErrorLabel) currentErrorLabel.label = "";
    dialogVisible.setValue(true);
}

export const AddTaskDialog = () => {
    currentErrorLabel = Widget.Label({ label: "", className: "dialog-error" });
    currentNameInput = Widget.Entry({ placeholder_text: "Task name", hexpand: true });
    currentDueInput = Widget.Entry({ placeholder_text: "DD/MM/YYYY", hexpand: true });

    return Widget.Box({
        vertical: true,
        className: "add-task-dialog",
        spacing: 12,
        visible: dialogVisible.bind(),
        children: [
            Widget.Label({ label: "New Task", className: "dialog-title" }),
            currentNameInput,
            currentDueInput,
            currentErrorLabel,
            Widget.Box({
                spacing: 8,
                halign: 3, // ALIGN_END
                children: [
                    Widget.Button({
                        label: "Cancel",
                        onClicked: () => { dialogVisible.setValue(false); }
                    }),
                    Widget.Button({
                        label: "Add",
                        className: "bar-toggle-button",
                        onClicked: async () => {
                            const name = currentNameInput.text?.trim();
                            const due = currentDueInput.text?.trim();
                            if (!name || !due) {
                                currentErrorLabel.label = "Completa nombre y fecha.";
                                return;
                            }
                            try {
                                const mode = state.currentMonthYear.value;
                                await backend.addTask(name, due, mode);
                                const cal = await backend.getCalendar(mode);
                                state.calendarData.setValue(cal);
                                dialogVisible.setValue(false);
                            } catch (e) {
                                currentErrorLabel.label = String(e);
                            }
                        }
                    })
                ]
            })
        ]
    });
};
