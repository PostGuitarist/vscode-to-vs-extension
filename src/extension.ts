import * as vscode from "vscode";

import {
  GENERATE_SOLUTION_COMMAND,
  generateSolutionCommand,
} from "./commands/generateSolution";
import { Logger } from "./logger";

/** Where the build copies `assets/`, relative to the extension root. */
const TEMPLATES_PATH = ["dist", "assets"] as const;

export function activate(context: vscode.ExtensionContext): void {
  const logger = new Logger();
  context.subscriptions.push(logger);

  const templatesDir = vscode.Uri.joinPath(
    context.extensionUri,
    ...TEMPLATES_PATH,
  ).fsPath;

  logger.info(`Activated; using templates from ${templatesDir}`);

  context.subscriptions.push(
    vscode.commands.registerCommand(GENERATE_SOLUTION_COMMAND, () =>
      generateSolutionCommand(templatesDir, logger),
    ),
  );
}

export function deactivate(): void {
  // Everything is disposed through context.subscriptions.
}
