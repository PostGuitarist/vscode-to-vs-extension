import * as vscode from 'vscode';
import { generateVSProjectFiles } from './projectGenerator';

export function activate(context: vscode.ExtensionContext) {
	console.log('Extension "vscode-to-vs" is now active!');

	// Register the command
	const disposable = vscode.commands.registerCommand('vscode-to-vs.generateCppSolution', async () => {
		try {
			generateVSProjectFiles();
		} catch (error) {
			vscode.window.showErrorMessage(`Error generating project files: ${error}`);
		}
	});

	context.subscriptions.push(disposable);
}

// Called when extension is deactivated
export function deactivate() {}
