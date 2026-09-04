import * as vscode from "vscode";

import {
  DEFAULT_EXTENSIONS,
  ExtensionMap,
  FileType,
  normalizeExtensionMap,
} from "./core/fileTypes";

export const CONFIGURATION_SECTION = "vscodeToVs";

/**
 * Reads the configured file extensions, falling back to the defaults for any
 * setting that is unset or not a list of strings.
 */
export function getExtensionMap(
  scope?: vscode.ConfigurationScope,
): ExtensionMap {
  const config = vscode.workspace.getConfiguration(
    CONFIGURATION_SECTION,
    scope,
  );

  return normalizeExtensionMap({
    [FileType.Source]: readStringArray(
      config,
      "sourceFileExtensions",
      DEFAULT_EXTENSIONS[FileType.Source],
    ),
    [FileType.Header]: readStringArray(
      config,
      "headerFileExtensions",
      DEFAULT_EXTENSIONS[FileType.Header],
    ),
    [FileType.Text]: readStringArray(
      config,
      "textFileExtensions",
      DEFAULT_EXTENSIONS[FileType.Text],
    ),
  });
}

function readStringArray(
  config: vscode.WorkspaceConfiguration,
  key: string,
  fallback: readonly string[],
): readonly string[] {
  const value = config.get<unknown>(key);

  if (
    Array.isArray(value) &&
    value.every((entry): entry is string => typeof entry === "string")
  ) {
    return value;
  }

  return fallback;
}
