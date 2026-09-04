import * as path from "node:path";

import { describe, expect, it } from "vitest";

import {
  TEMPLATE_FILES,
  assertTemplatesAvailable,
  readTemplate,
  renderTemplate,
} from "../../core/templates";

const TEMPLATES_DIR = path.resolve(process.cwd(), "assets");

describe("renderTemplate", () => {
  it("substitutes every occurrence of a placeholder", () => {
    expect(renderTemplate("{{NAME}}/{{NAME}}.vcxproj", { NAME: "Game" })).toBe(
      "Game/Game.vcxproj",
    );
  });

  it("leaves single-brace text alone", () => {
    const guid = "{8BC9CEB8-8B4A-11D0-8D11-00A0C91BC942}";

    expect(renderTemplate(guid, {})).toBe(guid);
  });

  it("throws when a placeholder has no value", () => {
    expect(() => renderTemplate("{{A}} {{B}}", { A: "1" })).toThrow(
      /missing a value for: B/,
    );
  });

  it("reports every missing placeholder at once", () => {
    expect(() => renderTemplate("{{B}} {{A}} {{B}}", {})).toThrow(
      /missing a value for: A, B/,
    );
  });

  it("does not re-expand placeholders introduced by a value", () => {
    expect(renderTemplate("{{A}}", { A: "{{A}}" })).toBe("{{A}}");
  });
});

describe("shipped templates", () => {
  it("includes every file the generator reads", async () => {
    await expect(
      assertTemplatesAvailable(TEMPLATES_DIR),
    ).resolves.toBeUndefined();
  });

  it("reports the files missing from a bad install", async () => {
    await expect(
      assertTemplatesAvailable(path.join(TEMPLATES_DIR, "nope")),
    ).rejects.toThrow(/Missing template file/);
  });

  it.each(Object.keys(TEMPLATE_FILES) as (keyof typeof TEMPLATE_FILES)[])(
    "renders %s with no placeholders left behind",
    async (name) => {
      const rendered = renderTemplate(await readTemplate(TEMPLATES_DIR, name), {
        PROJECT_NAME: "Game",
        PROJECT_ID: "{11111111-1111-4111-8111-111111111111}",
        SOLUTION_ID: "{22222222-2222-4222-8222-222222222222}",
        ROOT_NAMESPACE: "Game",
        ITEM_GROUPS: "",
      });

      expect(rendered).not.toMatch(/\{\{[A-Z_]+\}\}/);
    },
  );

  it.each(["project", "filters", "user"] as const)(
    "closes the %s XML document",
    async (name) => {
      const template = await readTemplate(TEMPLATES_DIR, name);

      expect(template.trimEnd()).toMatch(/<\/Project>$/);
    },
  );
});
