/**
 * State module wrapper for AGS 3.1.0
 * Uses built-in AGS Variable class
 */

declare const imports: any;
// Try to get Variable from different possible locations
let Variable: any;
try {
    Variable = imports.gi.Ags.Variable;
} catch {
    try {
        Variable = (imports as any).Variable;
    } catch {
        // Fallback: create a simple reactive object
        Variable = function(initial: any) {
            let value = initial;
            return {
                get value() { return value; },
                set value(v: any) { value = v; },
                set: (v: any) => { value = v; }, // Add set method
                connect: () => {}, // No-op for compatibility
                disconnect: () => {}, // No-op for compatibility
            };
        };
    }
}

export function createState<T extends object>(initial: T): T {
    const state = {} as any;

    for (const key in initial) {
        if (initial.hasOwnProperty(key)) {
            state[key] = Variable((initial as any)[key]);
        }
    }

    return state;
}

export type State<T> = T;

export type State<T> = T;
