import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { generateGUID } from './guidGenerator';

export function generateVSProjectFiles() {
  // Get the current project name from the workspace folder
  const projectName = vscode.workspace.name;

  console.log(projectName);

  if (!projectName) {
    vscode.window.showErrorMessage("No workspace is currently open.");
    return;
  }

  // Folder where the project files will be generated
  const projectDir = path.join(vscode.workspace.rootPath!, projectName);
  const projectFolder = path.join(projectDir, projectName);

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
    copyFilesRename(projectFolder, projectDir, projectName);
  } catch (error) {
    vscode.window.showErrorMessage("Error copying files.");
    return;
  }

  try {
    replaceIdsInSolutionFile(projectName, projectDir);
  } catch (error) {
    vscode.window.showErrorMessage("Error replacing IDs.");
    return;
  }

  try {
    copyFiles(vscode.workspace.rootPath!, projectFolder);
  } catch (error) {
    vscode.window.showErrorMessage("Error copying main files.");
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

  fs.writeFileSync(solutionFilePath, content, "utf-8");
}

function copyFiles(workingDir: string, projectFolder: string) {
  const extensions = [
    ".cpp",
    ".h",
    ".hpp",
    ".c",
    ".txt",
    ".md",
    ".json",
    ".xml",
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