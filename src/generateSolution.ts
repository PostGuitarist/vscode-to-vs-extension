import * as vscode from 'vscode';
import * as child_process from 'child_process';

export function generateSolutionFiles() {
    // Get the workspace folder (the root of your C++ project).
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];

    if (!workspaceFolder) {
        vscode.window.showErrorMessage('No workspace folder found.');
        return;
    }
 
    /* Get the C++ Project Name (TODO)
        Get the name of the C++ project from the .cpp file name
        so that we can use it to name the .sln and .vcxproj files.

        This will be completed in a future update.
    */
    // const cppFileName = vscode.window.activeTextEditor?.document.fileName;

    // Path to your C++ project's .vcxproj file.
    const vcxprojFilePath = workspaceFolder.uri.fsPath + '/MyCppProject.vcxproj';

    // Run MSBuild to generate the .sln and .vcxproj files.
    const msbuildProcess = child_process.spawn('msbuild', [vcxprojFilePath, '/t:Rebuild'], {
        cwd: workspaceFolder.uri.fsPath,
        stdio: 'inherit', // Redirect output to the VS Code terminal
    });

    msbuildProcess.on('close', (code) => {
        if (code === 0) {
            vscode.window.showInformationMessage('C++ solution files generated successfully.');
        } else {
            vscode.window.showErrorMessage('Failed to generate C++ solution files.');
        }
    });
}
