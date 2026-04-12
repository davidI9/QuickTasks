import { execAsync } from "../lib/process";
import { CalendarJSON } from "../types/CalendarJSON";
import { TaskListJSON } from "../types/TaskListJSON";
import GLib from 'gi://GLib';

export const BIN_PATH = `${GLib.get_home_dir()}/QuickTasks/build/task-calendar`;

export interface ErrorJSON {
    type: "error";
    code: string;
    message: string;
}

export type BackendResponse = CalendarJSON | TaskListJSON | ErrorJSON;

export class BackendService {
    private buildCommand(args: string[]): string {
        return [BIN_PATH, ...args]
            .map((part) => {
                if (part.includes(" ") || part.includes("\"")) {
                    return `"${part.replace(/(["\\])/g, "\\$1")}"`;
                }
                return part;
            })
            .join(" ");
    }

    private async execBackend(args: string[]): Promise<BackendResponse> {
        const command = this.buildCommand(args);
        const stdout = await execAsync(command);
        const raw = typeof stdout === "string" ? stdout : String(stdout);
        const parsed = JSON.parse(raw) as BackendResponse;
        if (parsed.type === "error") {
            throw new Error(`${parsed.code}: ${parsed.message}`);
        }
        return parsed;
    }

    async getCalendar(monthYear: string): Promise<CalendarJSON> {
        const result = await this.execBackend(["get-calendar", "--month", monthYear]);
        if (result.type !== "calendar") {
            throw new Error("Unexpected backend response for get-calendar");
        }
        return result;
    }

    async getTaskList(): Promise<TaskListJSON> {
        const result = await this.execBackend(["get-tasks"]);
        if (result.type !== "taskList") {
            throw new Error("Unexpected backend response for get-tasks");
        }
        return result;
    }

    async addTask(name: string, dueDate: string, monthYear?: string): Promise<CalendarJSON | TaskListJSON> {
        const args = ["add-task", "--name", name, "--due", dueDate];
        if (monthYear) {
            args.push("--month", monthYear);
        }
        return this.execBackend(args) as Promise<CalendarJSON | TaskListJSON>;
    }

    async removeTask(id: string, monthYear?: string): Promise<CalendarJSON | TaskListJSON> {
        const args = ["remove-task", "--id", id];
        if (monthYear) {
            args.push("--month", monthYear);
        }
        return this.execBackend(args) as Promise<CalendarJSON | TaskListJSON>;
    }

    async editTask(
        id: string,
        fields: { name?: string; dueDate?: string; completed?: boolean },
        monthYear?: string
    ): Promise<CalendarJSON | TaskListJSON> {
        const args = ["edit-task", "--id", id];
        if (fields.name !== undefined) {
            args.push("--name", fields.name);
        }
        if (fields.dueDate !== undefined) {
            args.push("--due", fields.dueDate);
        }
        if (fields.completed !== undefined) {
            args.push("--completed", fields.completed ? "true" : "false");
        }
        if (monthYear) {
            args.push("--month", monthYear);
        }
        return this.execBackend(args) as Promise<CalendarJSON | TaskListJSON>;
    }

    async setFeatured(id: string): Promise<TaskListJSON> {
        const result = await this.execBackend(["set-featured", "--id", id]);
        if (result.type !== "taskList") {
            throw new Error("Unexpected backend response for set-featured");
        }
        return result;
    }
}
