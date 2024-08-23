import path from "path";
import * as fs from "fs";
import { generateGUID } from "./guidGenerator";

export function copyTemplateFiles(
  projectFolder: string,
  projectDir: string,
  projectName: string
) {
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
  fs.readdirSync(projectFolder).forEach((file) => {
    if (file.startsWith("template.")) {
      const newFileName = file.replace("template", projectName);
      fs.renameSync(
        path.join(projectFolder, file),
        path.join(projectFolder, newFileName)
      );
    }
  });

  // Rename the template.sln file
  const oldPath = path.join(projectDir, "template.sln");
  const newPath = path.join(projectDir, `${projectName}.sln`);
  fs.renameSync(oldPath, newPath);
}

export function copyFiles(workingDir: string, projectFolder: string) {
  const extensions = [".cpp", ".h", ".dat", ".txt"];

  fs.readdirSync(workingDir).forEach((file) => {
    const ext = path.extname(file);

    if (extensions.includes(ext)) {
      fs.copyFileSync(
        path.join(workingDir, file),
        path.join(projectFolder, file)
      );
    }
  });

  // Delete the original files
  fs.readdirSync(workingDir).forEach((file) => {
    const ext = path.extname(file);

    if (extensions.includes(ext)) {
      fs.unlinkSync(path.join(workingDir, file));
    }
  });

  // Delete the compiled files
  fs.readdirSync(workingDir).forEach((file) => {
    const ext = path.extname(file);

    if (ext === ".exe" || ext === ".obj" || ext === "") {
      fs.unlinkSync(path.join(workingDir, file));
    }
  });
}

export function replaceIdsInSolutionFile(projectName: string, projectDir: string) {
  const solutionFilePath = path.join(projectDir, `${projectName}.sln`);
  let content = fs.readFileSync(solutionFilePath, "utf-8");

  content = content.replace(/NAME/g, projectName);
  content = content.replace(/PROJECTID/g, generateGUID());
  content = content.replace(/SOLUTIONID/g, generateGUID());

  fs.writeFileSync(solutionFilePath, content, "utf-8");
}