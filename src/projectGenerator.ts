import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export function generateVSProjectFiles() {
    // Get the current project name
    const projectName = path.basename(process.cwd());

    // Validate the project name
    const validNameRegex = /^[^<>:"/\\|?*\x00-\x1F]+$/;
    if (!validNameRegex.test(projectName)) {
        vscode.window.showErrorMessage('Invalid project name. The project name contains invalid characters.');
        return;
    }

    // Define the directories and files to be created
    const directories = [`${projectName}`, `${projectName}/src`, `${projectName}/test`];
    const files = [
        { srcPath: 'src/assets/sln', destPath: `${projectName}/${projectName}.sln` },
        { srcPath: 'src/assets/vcxproj', destPath: `${projectName}/src/${projectName}.vcxproj` },
        { srcPath: 'src/assets/vcxproj.filters', destPath: `${projectName}/src/${projectName}.vcxproj.filters` },
        // Add more files as needed
    ];

    // Create the directories
    directories.forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    });

    // Copy the files
    files.forEach(file => {
        const srcPath = path.join(__dirname, file.srcPath);
        const destPath = path.join(__dirname, file.destPath);
        if (!fs.existsSync(srcPath)) {
            vscode.window.showErrorMessage(`Source file ${srcPath} does not exist.`);
            return;
        }
        fs.copyFileSync(srcPath, destPath);
    });

    // Get all .cpp and .h files in the current working directory
    const sourceFilesDir = process.cwd();
    const sourceFiles = fs.readdirSync(sourceFilesDir)
        .filter(file => {
            const filePath = path.join(sourceFilesDir, file);
            return (file.endsWith('.cpp') || file.endsWith('.h') || file.endsWith('.hpp') || file.endsWith('.c') || file.endsWith('.txt') || file.endsWith('.md') || file.endsWith('.json') || file.endsWith('.xml')) && fs.existsSync(filePath);
        })
        .map(file => ({
            path: path.join(`${projectName}/src`, file),
            content: fs.readFileSync(path.join(sourceFilesDir, file), 'utf8')
    }));

    // Create the source files
    sourceFiles.forEach(file => {
        const destPath = path.join(__dirname, file.path);
        fs.writeFileSync(destPath, file.content);
    });

    vscode.window.showInformationMessage('Visual Studio project files generated successfully');
}