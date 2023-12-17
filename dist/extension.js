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
exports.run = void 0;
const vscode = __webpack_require__(1);
const child_process = __webpack_require__(3);
const path = __webpack_require__(4);
function run() {
    // Get the active text editor
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showErrorMessage("No active editor found");
        return;
    }
    // Get the file path of the active text editor
    const file_path = editor.document.uri.fsPath;
    // Check if the file is a C++ file
    if (!file_path.endsWith(".cpp") && !file_path.endsWith(".h")) {
        vscode.window.showErrorMessage("File is not a C++ file");
        return;
    }
    // Get the directory path of the active text editor
    const dir_path = path.dirname(file_path);
    // Generate the solution files using MSBuild
    const msbuild_process = child_process.spawn("msbuild", ["/t:GenerateSolutionFiles", "/p:Configuration=Debug"], {
        cwd: dir_path,
    });
    // Handle MSBuild output
    msbuild_process.stdout.on("data", (data) => {
        console.log(`stdout: ${data}`);
    });
    msbuild_process.stderr.on("data", (data) => {
        console.error(`stderr: ${data}`);
    });
    msbuild_process.on("close", (code) => {
        console.log(`MSBuild process exited with code ${code}`);
        if (code === 0) {
            vscode.window.showInformationMessage("Solution files generated successfully");
        }
        else {
            vscode.window.showErrorMessage("Failed to generate solution files");
        }
    });
}
exports.run = run;


/***/ }),
/* 3 */
/***/ ((module) => {

module.exports = require("child_process");

/***/ }),
/* 4 */
/***/ ((module) => {

module.exports = require("path");

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
const runner_1 = __webpack_require__(2);
function activate(context) {
    // Register the command
    let disposable = vscode.commands.registerCommand('extension.generateCppSolution', async () => {
        try {
            // Run the generateSolutionFiles function
            (0, runner_1.run)();
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