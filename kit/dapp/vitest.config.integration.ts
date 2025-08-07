import path from "path";
import { defaultExclude, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    globalSetup: ["./test/setup/integration.ts"],
    testTimeout: 60000, // 60 seconds for integration tests
    hookTimeout: 60000, // 60 seconds for hooks
    pool: "forks",
    poolOptions: {
      forks: {
        singleFork: true, // Run all tests in a single process
      },
    },
    include: ["src/**/*.spec.ts"],
    exclude: ["node_modules", "dist", "src/**/*.test.ts"],
    reporters: process.env.CLAUDECODE
      ? ["dot"]
      : process.env.CI
        ? ["dot", "github-actions"]
        : ["default"],
    onConsoleLog: process.env.CLAUDECODE ? () => false : undefined,
    silent: process.env.CLAUDECODE ? true : undefined,
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "json-summary"],
      reportOnFailure: true,
      reportsDirectory: "./coverage",
      enabled: process.env.CI ? true : false,
      exclude: [
        "**/node_modules/**",
        "**/dist/**",
        "**/.nitro/**",
        "**/public/**",
        "**/src/**/*.gen.ts",
        "**/src/components/ui/**",
        "**/src/**/*.test.{ts,tsx}",
        "**/src/**/*.d.ts",
        "**/*.config.*",
        "**/test/**",
        "**/.output/**",
        "**/.tanstack/**",
        "**/.cache/**",
        "**/.turbo/**",
        "**/.vite/**",
        "**/.vitest/**",
        "**/.eslintrc.js",
        "**/.prettierrc.js",
        "**/*.d.ts",
        "**/*.gen.ts",
        "**/tools/**",
        "**/src/lib/settlemint/**",
        ...defaultExclude,
      ],
    },
  },
  resolve: {
    alias: {
      "@test": path.resolve(__dirname, "./test"),
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
