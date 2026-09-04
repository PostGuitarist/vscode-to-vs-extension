import { describe, expect, it } from "vitest";

import {
  DEFAULT_EXTENSIONS,
  FileType,
  classifyFile,
  normalizeExtensionMap,
  normalizeExtensions,
  sortCodeFiles,
} from "../../core/fileTypes";

describe("normalizeExtensions", () => {
  it("adds a missing leading dot", () => {
    expect(normalizeExtensions(["cpp"])).toEqual([".cpp"]);
  });

  it("lower-cases and trims", () => {
    expect(normalizeExtensions(["  .CPP  "])).toEqual([".cpp"]);
  });

  it("removes duplicates introduced by normalisation", () => {
    expect(normalizeExtensions([".cpp", "CPP", " cpp "])).toEqual([".cpp"]);
  });

  it("drops blank and dot-only entries", () => {
    expect(normalizeExtensions(["", "   ", ".", ".h"])).toEqual([".h"]);
  });
});

describe("normalizeExtensionMap", () => {
  it("normalises every list", () => {
    const map = normalizeExtensionMap({
      [FileType.Source]: ["CPP"],
      [FileType.Header]: [" .H "],
      [FileType.Text]: ["txt", "txt"],
    });

    expect(map).toEqual({
      [FileType.Source]: [".cpp"],
      [FileType.Header]: [".h"],
      [FileType.Text]: [".txt"],
    });
  });
});

describe("classifyFile", () => {
  it.each([
    ["main.cpp", FileType.Source],
    ["util.c", FileType.Source],
    ["shape.cc", FileType.Source],
    ["shape.hpp", FileType.Header],
    ["stack.h", FileType.Header],
    ["input.txt", FileType.Text],
    ["scores.dat", FileType.Text],
  ])("classifies %s as %s", (fileName, expected) => {
    expect(classifyFile(fileName)).toBe(expected);
  });

  it("is case-insensitive about the extension", () => {
    expect(classifyFile("MAIN.CPP")).toBe(FileType.Source);
  });

  it("ignores files with an unrecognised extension", () => {
    expect(classifyFile("a.out.exe")).toBeUndefined();
    expect(classifyFile("main.o")).toBeUndefined();
    expect(classifyFile("notes.md")).toBeUndefined();
  });

  it("ignores extensionless names, which used to be deleted as build output", () => {
    expect(classifyFile("Makefile")).toBeUndefined();
    expect(classifyFile("a.out")).toBe(undefined);
    expect(classifyFile("src")).toBeUndefined();
  });

  it("treats a dotfile as extensionless", () => {
    expect(classifyFile(".gitignore")).toBeUndefined();
  });

  it("honours a custom extension map", () => {
    const map = {
      [FileType.Source]: ["cu"],
      [FileType.Header]: [".cuh"],
      [FileType.Text]: [],
    };

    expect(classifyFile("kernel.cu", map)).toBe(FileType.Source);
    expect(classifyFile("kernel.cuh", map)).toBe(FileType.Header);
    expect(classifyFile("main.cpp", map)).toBeUndefined();
  });

  it("defaults to the shipped extension map", () => {
    expect(classifyFile("main.cpp", DEFAULT_EXTENSIONS)).toBe(FileType.Source);
  });
});

describe("sortCodeFiles", () => {
  it("groups by type and sorts by name, case-insensitively", () => {
    const sorted = sortCodeFiles([
      { fileName: "notes.txt", fileType: FileType.Text },
      { fileName: "Zebra.h", fileType: FileType.Header },
      { fileName: "apple.h", fileType: FileType.Header },
      { fileName: "main.cpp", fileType: FileType.Source },
    ]);

    expect(sorted.map((file) => file.fileName)).toEqual([
      "main.cpp",
      "apple.h",
      "Zebra.h",
      "notes.txt",
    ]);
  });

  it("does not mutate its input", () => {
    const files = [
      { fileName: "b.h", fileType: FileType.Header },
      { fileName: "a.cpp", fileType: FileType.Source },
    ];

    sortCodeFiles(files);

    expect(files[0]?.fileName).toBe("b.h");
  });
});
