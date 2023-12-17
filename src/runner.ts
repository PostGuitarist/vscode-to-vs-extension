import * as vscode from "vscode";
import * as child_process from "child_process";
import * as path from "path";

export function run() {
    // Get the active text editor
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showErrorMessage("No active editor found");
        return;
    }

    // Get the file path of the active text editor
    const file_path = editor.document.uri.fsPath;

    // Check if the file is a C++ file
    if (!file_path.endsWith(".cpp") && !file_path.endsWith(".h")) {
        vscode.window.showErrorMessage("File is not a C++ file");
        return;
    }

    // Get the directory path of the active text editor
    const dir_path = path.dirname(file_path);

    // Generate the solution files using MSBuild
    const msbuild_process = child_process.spawn(
        "msbuild",
        ["/t:ClCompile", "/p:Configuration=Debug"],
        {
            cwd: dir_path,
        }
    );

    // Handle MSBuild output
    msbuild_process.stdout.on("data", (data) => {
        console.log(`stdout: ${data}`);
    });

    msbuild_process.stderr.on("data", (data) => {
        console.error(`stderr: ${data}`);
    });

    msbuild_process.on("close", (code) => {
        console.log(`MSBuild process exited with code ${code}`);
        if (code === 0) {
            vscode.window.showInformationMessage(
                "Solution files generated successfully"
            );
        } else {
            vscode.window.showErrorMessage("Failed to generate solution files");
        }
    });
}