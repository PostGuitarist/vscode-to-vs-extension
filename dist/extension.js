/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(__webpack_require__(1));
const projectGenerator_1 = __webpack_require__(2);
function activate(context) {
    console.log('Extension "vscode-to-vs" is now active!');
    // Register the command
    const disposable = vscode.commands.registerCommand('vscode-to-vs.generateCppSolution', async () => {
        try {
            (0, projectGenerator_1.generateVSProjectFiles)();
        }
        catch (error) {
            vscode.window.showErrorMessage(`Error generating project files: ${error}`);
        }
    });
    context.subscriptions.push(disposable);
}
// Called when extension is deactivated
function deactivate() { }


/***/ }),
/* 1 */
/***/ ((module) => {

module.exports = require("vscode");

/***/ }),
/* 2 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.generateVSProjectFiles = generateVSProjectFiles;
const vscode = __importStar(__webpack_require__(1));
const fs = __importStar(__webpack_require__(3));
const path = __importStar(__webpack_require__(4));
const guidGenerator_1 = __webpack_require__(5);
const codeFile_1 = __webpack_require__(6);
async function generateVSProjectFiles() {
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
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
    if (!workspaceFolder) {
        vscode.window.showErrorMessage("No workspace folder found.");
        return;
    }
    const projectDir = path.join(workspaceFolder, newName);
    const projectFolder = path.join(projectDir, newName);
    // Create the folders
    try {
        // Create the main directory folder
        fs.mkdirSync(projectDir, { recursive: true });
        // Create the project folder inside the main directory
        fs.mkdirSync(projectFolder, { recursive: true });
    }
    catch (error) {
        vscode.window.showErrorMessage(`Error creating folders: `);
        return;
    }
    // Copy the template files
    try {
        copyFilesRename(projectFolder, projectDir, newName);
    }
    catch (error) {
        if (error instanceof Error) {
            // Is this the best way to handle this error? Probably not.
            if (!error.message.includes("EPERM")) {
                vscode.window.showErrorMessage(`Error copying files: ${error}`);
                return;
            }
            else {
                return;
            }
        }
    }
    // Replace the IDs in the solution file
    try {
        replaceIdsInSolutionFile(newName, projectDir);
    }
    catch (error) {
        vscode.window.showErrorMessage(`Error replacing IDs: ${error}`);
        return;
    }
    // Copy the main files
    try {
        copyFiles(workspaceFolder, projectFolder);
    }
    catch (error) {
        if (error instanceof Error) {
            // Is this the best way to handle this error? Probably not.
            if (!error.message.includes("EPERM")) {
                vscode.window.showErrorMessage(`Error copying main files: ${error}`);
                return;
            }
            else {
                return;
            }
        }
    }
    // Append the file types to the filters
    try {
        appendFileTypesToFilters(projectFolder, newName);
    }
    catch (error) {
        vscode.window.showErrorMessage(`Error appending file types to filters: ${error}`);
        return;
    }
    vscode.window.showInformationMessage("Visual Studio project files generated successfully");
}
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
    fs.readdirSync(projectFolder).forEach((file) => {
        if (file.startsWith("template.")) {
            const newFileName = file.replace("template", projectName);
            fs.renameSync(path.join(projectFolder, file), path.join(projectFolder, newFileName));
        }
    });
    // Rename the template.sln file
    const oldPath = path.join(projectDir, "template.sln");
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
    const extensions = [".cpp", ".h", ".dat", ".txt"];
    fs.readdirSync(workingDir).forEach((file) => {
        const ext = path.extname(file);
        if (extensions.includes(ext)) {
            fs.copyFileSync(path.join(workingDir, file), path.join(projectFolder, file));
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
function getFileType(fileName) {
    const ext = path.extname(fileName);
    switch (ext) {
        case ".cpp":
            return codeFile_1.FileType.SOURCE;
        case ".h":
            return codeFile_1.FileType.HEADER;
        case ".dat":
        case ".txt":
        default:
            return codeFile_1.FileType.TEXT;
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
                case codeFile_1.FileType.SOURCE:
                    compile += `\n    <ClCompile Include="${file.fileName}">\n      <Filter>Source Files</Filter>\n    </ClCompile>`;
                    break;
                case codeFile_1.FileType.TEXT:
                    text += `\n    <Text Include="${file.fileName}">\n      <Filter>Source Files</Filter>\n    </Text>`;
                    break;
                case codeFile_1.FileType.HEADER:
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
                case codeFile_1.FileType.SOURCE:
                    compile += `\n    <ClCompile Include="${file.fileName}" />`;
                    break;
                case codeFile_1.FileType.TEXT:
                    text += `\n    <Text Include="${file.fileName}" />`;
                    break;
                case codeFile_1.FileType.HEADER:
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
exports.generateGUID = generateGUID;
function generateGUID() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}


/***/ }),
/* 6 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.FileType = void 0;
var FileType;
(function (FileType) {
    FileType[FileType["SOURCE"] = 0] = "SOURCE";
    FileType[FileType["TEXT"] = 1] = "TEXT";
    FileType[FileType["HEADER"] = 2] = "HEADER";
})(FileType || (exports.FileType = FileType = {}));


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
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__(0);
/******/ 	module.exports = __webpack_exports__;
/******/ 	
/******/ })()
;
//# sourceMappingURL=extension.js.map