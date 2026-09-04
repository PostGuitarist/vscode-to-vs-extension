import * as fs from "node:fs/promises";
import * as path from "node:path";

/** Template file names shipped in `assets/` (copied to `dist/assets/` at build time). */
export const TEMPLATE_FILES = {
  solution: "template.sln",
  project: "template.vcxproj",
  filters: "template.vcxproj.filters",
  user: "template.vcxproj.user",
} as const;

export type TemplateName = keyof typeof TEMPLATE_FILES;

const PLACEHOLDER = /\{\{([A-Z_]+)\}\}/g;

/**
 * Substitutes `{{PLACEHOLDER}}` tokens in a template.
 *
 * Throws when a token has no value supplied. Silently leaving a placeholder
 * behind produces a project file that Visual Studio opens but cannot build,
 * which is far harder to diagnose than a failed generation.
 */
export function renderTemplate(
  content: string,
  values: Readonly<Record<string, string>>,
): string {
  const missing = new Set<string>();

  const rendered = content.replace(PLACEHOLDER, (match, key: string) => {
    const value = values[key];
    if (value === undefined) {
      missing.add(key);
      return match;
    }
    return value;
  });

  if (missing.size > 0) {
    throw new Error(
      `Template is missing a value for: ${[...missing].sort().join(", ")}`,
    );
  }

  return rendered;
}

/** Reads a template from `templatesDir`. */
export async function readTemplate(
  templatesDir: string,
  name: TemplateName,
): Promise<string> {
  return fs.readFile(path.join(templatesDir, TEMPLATE_FILES[name]), "utf8");
}

/**
 * Verifies every template exists before any files are written, so a broken
 * install fails before it has half-created a project on disk.
 */
export async function assertTemplatesAvailable(
  templatesDir: string,
): Promise<void> {
  const missing: string[] = [];

  for (const fileName of Object.values(TEMPLATE_FILES)) {
    try {
      await fs.access(path.join(templatesDir, fileName));
    } catch {
      missing.push(fileName);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing template file(s) in ${templatesDir}: ${missing.join(", ")}. ` +
        "Try reinstalling the extension.",
    );
  }
}
