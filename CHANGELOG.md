# Change Log

All notable changes to the "vscode-to-vs" extension will be documented in this file.

This is based on [Keep a Changelog](http://keepachangelog.com/)

## [2.0.0] - 09-04-2026

### Breaking

- Source files are now **copied** into the generated project instead of being moved.
  Your originals stay where they are.
- The extension no longer deletes anything. Previous versions removed every
  extensionless file in the workspace root (which also silently failed on
  directories) along with `.exe`/`.obj` files.
- Only recognised extensions are collected. Unknown files are ignored instead of
  being added to the project as `<Text>` items.

### Fixed

- The generated `.vcxproj` had a literal `{PROJECTID}` placeholder and a
  hard-coded `Test2` root namespace, so its GUID never matched the solution's.
  Both are now filled in, and the project and solution GUIDs agree.
- Errors thrown by the command are reported instead of being swallowed: the
  handler did not await the generator, so nothing reached its `try`/`catch`.
- Cancelling the project-name prompt no longer creates an `undefined` folder;
  names are validated against Windows' file-naming rules as you type.
- File names containing `&`, `<` or quotes are XML-escaped, instead of producing
  a project file Visual Studio cannot parse.
- An empty multi-root workspace no longer throws; you are asked which folder to
  use, and a missing workspace reports a clear message.
- Generating into an existing folder now asks before replacing files.
- The templates are shipped from a tracked `assets/` folder and copied at build
  time. They previously existed only inside committed build output, so a clean
  build produced an extension that could not generate anything.

### Added

- Settings for the collected file extensions: `vscodeToVs.sourceFileExtensions`,
  `vscodeToVs.headerFileExtensions` and `vscodeToVs.textFileExtensions`.
- An output channel with a **Show Log** action on failures, and a
  **Reveal in Explorer** action on success.
- Progress notification while files are generated.
- 107 unit tests (Vitest) covering the generation logic, VS Code integration
  tests, and a GitHub Actions CI workflow.

### Changed

- Reorganised into `core/` (pure, testable logic), `commands/` (VS Code UI) and
  a thin `extension.ts`.
- All file system work is asynchronous, so generation no longer blocks the
  extension host.
- GUIDs come from `node:crypto` rather than a hand-rolled `Math.random()` helper.
- Migrated to the ESLint flat config, added Prettier, and updated dependencies.

## [1.6.0]

- Update: Dependency and packaging updates

## [1.5.0] - 12-05-2025
- Update: Update dependencies to latest versions
- Fix: Fix vulnerabilities in dependencies (glob)

## [1.4.1] - 08-23-2024

- Refactor: Refactor the code to make it more readable

## [1.3/4.0] - 08-22-2024

- Fix: Dependency issues for local development
- Add: Higher quality icon for extension
- Add: Automatically remove compiled files after copying them to a new location
- Add: gitignore file to ignore folders (sorry for the oversight, looking at you `node_modules`)
- Remove: Remove unnecessary files from the extension

## [1.2.1] - 02-06-2024

- Update: Update dependencies
- License: Update license to GPL-3.0
- Remove: Remove .vcxproj random empty line

## [1.2.0] - 02-06-2024

- Add: Delete old files after copying them to a new location

## [1.1.2] - 01-31-2024

- Fix: Fix other issues with GUID generation

## [1.1.1] - 01-31-2024

- Fix: Fix issue with GUID generation
- Add: Better icon for extension

## [1.1.0] - 01-29-2024

- Add: Support for custom name for project and solution
- Refactor: Move the enum and interface to separate file
- Add: Test for GUID generation

## [1.0.0] - 01-23-2024

- Initial release
