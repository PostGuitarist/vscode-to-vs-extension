import { describe, expect, it } from "vitest";

import { CodeFile, FileType } from "../../core/fileTypes";
import {
  buildFiltersItemGroups,
  buildProjectItemGroups,
} from "../../core/itemGroups";

const files: CodeFile[] = [
  { fileName: "main.cpp", fileType: FileType.Source },
  { fileName: "stack.h", fileType: FileType.Header },
  { fileName: "input.txt", fileType: FileType.Text },
];

describe("buildProjectItemGroups", () => {
  it("renders one group per file type using the MSBuild element for each", () => {
    expect(buildProjectItemGroups(files)).toBe(
      [
        "  <ItemGroup>",
        '    <ClCompile Include="main.cpp" />',
        "  </ItemGroup>",
        "  <ItemGroup>",
        '    <ClInclude Include="stack.h" />',
        "  </ItemGroup>",
        "  <ItemGroup>",
        '    <Text Include="input.txt" />',
        "  </ItemGroup>",
      ].join("\n"),
    );
  });

  it("returns an empty string when there are no files", () => {
    expect(buildProjectItemGroups([])).toBe("");
  });

  it("omits groups that have no files rather than emitting empty ones", () => {
    const output = buildProjectItemGroups([
      { fileName: "main.cpp", fileType: FileType.Source },
    ]);

    expect(output).toContain("ClCompile");
    expect(output).not.toContain("ClInclude");
    expect(output).not.toContain("<Text");
    expect(output.match(/<ItemGroup>/g)).toHaveLength(1);
  });

  it("puts several files of the same type in one group", () => {
    const output = buildProjectItemGroups([
      { fileName: "b.cpp", fileType: FileType.Source },
      { fileName: "a.cpp", fileType: FileType.Source },
    ]);

    expect(output).toBe(
      [
        "  <ItemGroup>",
        '    <ClCompile Include="a.cpp" />',
        '    <ClCompile Include="b.cpp" />',
        "  </ItemGroup>",
      ].join("\n"),
    );
  });

  it("escapes characters that would otherwise break the XML", () => {
    const output = buildProjectItemGroups([
      { fileName: `rock & "roll".cpp`, fileType: FileType.Source },
    ]);

    expect(output).toContain(
      '<ClCompile Include="rock &amp; &quot;roll&quot;.cpp" />',
    );
  });

  it("orders files deterministically regardless of input order", () => {
    const shuffled = [...files].reverse();

    expect(buildProjectItemGroups(shuffled)).toBe(
      buildProjectItemGroups(files),
    );
  });
});

describe("buildFiltersItemGroups", () => {
  it("assigns each file to a Solution Explorer filter", () => {
    expect(buildFiltersItemGroups(files)).toBe(
      [
        "  <ItemGroup>",
        '    <ClCompile Include="main.cpp">',
        "      <Filter>Source Files</Filter>",
        "    </ClCompile>",
        "  </ItemGroup>",
        "  <ItemGroup>",
        '    <ClInclude Include="stack.h">',
        "      <Filter>Header Files</Filter>",
        "    </ClInclude>",
        "  </ItemGroup>",
        "  <ItemGroup>",
        '    <Text Include="input.txt">',
        "      <Filter>Source Files</Filter>",
        "    </Text>",
        "  </ItemGroup>",
      ].join("\n"),
    );
  });

  it("returns an empty string when there are no files", () => {
    expect(buildFiltersItemGroups([])).toBe("");
  });

  it("escapes the Include attribute", () => {
    const output = buildFiltersItemGroups([
      { fileName: "a&b.h", fileType: FileType.Header },
    ]);

    expect(output).toContain('<ClInclude Include="a&amp;b.h">');
  });
});
