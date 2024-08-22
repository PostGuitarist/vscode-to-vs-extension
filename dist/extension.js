(()=>{"use strict";var e={81:(e,r)=>{var t;Object.defineProperty(r,"__esModule",{value:!0}),r.FileType=void 0,function(e){e[e.SOURCE=0]="SOURCE",e[e.TEXT=1]="TEXT",e[e.HEADER=2]="HEADER"}(t||(r.FileType=t={}))},265:function(e,r,t){var n=this&&this.__createBinding||(Object.create?function(e,r,t,n){void 0===n&&(n=t);var o=Object.getOwnPropertyDescriptor(r,t);o&&!("get"in o?!r.__esModule:o.writable||o.configurable)||(o={enumerable:!0,get:function(){return r[t]}}),Object.defineProperty(e,n,o)}:function(e,r,t,n){void 0===n&&(n=t),e[n]=r[t]}),o=this&&this.__setModuleDefault||(Object.create?function(e,r){Object.defineProperty(e,"default",{enumerable:!0,value:r})}:function(e,r){e.default=r}),i=this&&this.__importStar||function(e){if(e&&e.__esModule)return e;var r={};if(null!=e)for(var t in e)"default"!==t&&Object.prototype.hasOwnProperty.call(e,t)&&n(r,e,t);return o(r,e),r};Object.defineProperty(r,"__esModule",{value:!0}),r.activate=function(e){console.log('Extension "vscode-to-vs" is now active!');const r=c.commands.registerCommand("vscode-to-vs.generateCppSolution",(async()=>{try{(0,s.generateVSProjectFiles)()}catch(e){c.window.showErrorMessage(`Error generating project files: ${e}`)}}));e.subscriptions.push(r)},r.deactivate=function(){};const c=i(t(398)),s=t(984)},870:(e,r)=>{Object.defineProperty(r,"__esModule",{value:!0}),r.generateGUID=function(){return"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,(function(e){const r=16*Math.random()|0;return("x"===e?r:3&r|8).toString(16)}))}},984:function(e,r,t){var n=this&&this.__createBinding||(Object.create?function(e,r,t,n){void 0===n&&(n=t);var o=Object.getOwnPropertyDescriptor(r,t);o&&!("get"in o?!r.__esModule:o.writable||o.configurable)||(o={enumerable:!0,get:function(){return r[t]}}),Object.defineProperty(e,n,o)}:function(e,r,t,n){void 0===n&&(n=t),e[n]=r[t]}),o=this&&this.__setModuleDefault||(Object.create?function(e,r){Object.defineProperty(e,"default",{enumerable:!0,value:r})}:function(e,r){e.default=r}),i=this&&this.__importStar||function(e){if(e&&e.__esModule)return e;var r={};if(null!=e)for(var t in e)"default"!==t&&Object.prototype.hasOwnProperty.call(e,t)&&n(r,e,t);return o(r,e),r};Object.defineProperty(r,"__esModule",{value:!0}),r.generateVSProjectFiles=async function(){if(!c.workspace.name)return void c.window.showErrorMessage("No workspace is currently open.");const e=await c.window.showInputBox({prompt:"Enter the project name",value:c.workspace.name}),r=c.workspace.workspaceFolders?.[0].uri.fsPath;if(!r)return void c.window.showErrorMessage("No workspace folder found.");const t=a.join(r,e),n=a.join(t,e);try{s.mkdirSync(t,{recursive:!0}),s.mkdirSync(n,{recursive:!0})}catch(e){return void c.window.showErrorMessage("Error creating folders: ")}try{!function(e,r,t){const n=a.join(__dirname,"assets");s.readdirSync(n).forEach((r=>{"template.sln"!==r&&r.startsWith("template.")&&s.copyFileSync(a.join(n,r),a.join(e,r))}));const o="template.sln";s.copyFileSync(a.join(n,o),a.join(r,o)),s.readdirSync(e).forEach((r=>{if(r.startsWith("template.")){const n=r.replace("template",t);s.renameSync(a.join(e,r),a.join(e,n))}}));const i=a.join(r,"template.sln"),c=a.join(r,`${t}.sln`);s.renameSync(i,c)}(n,t,e)}catch(e){if(e instanceof Error)return e.message.includes("EPERM")?void 0:void c.window.showErrorMessage(`Error copying files: ${e}`)}try{!function(e,r){const t=a.join(r,`${e}.sln`);let n=s.readFileSync(t,"utf-8");n=n.replace(/NAME/g,e),n=n.replace(/PROJECTID/g,(0,l.generateGUID)()),n=n.replace(/SOLUTIONID/g,(0,l.generateGUID)()),s.writeFileSync(t,n,"utf-8")}(e,t)}catch(e){return void c.window.showErrorMessage(`Error replacing IDs: ${e}`)}try{!function(e,r){const t=[".cpp",".h",".dat",".txt"];s.readdirSync(e).forEach((n=>{const o=a.extname(n);t.includes(o)&&s.copyFileSync(a.join(e,n),a.join(r,n))})),s.readdirSync(e).forEach((r=>{const n=a.extname(r);t.includes(n)&&s.unlinkSync(a.join(e,r))})),s.readdirSync(e).forEach((r=>{const t=a.extname(r);".exe"!==t&&".obj"!==t&&""!==t||s.unlinkSync(a.join(e,r))}))}(r,n)}catch(e){if(e instanceof Error)return e.message.includes("EPERM")?void 0:void c.window.showErrorMessage(`Error copying main files: ${e}`)}try{!function(e,r){const t=[`${r}.vcxproj`,`${r}.vcxproj.filters`,`${r}.vcxproj.user`],n=s.readdirSync(e).filter((e=>!t.includes(e))).map((e=>({fileType:p(e),fileName:e})));const o=function(e,r){let t="\n  <ItemGroup>",n=t,o=t,i=t;for(let r of e)if(r)switch(r.fileType){case u.FileType.SOURCE:n+=`\n    <ClCompile Include="${r.fileName}">\n      <Filter>Source Files</Filter>\n    </ClCompile>`;break;case u.FileType.TEXT:o+=`\n    <Text Include="${r.fileName}">\n      <Filter>Source Files</Filter>\n    </Text>`;break;case u.FileType.HEADER:i+=`\n    <ClInclude Include="${r.fileName}">\n      <Filter>Header Files</Filter>\n    </ClInclude>`}return n!==t&&(n+="\n  </ItemGroup>",r+=n),o!==t&&(o+="\n  </ItemGroup>",r+=o),i!==t&&(i+="\n  </ItemGroup>",r+=i),r+="\n</Project>"}(n,""),i=function(e,r){let t="\n  <ItemGroup>",n=t,o=t,i=t;for(let r of e)if(r)switch(r.fileType){case u.FileType.SOURCE:n+=`\n    <ClCompile Include="${r.fileName}" />`;break;case u.FileType.TEXT:o+=`\n    <Text Include="${r.fileName}" />`;break;case u.FileType.HEADER:i+=`\n    <ClInclude Include="${r.fileName}" />`}return n!==t&&(n+="\n  </ItemGroup>",r+=n),o!==t&&(o+="\n  </ItemGroup>",r+=o),i!==t&&(i+="\n  </ItemGroup>",r+=i),r+='\n  <Import Project="$(VCTargetsPath)\\Microsoft.Cpp.targets" />\n  <ImportGroup Label="ExtensionTargets">\n  </ImportGroup>\n</Project>'}(n,"");s.appendFileSync(a.join(e,`${r}.vcxproj.filters`),o),s.appendFileSync(a.join(e,`${r}.vcxproj`),i)}(n,e)}catch(e){return void c.window.showErrorMessage(`Error appending file types to filters: ${e}`)}c.window.showInformationMessage("Visual Studio project files generated successfully")};const c=i(t(398)),s=i(t(896)),a=i(t(928)),l=t(870),u=t(81);function p(e){switch(a.extname(e)){case".cpp":return u.FileType.SOURCE;case".h":return u.FileType.HEADER;default:return u.FileType.TEXT}}},398:e=>{e.exports=require("vscode")},896:e=>{e.exports=require("fs")},928:e=>{e.exports=require("path")}},r={},t=function t(n){var o=r[n];if(void 0!==o)return o.exports;var i=r[n]={exports:{}};return e[n].call(i.exports,i,i.exports,t),i.exports}(265);module.exports=t})();