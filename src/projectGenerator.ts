import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import {
  copyFiles,
  copyTemplateFiles,
  replaceIdsInSolutionFile,
} from "./helpers";
import { appendFileTypesToFilters } from "./appendHelpers";

export async function generateVSProjectFiles() {
  // Get the current project name from the workspace folder
  const inWorkspace = vscode.workspace.name;

  if (!inWorkspace) {
    vscode.window.showErrorMessage("No workspace is currently open.");
    return;
  }

  // Get input from user for the project name
  const newName = await vscode.window.showInputBox({
    prompt: "Enter the project name",
    value: vscode.workspace.name,
  });

  // Folder where the project files will be generated
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
  if (!workspaceFolder) {
    vscode.window.showErrorMessage("No workspace folder found.");
    return;
  }
  const projectDir = path.join(workspaceFolder, newName!);
  const projectFolder = path.join(projectDir, newName!);

  // Create the folders
  try {
    // Create the main directory folder
    fs.mkdirSync(projectDir, { recursive: true });

    // Create the project folder inside the main directory
    fs.mkdirSync(projectFolder, { recursive: true });
  } catch (error) {
    vscode.window.showErrorMessage(`Error creating folders: `);
    return;
  }

  // Copy the template files
  try {
    copyTemplateFiles(projectFolder, projectDir, newName!);
  } catch (error) {
    if (error instanceof Error) {
      if (!error.message.includes("EPERM")) {
        vscode.window.showErrorMessage(`Error copying files: ${error}`);
        return;
      } else {
        return;
      }
    }
  }

  // Replace the IDs in the solution file
  try {
    replaceIdsInSolutionFile(newName!, projectDir);
  } catch (error) {
    vscode.window.showErrorMessage(`Error replacing IDs: ${error}`);
    return;
  }

  // Copy the main files
  try {
    copyFiles(workspaceFolder, projectFolder);
  } catch (error) {
    if (error instanceof Error) {
      // Is this the best way to handle this error? Probably not.

      if (!error.message.includes("EPERM")) {
        vscode.window.showErrorMessage(`Error copying main files: ${error}`);
        return;
      } else {
        return;
      }
    }
  }

  // Append the file types to the filters
  try {
    appendFileTypesToFilters(projectFolder, newName!);
  } catch (error) {
    vscode.window.showErrorMessage(
      `Error appending file types to filters: ${error}`,
    );
    return;
  }

  vscode.window.showInformationMessage(
    "Visual Studio project files generated successfully",
  );
}
