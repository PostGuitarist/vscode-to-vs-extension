import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { FileType } from "../../core/fileTypes";
import {
  ProjectGenerationError,
  collectSourceFiles,
  directoryHasContent,
  generateSolution,
} from "../../core/generator";

const TEMPLATES_DIR = path.resolve(process.cwd(), "assets");

let workspace: string;

beforeEach(async () => {
  workspace = await fs.mkdtemp(path.join(os.tmpdir(), "vscode-to-vs-"));
});

afterEach(async () => {
  await fs.rm(workspace, { recursive: true, force: true });
});

async function write(relativePath: string, contents = ""): Promise<void> {
  const target = path.join(workspace, relativePath);
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, contents, "utf8");
}

async function listNames(directory: string): Promise<string[]> {
  return (await fs.readdir(directory)).sort();
}

describe("collectSourceFiles", () => {
  it("collects recognised files and classifies them", async () => {
    await write("main.cpp");
    await write("stack.h");
    await write("input.txt");

    expect(await collectSourceFiles(workspace)).toEqual([
      { fileName: "main.cpp", fileType: FileType.Source },
      { fileName: "stack.h", fileType: FileType.Header },
      { fileName: "input.txt", fileType: FileType.Text },
    ]);
  });

  it("ignores unrecognised files, including build output", async () => {
    await write("main.cpp");
    await write("a.out");
    await write("main.o");
    await write("program.exe");
    await write("README.md");

    expect(await collectSourceFiles(workspace)).toEqual([
      { fileName: "main.cpp", fileType: FileType.Source },
    ]);
  });

  it("ignores sub-directories", async () => {
    await write("main.cpp");
    await fs.mkdir(path.join(workspace, "build"));
    await write("include/stack.h");

    expect(await collectSourceFiles(workspace)).toEqual([
      { fileName: "main.cpp", fileType: FileType.Source },
    ]);
  });

  it("returns an empty list for a directory with nothing to collect", async () => {
    expect(await collectSourceFiles(workspace)).toEqual([]);
  });
});

describe("directoryHasContent", () => {
  it("is false for a directory that does not exist", async () => {
    expect(await directoryHasContent(path.join(workspace, "nope"))).toBe(false);
  });

  it("is false for an empty directory", async () => {
    expect(await directoryHasContent(workspace)).toBe(false);
  });

  it("is true once the directory holds something", async () => {
    await write("main.cpp");

    expect(await directoryHasContent(workspace)).toBe(true);
  });

  it("propagates errors other than a missing directory", async () => {
    await write("main.cpp");

    await expect(
      directoryHasContent(path.join(workspace, "main.cpp")),
    ).rejects.toThrow();
  });
});

