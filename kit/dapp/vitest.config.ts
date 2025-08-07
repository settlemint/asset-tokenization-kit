import react from "@vitejs/plugin-react";
import path from "path";
import tsconfigPaths from "vite-tsconfig-paths";
import { defaultExclude, defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    globals: true,
    passWithNoTests: true,
    pool: "forks",
    reporters: process.env.CLAUDECODE
      ? ["dot"]
      : process.env.CI
        ? ["default", "github-actions"]
        : ["default"],
    onConsoleLog: process.env.CLAUDECODE ? () => false : undefined,
    silent: process.env.CLAUDECODE ? "passed-only" : undefined,
    typecheck: {
      enabled: true,
    },
    coverage: {
      all: true,
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
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
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
          poolOptions: {
            forks: {
              isolate: true,
            },
          },
          isolate: true,
        },
        resolve: {
          alias: {
            "@": path.resolve(__dirname, "./src"),
            "@test": path.resolve(__dirname, "./test"),
            "@settlemint/sdk-utils/logging": path.resolve(
              __dirname,
              "./test/mocks/logger.ts"
            ),
            "@/lib/settlemint/portal": path.resolve(
              __dirname,
              "./test/mocks/portal-mocks.ts"
            ),
            "@/lib/settlemint/the-graph": path.resolve(
              __dirname,
              "./test/mocks/the-graph-mocks.ts"
            ),
            "@settlemint/sdk-portal": path.resolve(
              __dirname,
              "./test/mocks/sdk-portal-mocks.ts"
            ),
            "better-auth": path.resolve(
              __dirname,
              "./test/mocks/better-auth-mocks.ts"
            ),
          },
        },
      },
      {
        extends: true,
        test: {
          name: "integration",
          environment: "node",
          globalSetup: ["./test/setup/integration.ts"],
          testTimeout: 60000, // 60 seconds for integration tests
          hookTimeout: 60000, // 60 seconds for hooks
          poolOptions: {
            forks: {
              singleFork: true, // Run all tests in a single process
            },
          },
          include: ["src/**/*.spec.ts"],
          exclude: ["node_modules", "dist", "src/**/*.test.ts"],
        },
        resolve: {
          alias: {
            "@test": path.resolve(__dirname, "./test"),
            "@": path.resolve(__dirname, "./src"),
          },
        },
      },
    ],
  },
});
