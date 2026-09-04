import { randomUUID } from "node:crypto";

/**
 * Creates a GUID in the brace-wrapped, upper-case form that Visual Studio
 * writes into `.sln` and `.vcxproj` files, e.g. `{4F0C1E2B-...-9A1D}`.
 *
 * The braces are part of the returned value because every place these GUIDs
 * are substituted (`ProjectGuid`, `SolutionGuid`, the solution's project
 * entries) expects them.
 */
export function createGuid(): string {
  return `{${randomUUID().toUpperCase()}}`;
}
