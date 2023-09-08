import * as vscode from 'vscode';
import { generateSolutionFiles } from './generateSolution';

export function activate(context: vscode.ExtensionContext) {
	// Register the command
    let disposable = vscode.commands.registerCommand('extension.generateCppSolution', async () => {
        try {
            // Run the generateSolutionFiles function
            generateSolutionFiles();

			// Show a success message
            vscode.window.showInformationMessage('Converted successfully.');
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