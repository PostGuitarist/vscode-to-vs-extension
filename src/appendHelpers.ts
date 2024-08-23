import path from "path";
import * as fs from "fs";
import { CodeFile, FileType } from "./codeFile";

export function appendFileTypesToFilters(projectFolder: string, projectName: string) {
  const ignoreFiles = [
    `${projectName}.vcxproj`,
    `${projectName}.vcxproj.filters`,
    `${projectName}.vcxproj.user`,
  ];
  const codeFiles: CodeFile[] = fs
    .readdirSync(projectFolder)
    .filter((fileName) => !ignoreFiles.includes(fileName))
    .map((fileName) => ({
      fileType: getFileType(fileName),
      fileName: fileName,
    }));

  let firstPart = "";
  const filters = appendSecondPartFilter(codeFiles, firstPart);
  const vcxproj = appendSecondPartVcxproj(codeFiles, firstPart);

  fs.appendFileSync(
    path.join(projectFolder, `${projectName}.vcxproj.filters`),
    filters
  );
  fs.appendFileSync(
    path.join(projectFolder, `${projectName}.vcxproj`),
    vcxproj
  );
}

function appendSecondPartFilter(
  codeFiles: CodeFile[],
  firstPart: string
): string {
  let itemGroup = "\n  <ItemGroup>";
  let compile = itemGroup;
  let text = itemGroup;
  let header = itemGroup;

  for (let file of codeFiles) {
    if (file) {
      switch (file.fileType) {
        case FileType.SOURCE:
          compile += `\n    <ClCompile Include="${file.fileName}">\n      <Filter>Source Files</Filter>\n    </ClCompile>`;
          break;
        case FileType.TEXT:
          text += `\n    <Text Include="${file.fileName}">\n      <Filter>Source Files</Filter>\n    </Text>`;
          break;
        case FileType.HEADER:
          header += `\n    <ClInclude Include="${file.fileName}">\n      <Filter>Header Files</Filter>\n    </ClInclude>`;
          break;
      }
    }
  }

  if (compile !== itemGroup) {
    compile += "\n  </ItemGroup>";
    firstPart += compile;
  }
  if (text !== itemGroup) {
    text += "\n  </ItemGroup>";
    firstPart += text;
  }
  if (header !== itemGroup) {
    header += "\n  </ItemGroup>";
    firstPart += header;
  }

  firstPart += "\n</Project>";

  return firstPart;
}

function appendSecondPartVcxproj(
  codeFiles: CodeFile[],
  firstPart: string
): string {
  let itemGroup = "\n  <ItemGroup>";
  let compile = itemGroup;
  let text = itemGroup;
  let header = itemGroup;

  for (let file of codeFiles) {
    if (file) {
      switch (file.fileType) {
        case FileType.SOURCE:
          compile += `\n    <ClCompile Include="${file.fileName}" />`;
          break;
        case FileType.TEXT:
          text += `\n    <Text Include="${file.fileName}" />`;
          break;
        case FileType.HEADER:
          header += `\n    <ClInclude Include="${file.fileName}" />`;
          break;
      }
    }
  }

  if (compile !== itemGroup) {
    compile += "\n  </ItemGroup>";
    firstPart += compile;
  }

  if (text !== itemGroup) {
    text += "\n  </ItemGroup>";
    firstPart += text;
  }

  if (header !== itemGroup) {
    header += "\n  </ItemGroup>";
    firstPart += header;
  }

  firstPart +=
    '\n  <Import Project="$(VCTargetsPath)\\Microsoft.Cpp.targets" />\n  <ImportGroup Label="ExtensionTargets">\n  </ImportGroup>\n</Project>';

  return firstPart;
}

function getFileType(fileName: string): FileType {
  const ext = path.extname(fileName);
  switch (ext) {
    case ".cpp":
      return FileType.SOURCE;
    case ".h":
      return FileType.HEADER;
    case ".dat":
    case ".txt":
    default:
      return FileType.TEXT;
  }
}
