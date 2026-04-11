/**
 * AGS 3.1.0 Compatibility Layer
 * Provides simple wrappers for common operations
 */

export interface WindowConfig {
    title?: string;
    width?: number;
    height?: number;
    resizable?: boolean;
    visible?: boolean;
    child?: any;
}

export interface BoxConfig {
    vertical?: boolean;
    spacing?: number;
    children?: any[];
    css?: string;
    className?: string;
}

export interface LabelConfig {
    label?: string;
    css?: string;
    className?: string;
}

export interface ButtonConfig {
    label: string;
    onClick?: () => void;
    css?: string;
    className?: string;
}

/**
 * Simple widget wrapper - returns a basic object that AGS can render
 * In AGS 3.1.0, widgets are typically created through JSX, but we're
 * keeping it simple with object-based approach for compatibility
 */
export function createWidget(type: string, config: any): any {
    return {
        __type: type,
        ...config,
    };
}

export function createBox(config: BoxConfig): any {
    return createWidget("Box", config);
}

export function createLabel(config: LabelConfig): any {
    return createWidget("Label", config);
}

export function createButton(config: ButtonConfig): any {
    return createWidget("Button", config);
}

export function createWindow(config: WindowConfig): any {
    return createWidget("Window", config);
}
