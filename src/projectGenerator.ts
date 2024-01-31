import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { generateGUID } from './guidGenerator';
import { CodeFile, FileType } from './codeFile';

export async function generateVSProjectFiles() {
  // Get the current project name from the workspace folder
  const inWorkspace = vscode.workspace.name;

  if (!inWorkspace) {
    vscode.window.showErrorMessage("No workspace is currently open.");
    return;
  }

  // Get input from user for the project name
  const newName = await vscode.window.showInputBox({
    prompt: "Enter the project name",
    value: vscode.workspace.name,
  });

  // Folder where the project files will be generated
  const projectDir = path.join(vscode.workspace.rootPath!, newName!);
  const projectFolder = path.join(projectDir, newName!);

  // Create the folders
  try {
    // Create the main directory folder
    fs.mkdirSync(projectDir, { recursive: true });

    // Create the project folder inside the main directory
    fs.mkdirSync(projectFolder, { recursive: true });
  } catch (error) {
    vscode.window.showErrorMessage("Error creating folders.");
    return;
  }

  // Copy the template files
  try {
    copyFilesRename(projectFolder, projectDir, newName!);
  } catch (error) {
    vscode.window.showErrorMessage("Error copying files.");
    return;
  }

  // Replace the IDs in the solution file
  try {
    replaceIdsInSolutionFile(newName!, projectDir);
  } catch (error) {
    vscode.window.showErrorMessage("Error replacing IDs.");
    return;
  }

  // Copy the main files
  try {
    copyFiles(vscode.workspace.rootPath!, projectFolder);
  } catch (error) {
    vscode.window.showErrorMessage("Error copying main files.");
    return;
  }

  // Append the file types to the filters
  try {
    appendFileTypesToFilters(projectFolder, newName!);
  } catch (error) {
    vscode.window.showErrorMessage("Error appending file types to filters.");
    return;
  }

  vscode.window.showInformationMessage(
    "Visual Studio project files generated successfully"
  );
}

function copyFilesRename(projectFolder: string, projectDir: string, projectName: string) {
  // Copy the template files
  const templateDir = path.join(__dirname, "assets");
  fs.readdirSync(templateDir).forEach((file) => {
    if (file !== "template.sln" && file.startsWith("template.")) {
      fs.copyFileSync(
        path.join(templateDir, file),
        path.join(projectFolder, file)
      );
    }
  });

  // Copy the template.sln file to the projectDir
  const slnFile = "template.sln";
  fs.copyFileSync(
    path.join(templateDir, slnFile),
    path.join(projectDir, slnFile)
  );

  // Rename the template files
  fs.readdirSync(projectFolder).forEach(file => {
    if (file.startsWith('template.')) {
      const newFileName = file.replace('template', projectName);
      fs.renameSync(path.join(projectFolder, file), path.join(projectFolder, newFileName));
    }
  });

  // Rename the template.sln file
  const oldPath = path.join(projectDir, 'template.sln');
  const newPath = path.join(projectDir, `${projectName}.sln`);
  fs.renameSync(oldPath, newPath);

}

function replaceIdsInSolutionFile(projectName: string, projectDir: string) {
  const solutionFilePath = path.join(projectDir, `${projectName}.sln`);
  let content = fs.readFileSync(solutionFilePath, "utf-8");

  content = content.replace(/NAME/g, projectName);
  content = content.replace(/PROJECTID/g, generateGUID());
  content = content.replace(/SOLUTIONID/g, generateGUID());

  console.log(generateGUID());

  fs.writeFileSync(solutionFilePath, content, "utf-8");
}

function copyFiles(workingDir: string, projectFolder: string) {
  const extensions = [
    ".cpp",
    ".h",
    ".dat",
    ".txt",
  ];

  fs.readdirSync(workingDir).forEach((file) => {
    const ext = path.extname(file);

    if (extensions.includes(ext)) {
      fs.copyFileSync(
        path.join(workingDir, file),
        path.join(projectFolder, file)
      );
    }
  });
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

function appendFileTypesToFilters(projectFolder: string, projectName: string) {
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

  fs.appendFileSync(path.join(projectFolder, `${projectName}.vcxproj.filters`), filters);
  fs.appendFileSync(path.join(projectFolder, `${projectName}.vcxproj`), vcxproj);
}

function appendSecondPartFilter(codeFiles: CodeFile[], firstPart: string): string {
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

function appendSecondPartVcxproj(codeFiles: CodeFile[], firstPart: string): string {
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

  firstPart += "\n  <Import Project=\"$(VCTargetsPath)\\Microsoft.Cpp.targets\" />\n  <ImportGroup Label=\"ExtensionTargets\">\n  </ImportGroup>\n</Project>";

  return firstPart;
}