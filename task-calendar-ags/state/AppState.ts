import { createState } from "../lib/state";

interface AppStateType {
    mode: any; // Variable
    currentMonthYear: any; // Variable
    calendarData: any; // Variable
    taskList: any; // Variable
    featuredTaskId: any; // Variable
    barCurrentIndex: any; // Variable
    loading: any; // Variable
    error: any; // Variable
}

const initialState: AppStateType = {
    mode: "calendar",
    currentMonthYear: "04/2026",
    calendarData: null,
    taskList: null,
    featuredTaskId: null,
    barCurrentIndex: 0,
    loading: false,
    error: null,
};

export const state = createState(initialState);

export function toggleMode(): void {
    state.mode.set(state.mode.value === "calendar" ? "bar" : "calendar");
}

export function setFeaturedTaskId(id: string | null): void {
    state.featuredTaskId.set(id);
}

export function setCurrentMonthYear(monthYear: string): void {
    state.currentMonthYear.set(monthYear);
}

export function setCalendarData(data: any): void {
    state.calendarData.set(data);
}

export function setTaskList(list: any): void {
    state.taskList.set(list);
}

export function setBarCurrentIndex(index: number): void {
    state.barCurrentIndex.set(index);
}

export function setLoading(loading: boolean): void {
    state.loading.set(loading);
}

export function setError(error: string | null): void {
    state.error.set(error);
}

