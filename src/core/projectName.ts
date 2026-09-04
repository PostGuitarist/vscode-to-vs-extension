/** Characters Windows forbids in a file or directory name, plus control characters. */
// eslint-disable-next-line no-control-regex
const INVALID_CHARACTERS = /[<>:"/\\|?*\u0000-\u001f]/;

/** Device names Windows reserves regardless of the extension used. */
const RESERVED_NAMES = new Set([
  "con",
  "prn",
  "aux",
  "nul",
  ...Array.from({ length: 9 }, (_, index) => `com${index + 1}`),
  ...Array.from({ length: 9 }, (_, index) => `lpt${index + 1}`),
]);

const MAX_LENGTH = 100;

/**
 * Validates a project name, returning a human-readable problem description or
 * `undefined` when the name is usable.
 *
 * The name becomes two directory names and four file names on disk, so it is
 * checked against Windows' rules even when the extension runs on Linux or
 * macOS: the generated solution is meant to be opened on Windows. Rejecting
 * separators and `..` also keeps generation inside the workspace folder.
 */
export function validateProjectName(
  name: string | undefined,
): string | undefined {
  if (name === undefined) {
    return "A project name is required.";
  }

  const trimmed = name.trim();

  if (trimmed === "") {
    return "A project name is required.";
  }
  if (trimmed.length > MAX_LENGTH) {
    return `The project name must be ${MAX_LENGTH} characters or fewer.`;
  }
  if (INVALID_CHARACTERS.test(trimmed)) {
    return 'A project name cannot contain < > : " / \\ | ? *';
  }
  if (trimmed === "." || trimmed === "..") {
    return "A project name cannot be '.' or '..'.";
  }
  if (RESERVED_NAMES.has(trimmed.toLowerCase())) {
    return `'${trimmed}' is a name reserved by Windows.`;
  }
  if (trimmed.endsWith(".")) {
    return "A project name cannot end with a period.";
  }

  return undefined;
}

/**
 * Trims a raw project name. Call only after {@link validateProjectName} has
 * accepted it.
 */
export function normalizeProjectName(name: string): string {
  return name.trim();
}
