import * as vscode from "vscode";

/**
 * Extension log, surfaced in the Output panel.
 *
 * Diagnostics belong here rather than in `console.log`, which is invisible to
 * users unless they open the extension host developer tools.
 */
export class Logger implements vscode.Disposable {
  private readonly channel: vscode.LogOutputChannel;

  constructor(name = "VSCode to Visual Studio") {
    this.channel = vscode.window.createOutputChannel(name, { log: true });
  }

  info(message: string): void {
    this.channel.info(message);
  }

  error(message: string, error?: unknown): void {
    this.channel.error(
      error === undefined ? message : `${message}: ${stringify(error)}`,
    );
  }

  /** Reveals the log without stealing focus from the editor. */
  show(): void {
    this.channel.show(true);
  }

  dispose(): void {
    this.channel.dispose();
  }
}

function stringify(error: unknown): string {
  if (error instanceof Error) {
    return error.stack ?? error.message;
  }
  return String(error);
}
