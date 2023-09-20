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
exports.generateSolutionFiles = void 0;
const fs = __webpack_require__(3);
function generateSolutionFiles() {
    // let project_id = guid
    // let solution_id = guid
    let project_id = generate_guid();
    let solution_id = generate_guid();
    // Get the project name from the directory name
    let project_name = get_project_name();
    // Convert the argument to a Path object
    let folder_path = get_folder_path();
    let new_folder_path = folder_path + "\\" + project_name;
    // If new_folder_path exists, delete it
    if (fs.existsSync(new_folder_path)) {
        fs.rmdirSync(new_folder_path, { recursive: true });
        console.log("Deleted " + new_folder_path);
    }
    // Create the Visual Sutdio folder
    fs.mkdirSync(new_folder_path);
    // We now need a project folder which all the code will be in along with everything but the .sln file
    let project_path = new_folder_path + "\\" + project_name;
    // Create the project folder
    fs.mkdirSync(project_path);
    // Create a vector to hold data on each code or data file in the original folder
    let files = fs.readdirSync(folder_path);
    // Copy over all of the code/data files
}
exports.generateSolutionFiles = generateSolutionFiles;


/***/ }),
/* 3 */
/***/ ((module) => {

module.exports = require("fs");

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
const generateSolution_1 = __webpack_require__(2);
function activate(context) {
    // Register the command
    let disposable = vscode.commands.registerCommand('extension.generateCppSolution', async () => {
        try {
            // Run the generateSolutionFiles function
            (0, generateSolution_1.generateSolutionFiles)();
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