describe("generateSolution", () => {
  async function generate(projectName = "Game") {
    return generateSolution({
      workspaceRoot: workspace,
      templatesDir: TEMPLATES_DIR,
      projectName,
    });
  }

  it("creates the solution and project layout Visual Studio expects", async () => {
    await write("main.cpp");
    await write("stack.h");

    const result = await generate();

    expect(result.solutionDir).toBe(path.join(workspace, "Game"));
    expect(result.projectDir).toBe(path.join(workspace, "Game", "Game"));
    expect(result.solutionPath).toBe(path.join(workspace, "Game", "Game.sln"));

    expect(await listNames(result.solutionDir)).toEqual(["Game", "Game.sln"]);
    expect(await listNames(result.projectDir)).toEqual([
      "Game.vcxproj",
      "Game.vcxproj.filters",
      "Game.vcxproj.user",
      "main.cpp",
      "stack.h",
    ]);
  });

  it("copies source files without touching the originals", async () => {
    await write("main.cpp", "int main() { return 0; }");
    await write("a.out");
    await write("notes.md");
    await fs.mkdir(path.join(workspace, "build"));

    const result = await generate();

    // Everything that was in the workspace is still there.
    expect(await listNames(workspace)).toEqual([
      "Game",
      "a.out",
      "build",
      "main.cpp",
      "notes.md",
    ]);

    expect(
      await fs.readFile(path.join(result.projectDir, "main.cpp"), "utf8"),
    ).toBe("int main() { return 0; }");
  });

  it("gives the solution and project the same project GUID", async () => {
    const result = await generate();

    const solution = await fs.readFile(result.solutionPath, "utf8");
    const project = await fs.readFile(
      path.join(result.projectDir, "Game.vcxproj"),
      "utf8",
    );

    const guid = /<ProjectGuid>(\{[0-9A-F-]+\})<\/ProjectGuid>/.exec(
      project,
    )?.[1];

    expect(guid).toBeDefined();
    expect(solution).toContain(guid!);
    expect(solution).toContain(`"Game", "Game\\Game.vcxproj", "${guid!}"`);
  });

  it("gives the solution a GUID of its own", async () => {
    const result = await generate();
    const solution = await fs.readFile(result.solutionPath, "utf8");

    const projectGuid =
      /Project\("\{8BC9CEB8[^}]*\}"\) = "Game", "[^"]*", "(\{[0-9A-F-]+\})"/.exec(
        solution,
      )?.[1];
    const solutionGuid = /SolutionGuid = (\{[0-9A-F-]+\})/.exec(solution)?.[1];

    expect(projectGuid).toBeDefined();
    expect(solutionGuid).toBeDefined();
    expect(solutionGuid).not.toBe(projectGuid);
  });

  it("leaves no placeholder behind in any generated file", async () => {
    await write("main.cpp");

    const result = await generate();

    for (const file of [
      result.solutionPath,
      path.join(result.projectDir, "Game.vcxproj"),
      path.join(result.projectDir, "Game.vcxproj.filters"),
      path.join(result.projectDir, "Game.vcxproj.user"),
    ]) {
      expect(await fs.readFile(file, "utf8")).not.toMatch(/\{\{[A-Z_]+\}\}/);
    }
  });

  it("lists collected files in the project and its filters", async () => {
    await write("main.cpp");
    await write("stack.h");
    await write("input.txt");

    const result = await generate();

    const project = await fs.readFile(
      path.join(result.projectDir, "Game.vcxproj"),
      "utf8",
    );
    const filters = await fs.readFile(
      path.join(result.projectDir, "Game.vcxproj.filters"),
      "utf8",
    );

    expect(project).toContain('<ClCompile Include="main.cpp" />');
    expect(project).toContain('<ClInclude Include="stack.h" />');
    expect(project).toContain('<Text Include="input.txt" />');

    expect(filters).toContain('<ClCompile Include="main.cpp">');
    expect(filters).toContain("<Filter>Header Files</Filter>");
  });

  it("places the file item groups before the C++ targets import", async () => {
    await write("main.cpp");

    const result = await generate();
    const project = await fs.readFile(
      path.join(result.projectDir, "Game.vcxproj"),
      "utf8",
    );

    expect(project.indexOf("<ClCompile Include=")).toBeLessThan(
      project.indexOf("Microsoft.Cpp.targets"),
    );
  });

  it("uses the project name as the root namespace", async () => {
    const result = await generate();

    expect(
      await fs.readFile(path.join(result.projectDir, "Game.vcxproj"), "utf8"),
    ).toContain("<RootNamespace>Game</RootNamespace>");
  });

  it("succeeds when the workspace has no source files", async () => {
    const result = await generate();

    expect(result.files).toEqual([]);
    expect(await listNames(result.projectDir)).toEqual([
      "Game.vcxproj",
      "Game.vcxproj.filters",
      "Game.vcxproj.user",
    ]);
  });

  it("does not pick up files from a previous run", async () => {
    await write("main.cpp");
    await generate();

    const second = await generateSolution({
      workspaceRoot: workspace,
      templatesDir: TEMPLATES_DIR,
      projectName: "Second",
    });

    expect(second.files.map((file) => file.fileName)).toEqual(["main.cpp"]);
  });

  it("honours a custom extension map", async () => {
    await write("kernel.cu");
    await write("main.cpp");

    const result = await generateSolution({
      workspaceRoot: workspace,
      templatesDir: TEMPLATES_DIR,
      projectName: "Game",
      extensions: {
        [FileType.Source]: ["cu"],
        [FileType.Header]: [],
        [FileType.Text]: [],
      },
    });

    expect(result.files).toEqual([
      { fileName: "kernel.cu", fileType: FileType.Source },
    ]);
  });

  it("trims the project name", async () => {
    const result = await generate("  Game  ");

    expect(result.solutionDir).toBe(path.join(workspace, "Game"));
  });

  it("overwrites the files it owns when run twice", async () => {
    await write("main.cpp");
    await generate();
    await write("extra.h");

    const result = await generate();

    expect(
      await fs.readFile(
        path.join(result.projectDir, "Game.vcxproj.filters"),
        "utf8",
      ),
    ).toContain('Include="extra.h"');
  });

  it.each(["../escape", "sub/dir", "", "CON"])(
    "rejects the invalid project name %o",
    async (projectName) => {
      await expect(generate(projectName)).rejects.toBeInstanceOf(
        ProjectGenerationError,
      );

      expect(await listNames(workspace)).toEqual([]);
    },
  );

  it("reports a helpful error when the target path is a file", async () => {
    await write("Game");

    await expect(generate()).rejects.toThrow(/Could not create/);
  });

  it("fails before creating anything when templates are missing", async () => {
    await expect(
      generateSolution({
        workspaceRoot: workspace,
        templatesDir: path.join(workspace, "missing"),
        projectName: "Game",
      }),
    ).rejects.toThrow(/Missing template file/);

    expect(await listNames(workspace)).toEqual([]);
  });
});
