import { defineConfig } from "@vscode/test-cli";

// Integration tests only. Unit tests run under Vitest (`npm run test:unit`)
// and never reach `out/`, so they are excluded by this glob.
export default defineConfig({
  files: "out/test/integration/**/*.test.js",
  mocha: {
    ui: "tdd",
    timeout: 20000,
  },
});
