import { describe, expect, it } from "vitest";

import {
  normalizeProjectName,
  validateProjectName,
} from "../../core/projectName";

describe("validateProjectName", () => {
  it.each(["Game", "my project", "Chapter-07", "assignment_3", "a"])(
    "accepts %s",
    (name) => {
      expect(validateProjectName(name)).toBeUndefined();
    },
  );

  it("accepts a name that only needs trimming", () => {
    expect(validateProjectName("  Game  ")).toBeUndefined();
  });

  it.each([undefined, "", "   "])("rejects %s as empty", (name) => {
    expect(validateProjectName(name)).toBe("A project name is required.");
  });

  it.each([
    "../escape",
    "sub/dir",
    "sub\\dir",
    "a:b",
    "what?",
    "star*",
    "q<u>ote",
  ])("rejects %s for containing an invalid character", (name) => {
    expect(validateProjectName(name)).toContain("cannot contain");
  });

  it("rejects control characters", () => {
    expect(validateProjectName("bell\u0007")).toContain("cannot contain");
  });

  it.each([".", ".."])("rejects the relative path %s", (name) => {
    expect(validateProjectName(name)).toBeDefined();
  });

  it.each(["CON", "con", "nul", "COM1", "lpt9"])(
    "rejects the reserved Windows name %s",
    (name) => {
      expect(validateProjectName(name)).toContain("reserved by Windows");
    },
  );

  it("allows a reserved name used as a prefix", () => {
    expect(validateProjectName("console")).toBeUndefined();
  });

  it("rejects a trailing period", () => {
    expect(validateProjectName("Game.")).toContain("cannot end with a period");
  });

  it("rejects an over-long name", () => {
    expect(validateProjectName("a".repeat(101))).toContain(
      "characters or fewer",
    );
  });

  it("accepts a name at the length limit", () => {
    expect(validateProjectName("a".repeat(100))).toBeUndefined();
  });
});

describe("normalizeProjectName", () => {
  it("trims surrounding whitespace", () => {
    expect(normalizeProjectName("  Game \n")).toBe("Game");
  });
});
