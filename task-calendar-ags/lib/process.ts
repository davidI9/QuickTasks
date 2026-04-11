/**
 * Process module wrapper for AGS
 * Uses native GLib for command execution
 */

declare const imports: any;
const GLib = imports.gi.GLib;

export async function execAsync(cmd: string | string[]): Promise<string> {
    const command = Array.isArray(cmd) ? cmd.join(' ') : cmd;

    return new Promise((resolve, reject) => {
        try {
            const [success, stdout, stderr, exitStatus] = GLib.spawn_command_line_sync(command);

            if (success && exitStatus === 0) {
                // LA MAGIA: Convertir los bytes a string de forma segura
                const decoder = new TextDecoder('utf-8');
                const output = decoder.decode(stdout);
                resolve(output.trim());
            } else {
                const decoder = new TextDecoder('utf-8');
                const errOutput = stderr ? decoder.decode(stderr) : 'Unknown error';
                reject(new Error(`Command failed: ${errOutput}`));
            }
        } catch (error) {
            reject(error);
        }
    });
}

export async function exec(cmd: string): Promise<void> {
    await execAsync(cmd);
}