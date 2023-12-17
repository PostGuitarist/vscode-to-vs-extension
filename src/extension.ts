import * as vscode from 'vscode';
import { run } from './runner';

export function activate(context: vscode.ExtensionContext) {
	// Register the command
    let disposable = vscode.commands.registerCommand('extension.generateCppSolution', async () => {
        try {
            // Run the generateSolutionFiles function
            run();
        } catch (error) {
			// Show an error message
            vscode.window.showErrorMessage(`Error executing: ${error}`);
        }
    });

	// Register the command
    context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}