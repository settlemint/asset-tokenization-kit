import react from "@vitejs/plugin-react";
import { resolve } from "path";
import tsconfigPaths from "vite-tsconfig-paths";
import { defaultExclude, defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    globals: true,
    environment: "happy-dom",
    setupFiles: "./test/setup/unit.ts",
    environmentOptions: {
      happyDOM: {
        // Ensure happy-dom properly supports React 18+ features
        url: "http://localhost:3000",
        width: 1024,
        height: 768,
      },
    },
    include: ["src/**/*.test.{ts,tsx}"],
    passWithNoTests: true,
    // Always use forks pool for consistency between local and CI environments
    pool: "forks",
    poolOptions: {
      forks: {
        isolate: true,
      },
    },
    isolate: true,
    reporters: process.env.CLAUDECODE
      ? ["dot"]
      : process.env.CI
        ? ["dot", "github-actions"]
        : ["default"],
    onConsoleLog:
      process.env.CI || process.env.CLAUDECODE ? () => false : undefined,
    silent: process.env.CLAUDECODE ? "passed-only" : undefined,
    typecheck: {
      enabled: true,
    },
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
      "@": resolve(__dirname, "./src"),
      "@test": resolve(__dirname, "./test"),
      "@settlemint/sdk-utils/logging": resolve(
        __dirname,
        "./test/mocks/logger.ts"
      ),
      "@/lib/settlemint/portal": resolve(
        __dirname,
        "./test/mocks/portal-mocks.ts"
      ),
      "@/lib/settlemint/the-graph": resolve(
        __dirname,
        "./test/mocks/the-graph-mocks.ts"
      ),
      "@settlemint/sdk-portal": resolve(
        __dirname,
        "./test/mocks/sdk-portal-mocks.ts"
      ),
      "better-auth": resolve(__dirname, "./test/mocks/better-auth-mocks.ts"),
    },
  },
});
