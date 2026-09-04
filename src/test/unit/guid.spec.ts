import { describe, expect, it } from "vitest";

import { createGuid } from "../../core/guid";

describe("createGuid", () => {
  it("produces a brace-wrapped upper-case GUID", () => {
    expect(createGuid()).toMatch(
      /^\{[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}\}$/,
    );
  });

  it("produces a distinct value on every call", () => {
    const guids = new Set(Array.from({ length: 500 }, () => createGuid()));

    expect(guids.size).toBe(500);
  });
});
