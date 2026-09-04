import * as assert from "node:assert";

import * as vscode from "vscode";

import { GENERATE_SOLUTION_COMMAND } from "../../commands/generateSolution";

const EXTENSION_ID = "PostGuitarist.vscode-to-vs";

suite("Extension", () => {
  test("is installed in the test host", () => {
    assert.ok(vscode.extensions.getExtension(EXTENSION_ID));
  });

  test("activates", async () => {
    const extension = vscode.extensions.getExtension(EXTENSION_ID);
    assert.ok(extension);

    await extension.activate();
    assert.strictEqual(extension.isActive, true);
  });

  test("registers the generate command", async () => {
    await vscode.extensions.getExtension(EXTENSION_ID)?.activate();

    const commands = await vscode.commands.getCommands(true);
    assert.ok(commands.includes(GENERATE_SOLUTION_COMMAND));
  });

  test("reports an error instead of throwing when no folder is open", async () => {
    await vscode.extensions.getExtension(EXTENSION_ID)?.activate();

    // With no workspace folder the command must resolve quietly; the user sees
    // an error notification rather than an unhandled rejection.
    await assert.doesNotReject(async () => {
      await vscode.commands.executeCommand(GENERATE_SOLUTION_COMMAND);
    });
  });
});
