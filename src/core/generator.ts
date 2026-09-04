import * as fs from "node:fs/promises";
import * as path from "node:path";

import {
  CodeFile,
  DEFAULT_EXTENSIONS,
  ExtensionMap,
  classifyFile,
  sortCodeFiles,
} from "./fileTypes";
import { createGuid } from "./guid";
import { buildFiltersItemGroups, buildProjectItemGroups } from "./itemGroups";
import { normalizeProjectName, validateProjectName } from "./projectName";
import {
  assertTemplatesAvailable,
  readTemplate,
  renderTemplate,
} from "./templates";

export interface GenerateOptions {
  /** Folder scanned for source files, and the parent of the generated solution. */
  readonly workspaceRoot: string;
  /** Folder holding the `template.*` files. */
  readonly templatesDir: string;
  /** Name of the solution, project and generated folders. */
  readonly projectName: string;
  /** Extensions to collect. Defaults to {@link DEFAULT_EXTENSIONS}. */
  readonly extensions?: ExtensionMap;
}

export interface GenerateResult {
  /** `<workspaceRoot>/<name>` — holds the `.sln` and the project folder. */
  readonly solutionDir: string;
  /** `<workspaceRoot>/<name>/<name>` — holds the project and source files. */
  readonly projectDir: string;
  /** Absolute path of the generated `.sln`. */
  readonly solutionPath: string;
  /** Source files copied into the project folder. */
  readonly files: readonly CodeFile[];
}

/** Raised for failures a user can act on; the message is shown verbatim. */
export class ProjectGenerationError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "ProjectGenerationError";
  }
}

/**
 * Lists the files in `directory` that the extension should carry into the
 * project. Sub-directories, symlinks and unrecognised extensions are skipped —
 * only regular files in the top level are collected.
 */
export async function collectSourceFiles(
  directory: string,
  extensions: ExtensionMap = DEFAULT_EXTENSIONS,
): Promise<CodeFile[]> {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files: CodeFile[] = [];

  for (const entry of entries) {
    if (!entry.isFile()) {
      continue;
    }

    const fileType = classifyFile(entry.name, extensions);
    if (fileType !== undefined) {
      files.push({ fileName: entry.name, fileType });
    }
  }

  return sortCodeFiles(files);
}

/** Reports whether `directory` exists and contains at least one entry. */
export async function directoryHasContent(directory: string): Promise<boolean> {
  try {
    const entries = await fs.readdir(directory);
    return entries.length > 0;
  } catch (error) {
    if (isErrnoException(error) && error.code === "ENOENT") {
      return false;
    }
    throw error;
  }
}

/**
 * Generates a Visual Studio solution beside the caller's source files.
 *
 * Source files are **copied**, never moved: the workspace is left exactly as
 * it was found, so a failed or unwanted generation is undone by deleting the
 * generated folder.
 */
export async function generateSolution(
  options: GenerateOptions,
): Promise<GenerateResult> {
  const { workspaceRoot, templatesDir } = options;
  const extensions = options.extensions ?? DEFAULT_EXTENSIONS;

  const nameError = validateProjectName(options.projectName);
  if (nameError !== undefined) {
    throw new ProjectGenerationError(nameError);
  }
  const projectName = normalizeProjectName(options.projectName);

  await assertTemplatesAvailable(templatesDir);

  const solutionDir = path.join(workspaceRoot, projectName);
  const projectDir = path.join(solutionDir, projectName);
  const solutionPath = path.join(solutionDir, `${projectName}.sln`);

  const files = await collectSourceFiles(workspaceRoot, extensions);

  try {
    await fs.mkdir(projectDir, { recursive: true });
  } catch (error) {
    throw new ProjectGenerationError(
      `Could not create '${projectDir}': ${describe(error)}`,
      { cause: error },
    );
  }

  const projectGuid = createGuid();

  try {
    await writeSolutionFile(solutionPath, templatesDir, {
      projectName,
      projectGuid,
    });
    await writeProjectFiles(projectDir, templatesDir, {
      projectName,
      projectGuid,
      files,
    });
    await copySourceFiles(workspaceRoot, projectDir, files);
  } catch (error) {
    throw new ProjectGenerationError(
      `Could not write project files: ${describe(error)}`,
      { cause: error },
    );
  }

  return { solutionDir, projectDir, solutionPath, files };
}

async function writeSolutionFile(
  solutionPath: string,
  templatesDir: string,
  values: { projectName: string; projectGuid: string },
): Promise<void> {
  const template = await readTemplate(templatesDir, "solution");

  await fs.writeFile(
    solutionPath,
    renderTemplate(template, {
      PROJECT_NAME: values.projectName,
      PROJECT_ID: values.projectGuid,
      SOLUTION_ID: createGuid(),
    }),
    "utf8",
  );
}

async function writeProjectFiles(
  projectDir: string,
  templatesDir: string,
  values: {
    projectName: string;
    projectGuid: string;
    files: readonly CodeFile[];
  },
): Promise<void> {
  const { projectName, projectGuid, files } = values;

  const project = renderTemplate(await readTemplate(templatesDir, "project"), {
    PROJECT_ID: projectGuid,
    ROOT_NAMESPACE: projectName,
    ITEM_GROUPS: buildProjectItemGroups(files),
  });

  const filters = renderTemplate(await readTemplate(templatesDir, "filters"), {
    ITEM_GROUPS: buildFiltersItemGroups(files),
  });

  const user = await readTemplate(templatesDir, "user");

  await Promise.all([
    fs.writeFile(
      path.join(projectDir, `${projectName}.vcxproj`),
      project,
      "utf8",
    ),
    fs.writeFile(
      path.join(projectDir, `${projectName}.vcxproj.filters`),
      filters,
      "utf8",
    ),
    fs.writeFile(
      path.join(projectDir, `${projectName}.vcxproj.user`),
      user,
      "utf8",
    ),
  ]);
}

async function copySourceFiles(
  workspaceRoot: string,
  projectDir: string,
  files: readonly CodeFile[],
): Promise<void> {
  await Promise.all(
    files.map((file) =>
      fs.copyFile(
        path.join(workspaceRoot, file.fileName),
        path.join(projectDir, file.fileName),
      ),
    ),
  );
}

function isErrnoException(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error;
}

function describe(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
