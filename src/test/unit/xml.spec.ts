import { describe, expect, it } from "vitest";

import { escapeXmlAttribute, escapeXmlText } from "../../core/xml";

describe("escapeXmlText", () => {
  it("escapes the XML metacharacters", () => {
    expect(escapeXmlText("a & b < c > d")).toBe("a &amp; b &lt; c &gt; d");
  });

  it("escapes ampersands before the entities it introduces", () => {
    expect(escapeXmlText("&<")).toBe("&amp;&lt;");
  });

  it("leaves quotes alone", () => {
    expect(escapeXmlText(`"'`)).toBe(`"'`);
  });

  it("returns ordinary text unchanged", () => {
    expect(escapeXmlText("main.cpp")).toBe("main.cpp");
  });
});

describe("escapeXmlAttribute", () => {
  it("escapes quotes in addition to the metacharacters", () => {
    expect(escapeXmlAttribute(`say "hi" & 'bye'`)).toBe(
      "say &quot;hi&quot; &amp; &apos;bye&apos;",
    );
  });

  it("keeps a file name with an ampersand well-formed", () => {
    expect(escapeXmlAttribute("rock & roll.cpp")).toBe("rock &amp; roll.cpp");
  });
});
