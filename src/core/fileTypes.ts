import * as path from "node:path";

/** How a file is represented in the generated Visual Studio project. */
export enum FileType {
  /** Compiled translation unit -> `<ClCompile>`. */
  Source = "source",
  /** Header included by the compiler -> `<ClInclude>`. */
  Header = "header",
  /** Non-code file carried along with the project -> `<Text>`. */
  Text = "text",
}

/** A file that will be listed in the generated project. */
export interface CodeFile {
  /** File name relative to the project folder. */
  readonly fileName: string;
  readonly fileType: FileType;
}

/** The file extensions recognised for each {@link FileType}. */
export interface ExtensionMap {
  readonly [FileType.Source]: readonly string[];
  readonly [FileType.Header]: readonly string[];
  readonly [FileType.Text]: readonly string[];
}

export const DEFAULT_EXTENSIONS: ExtensionMap = {
  [FileType.Source]: [".c", ".cc", ".cpp", ".cxx", ".c++"],
  [FileType.Header]: [".h", ".hh", ".hpp", ".hxx", ".h++", ".inl"],
  [FileType.Text]: [".txt", ".dat"],
};

/**
 * Normalises a user-supplied extension list: trims, lower-cases, adds the
 * leading dot when omitted and drops blanks and duplicates. Settings are
 * hand-edited, so `cpp`, `.CPP` and ` .cpp ` all have to mean the same thing.
 */
export function normalizeExtensions(
  extensions: readonly string[],
): readonly string[] {
  const seen = new Set<string>();

  for (const raw of extensions) {
    const trimmed = raw.trim().toLowerCase();
    if (trimmed === "" || trimmed === ".") {
      continue;
    }
    seen.add(trimmed.startsWith(".") ? trimmed : `.${trimmed}`);
  }

  return [...seen];
}

/** Normalises every list in an {@link ExtensionMap}. */
export function normalizeExtensionMap(map: ExtensionMap): ExtensionMap {
  return {
    [FileType.Source]: normalizeExtensions(map[FileType.Source]),
    [FileType.Header]: normalizeExtensions(map[FileType.Header]),
    [FileType.Text]: normalizeExtensions(map[FileType.Text]),
  };
}

/**
 * Classifies a file by extension, or returns `undefined` when the file is not
 * one the extension should pick up. Unlike the previous implementation this
 * never falls through to a default type, so unrelated files (`.exe`, `.o`,
 * `.gitignore`, ...) are simply left alone.
 */
export function classifyFile(
  fileName: string,
  map: ExtensionMap = DEFAULT_EXTENSIONS,
): FileType | undefined {
  const ext = path.extname(fileName).toLowerCase();
  if (ext === "") {
    return undefined;
  }

  for (const fileType of [FileType.Source, FileType.Header, FileType.Text]) {
    if (normalizeExtensions(map[fileType]).includes(ext)) {
      return fileType;
    }
  }

  return undefined;
}

/**
 * Orders files so generated project files are stable across runs: grouped by
 * type, then case-insensitively by name.
 */
export function sortCodeFiles(files: readonly CodeFile[]): CodeFile[] {
  const order = [FileType.Source, FileType.Header, FileType.Text];

  return [...files].sort((a, b) => {
    const byType = order.indexOf(a.fileType) - order.indexOf(b.fileType);
    if (byType !== 0) {
      return byType;
    }
    return a.fileName.localeCompare(b.fileName, "en", { sensitivity: "base" });
  });
}
