import Variable from 'resource:///com/github/Aylur/ags/variable.js';

export function createState<T extends object>(initial: T): Record<keyof T, import('resource:///com/github/Aylur/ags/variable.js').default<any>> {
    const state: any = {};
    for (const key in initial) {
        if (Object.prototype.hasOwnProperty.call(initial, key)) {
            state[key] = Variable((initial as any)[key]);
        }
    }
    return state;
}
