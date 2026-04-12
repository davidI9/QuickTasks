import { createState } from "../lib/state";

const today = new Date();
const currentMonth = String(today.getMonth() + 1).padStart(2, '0'); // Sumamos 1 porque enero es 0
const currentYear = today.getFullYear();
const actualMonthYear = `${currentMonth}/${currentYear}`;

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
    mode: "bar",
    currentMonthYear: actualMonthYear,
    calendarData: null,
    taskList: null,
    featuredTaskId: null,
    barCurrentIndex: 0,
    loading: false,
    error: null,
};

export const state = createState(initialState);

export function toggleMode(): void {
    state.mode.setValue(state.mode.value === "calendar" ? "bar" : "calendar");
}

export function setFeaturedTaskId(id: string | null): void {
    state.featuredTaskId.setValue(id);
}

export function setCurrentMonthYear(monthYear: string): void {
    state.currentMonthYear.setValue(monthYear);
}

export function setCalendarData(data: any): void {
    state.calendarData.setValue(data);
}

export function setTaskList(list: any): void {
    state.taskList.setValue(list);
}

export function setBarCurrentIndex(index: number): void {
    state.barCurrentIndex.setValue(index);
}

export function setLoading(loading: boolean): void {
    state.loading.setValue(loading);
}

export function setError(error: string | null): void {
    state.error.setValue(error);
}

