import * as vscode from 'vscode';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
	// Register a command that runs your Rust code
    let disposable = vscode.commands.registerCommand('extension.runRustCode', async () => {
        try {
            const wasmModulePath = path.join(__dirname, '..', 'rust_code', 'your_project_name_bg.wasm');
            const { instance } = await import(wasmModulePath);

            // Call a function from your Rust WebAssembly module
            instance.exports.main();

			// Show a success message
            vscode.window.showInformationMessage('Rust code executed successfully.');
        } catch (error) {
			// Show an error message
            vscode.window.showErrorMessage(`Error executing Rust code: ${error}`);
        }
    });

	// Register the command
    context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}