import * as vscode from "vscode";

import { getExtensionMap } from "../config";
import {
  GenerateResult,
  ProjectGenerationError,
  directoryHasContent,
  generateSolution,
} from "../core/generator";
import { validateProjectName } from "../core/projectName";
import { Logger } from "../logger";

export const GENERATE_SOLUTION_COMMAND = "vscode-to-vs.generateCppSolution";

/**
 * Command handler: asks for a project name and generates the solution next to
 * the workspace's source files.
 *
 * Every step that can fail reports a specific message, and a cancelled prompt
 * quietly aborts rather than being treated as an error.
 */
export async function generateSolutionCommand(
  templatesDir: string,
  logger: Logger,
): Promise<void> {
  const workspaceFolder = await pickWorkspaceFolder();
  if (workspaceFolder === undefined) {
    return;
  }

  const projectName = await promptForProjectName(workspaceFolder.name);
  if (projectName === undefined) {
    return;
  }

  const target = vscode.Uri.joinPath(workspaceFolder.uri, projectName);
  if (!(await confirmOverwrite(target))) {
    return;
  }

  try {
    const result = await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: `Generating Visual Studio files for '${projectName}'...`,
      },
      () =>
        generateSolution({
          workspaceRoot: workspaceFolder.uri.fsPath,
          templatesDir,
          projectName,
          extensions: getExtensionMap(workspaceFolder.uri),
        }),
    );

    logger.info(
      `Generated ${result.solutionPath} with ${result.files.length} source file(s).`,
    );
    await reportSuccess(result);
  } catch (error) {
    logger.error(`Failed to generate '${projectName}'`, error);

    const message =
      error instanceof ProjectGenerationError
        ? error.message
        : `Unexpected error generating project files: ${
            error instanceof Error ? error.message : String(error)
          }`;

    const selection = await vscode.window.showErrorMessage(message, "Show Log");
    if (selection === "Show Log") {
      logger.show();
    }
  }
}

/**
 * Resolves the folder to generate into: the only open folder, or the user's
 * choice when the window hosts a multi-root workspace.
 */
async function pickWorkspaceFolder(): Promise<
  vscode.WorkspaceFolder | undefined
> {
  const folders = vscode.workspace.workspaceFolders;

  if (folders === undefined || folders.length === 0) {
    // Not awaited: a notification with no actions stays open until the user
    // dismisses it, and the command has nothing left to do.
    void vscode.window.showErrorMessage(
      "Open a folder before generating Visual Studio project files.",
    );
    return undefined;
  }

  if (folders.length === 1) {
    return folders[0];
  }

  return vscode.window.showWorkspaceFolderPick({
    placeHolder: "Select the folder containing your C++ source files",
  });
}

async function promptForProjectName(
  defaultName: string,
): Promise<string | undefined> {
  const input = await vscode.window.showInputBox({
    title: "Generate C++ Solution Files",
    prompt: "Enter the project name",
    value: defaultName,
    ignoreFocusOut: true,
    validateInput: validateProjectName,
  });

  return input?.trim();
}

/**
 * Asks before writing into a folder that already has content, so an existing
 * project is never silently clobbered.
 */
async function confirmOverwrite(target: vscode.Uri): Promise<boolean> {
  if (!(await directoryHasContent(target.fsPath))) {
    return true;
  }

  const overwrite = "Overwrite";
  const selection = await vscode.window.showWarningMessage(
    `'${target.fsPath}' already exists. Files with the same name will be replaced.`,
    { modal: true },
    overwrite,
  );

  return selection === overwrite;
}

async function reportSuccess(result: GenerateResult): Promise<void> {
  const summary =
    result.files.length === 0
      ? "no source files were found to include"
      : `${result.files.length} file(s) included`;

  const reveal = "Reveal in Explorer";
  const selection = await vscode.window.showInformationMessage(
    `Visual Studio project files generated (${summary}).`,
    reveal,
  );

  if (selection === reveal) {
    await vscode.commands.executeCommand(
      "revealFileInOS",
      vscode.Uri.file(result.solutionPath),
    );
  }
}
