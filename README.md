# VSCode to Visual Studio

Generate the `.sln`, `.vcxproj`, `.vcxproj.filters` and `.vcxproj.user` files a
Visual Studio C++ project needs, from a plain folder of source files — useful
when you write C++ on a platform Visual Studio does not run on but have to hand
in, or open, a real Visual Studio solution.

This extension was made with permission from
[wzid](https://github.com/wzid), a friend who wrote the original CLI version.

## Usage

1. Open the folder containing your C++ source files.
2. Open the command palette — `Ctrl+Shift+P` (`Cmd+Shift+P` on macOS).
3. Run **Generate C++ Solution Files**.
4. Enter a project name when prompted.

Given a workspace like this:

```
my-assignment/
├── main.cpp
├── stack.h
└── input.txt
```

running the command with the name `Game` produces:

```
my-assignment/
├── Game/
│   ├── Game.sln
│   └── Game/
│       ├── Game.vcxproj
│       ├── Game.vcxproj.filters
│       ├── Game.vcxproj.user
│       ├── main.cpp
│       ├── stack.h
│       └── input.txt
├── main.cpp          ← originals are left exactly where they were
├── stack.h
└── input.txt
```

Your source files are **copied**, never moved or deleted, so an unwanted run is
undone by deleting the generated folder. Sub-directories are not scanned, and
files the extension does not recognise are ignored.

## Settings

| Setting                           | Default                                     | Description                       |
| --------------------------------- | ------------------------------------------- | --------------------------------- |
| `vscodeToVs.sourceFileExtensions` | `.c`, `.cc`, `.cpp`, `.cxx`, `.c++`         | Collected as `<ClCompile>` items. |
| `vscodeToVs.headerFileExtensions` | `.h`, `.hh`, `.hpp`, `.hxx`, `.h++`, `.inl` | Collected as `<ClInclude>` items. |
| `vscodeToVs.textFileExtensions`   | `.txt`, `.dat`                              | Collected as `<Text>` items.      |

The leading dot is optional and matching is case-insensitive, so `cpp`, `.cpp`
and `.CPP` all mean the same thing.

## Troubleshooting

Diagnostics are written to the **VSCode to Visual Studio** output channel
(View → Output). The error notification also offers a **Show Log** button.

## Development

```bash
npm install       # install dependencies
npm run watch     # rebuild on change; press F5 in VS Code to launch the host
npm run check     # lint, format check, typecheck and unit tests
```

| Script                  | What it does                                           |
| ----------------------- | ------------------------------------------------------ |
| `npm run compile`       | Bundle with webpack into `dist/`.                      |
| `npm run package`       | Production bundle, as used when publishing.            |
| `npm run test:unit`     | Vitest unit tests for everything under `src/core/`.    |
| `npm run test:coverage` | The same, with a coverage report.                      |
| `npm test`              | VS Code integration tests (downloads a VS Code build). |
| `npm run format`        | Apply Prettier formatting.                             |

### Layout

```
assets/                 template .sln/.vcxproj files, copied into dist/ at build time
src/
├── extension.ts        activation and command registration
├── config.ts           reads the extension's settings
├── logger.ts           output-channel logging
├── commands/           VS Code UI: prompts, progress, notifications
├── core/               pure logic, no vscode import — this is what the unit tests cover
│   ├── generator.ts    orchestrates a generation run
│   ├── templates.ts    loads templates and substitutes {{PLACEHOLDER}}s
│   ├── itemGroups.ts   builds the MSBuild <ItemGroup> fragments
│   ├── fileTypes.ts    classifies files by extension
│   ├── projectName.ts  validates the project name
│   ├── guid.ts         Visual Studio-style GUIDs
│   └── xml.ts          XML escaping
└── test/
    ├── unit/           Vitest specs
    └── integration/    VS Code extension host tests
```

Nothing in `src/core/` imports `vscode`, which is what keeps the interesting
logic testable without launching an extension host.

## License

[GPL-3.0](LICENSE)
