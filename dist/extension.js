/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ ((module) => {

module.exports = require("vscode");

/***/ }),
/* 2 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.generateVSProjectFiles = void 0;
const vscode = __webpack_require__(1);
const fs = __webpack_require__(3);
const path = __webpack_require__(4);
const guidGenerator_1 = __webpack_require__(5);
var FileType;
(function (FileType) {
    FileType[FileType["SOURCE"] = 0] = "SOURCE";
    FileType[FileType["TEXT"] = 1] = "TEXT";
    FileType[FileType["HEADER"] = 2] = "HEADER";
})(FileType || (FileType = {}));
function generateVSProjectFiles() {
    // Get the current project name from the workspace folder
    const projectName = vscode.workspace.name;
    if (!projectName) {
        vscode.window.showErrorMessage("No workspace is currently open.");
        return;
    }
    // Folder where the project files will be generated
    const projectDir = path.join(vscode.workspace.rootPath, projectName);
    const projectFolder = path.join(projectDir, projectName);
    // Create the folders
    try {
        // Create the main directory folder
        fs.mkdirSync(projectDir, { recursive: true });
        // Create the project folder inside the main directory
        fs.mkdirSync(projectFolder, { recursive: true });
    }
    catch (error) {
        vscode.window.showErrorMessage("Error creating folders.");
        return;
    }
    // Copy the template files
    try {
        copyFilesRename(projectFolder, projectDir, projectName);
    }
    catch (error) {
        vscode.window.showErrorMessage("Error copying files.");
        return;
    }
    try {
        replaceIdsInSolutionFile(projectName, projectDir);
    }
    catch (error) {
        vscode.window.showErrorMessage("Error replacing IDs.");
        return;
    }
    try {
        copyFiles(vscode.workspace.rootPath, projectFolder);
    }
    catch (error) {
        vscode.window.showErrorMessage("Error copying main files.");
        return;
    }
    try {
        appendFileTypesToFilters(projectFolder, projectName);
    }
    catch (error) {
        vscode.window.showErrorMessage("Error appending file types to filters.");
        return;
    }
    vscode.window.showInformationMessage("Visual Studio project files generated successfully");
}
exports.generateVSProjectFiles = generateVSProjectFiles;
function copyFilesRename(projectFolder, projectDir, projectName) {
    // Copy the template files
    const templateDir = path.join(__dirname, "assets");
    fs.readdirSync(templateDir).forEach((file) => {
        if (file !== "template.sln" && file.startsWith("template.")) {
            fs.copyFileSync(path.join(templateDir, file), path.join(projectFolder, file));
        }
    });
    // Copy the template.sln file to the projectDir
    const slnFile = "template.sln";
    fs.copyFileSync(path.join(templateDir, slnFile), path.join(projectDir, slnFile));
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
function replaceIdsInSolutionFile(projectName, projectDir) {
    const solutionFilePath = path.join(projectDir, `${projectName}.sln`);
    let content = fs.readFileSync(solutionFilePath, "utf-8");
    content = content.replace(/NAME/g, projectName);
    content = content.replace(/PROJECTID/g, (0, guidGenerator_1.generateGUID)());
    content = content.replace(/SOLUTIONID/g, (0, guidGenerator_1.generateGUID)());
    fs.writeFileSync(solutionFilePath, content, "utf-8");
}
function copyFiles(workingDir, projectFolder) {
    const extensions = [
        ".cpp",
        ".h",
        ".dat",
        ".txt",
    ];
    fs.readdirSync(workingDir).forEach((file) => {
        const ext = path.extname(file);
        if (extensions.includes(ext)) {
            fs.copyFileSync(path.join(workingDir, file), path.join(projectFolder, file));
        }
    });
}
function getFileType(fileName) {
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
function appendFileTypesToFilters(projectFolder, projectName) {
    const ignoreFiles = [
        `${projectName}.vcxproj`,
        `${projectName}.vcxproj.filters`,
        `${projectName}.vcxproj.user`,
    ];
    const codeFiles = fs
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
function appendSecondPartFilter(codeFiles, firstPart) {
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
function appendSecondPartVcxproj(codeFiles, firstPart) {
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


/***/ }),
/* 3 */
/***/ ((module) => {

module.exports = require("fs");

/***/ }),
/* 4 */
/***/ ((module) => {

module.exports = require("path");

/***/ }),
/* 5 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.generateGUID = void 0;
function generateGUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
exports.generateGUID = generateGUID;


/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.deactivate = exports.activate = void 0;
const vscode = __webpack_require__(1);
const projectGenerator_1 = __webpack_require__(2);
function activate(context) {
    // Register the command
    let disposable = vscode.commands.registerCommand('extension.generateCppSolution', async () => {
        try {
            // Run the generateSolutionFiles function
            (0, projectGenerator_1.generateVSProjectFiles)();
        }
        catch (error) {
            // Show an error message
            vscode.window.showErrorMessage(`Error executing: ${error}`);
        }
    });
    // Register the command
    context.subscriptions.push(disposable);
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;

})();

module.exports = __webpack_exports__;
/******/ })()
;
//# sourceMappingURL=extension.js.map