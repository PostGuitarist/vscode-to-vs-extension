import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/test/unit/**/*.spec.ts"],
    environment: "node",
    coverage: {
      provider: "v8",
      include: ["src/core/**/*.ts"],
      reporter: ["text", "lcov"],
    },
  },
});
