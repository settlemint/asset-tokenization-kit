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
    poolOptions: {
      forks: {
        // Limit the number of parallel test workers to avoid exceeding the PostgreSQL
        // connection limit. Integration tests spin up services that connect to the
        // database, and running too many in parallel can exhaust the connection pool.
        maxForks: 16,
      },
    },
    reporters: process.env.CLAUDECODE
      ? ["dot"]
      : process.env.CI
        ? ["dot", "github-actions"]
        : ["default"],
    onConsoleLog: process.env.CLAUDECODE ? () => false : undefined,
    silent: process.env.CLAUDECODE ? "passed-only" : undefined,
    coverage: {
      all: true,
      provider: "v8",
      reporter: ["text", "json", "json-summary", "lcov"],
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
        },
        resolve: {
          alias: [
            {
              find: /^@\/lib\/auth.*/,
              replacement: path.resolve(
                __dirname,
                "./test/mocks/auth-lib-mock.ts"
              ),
            },
            {
              find: "@/locales",
              replacement: path.resolve(__dirname, "./locales"),
            },
            { find: "@", replacement: path.resolve(__dirname, "./src") },
            { find: "@test", replacement: path.resolve(__dirname, "./test") },
            {
              find: "@settlemint/sdk-utils/logging",
              replacement: path.resolve(__dirname, "./test/mocks/logger.ts"),
            },
            {
              find: "@/lib/auth/auth.client",
              replacement: path.resolve(
                __dirname,
                "./test/mocks/auth-client-mock.ts"
              ),
            },
            {
              find: "@/lib/settlemint/portal",
              replacement: path.resolve(
                __dirname,
                "./test/mocks/portal-mocks.ts"
              ),
            },
            {
              find: "@/lib/settlemint/the-graph",
              replacement: path.resolve(
                __dirname,
                "./test/mocks/the-graph-mocks.ts"
              ),
            },
            {
              find: "@settlemint/sdk-portal",
              replacement: path.resolve(
                __dirname,
                "./test/mocks/sdk-portal-mocks.ts"
              ),
            },
            // Submodule mocks to prevent deep import resolution from breaking unit tests
            {
              find: "better-auth/client/plugins",
              replacement: path.resolve(
                __dirname,
                "./test/mocks/better-auth-client-mocks.ts"
              ),
            },
            {
              find: "better-auth/react",
              replacement: path.resolve(
                __dirname,
                "./test/mocks/better-auth-client-mocks.ts"
              ),
            },
            {
              find: "better-auth/plugins/access",
              replacement: path.resolve(
                __dirname,
                "./test/mocks/better-auth-client-mocks.ts"
              ),
            },
            {
              find: "better-auth/plugins/admin/access",
              replacement: path.resolve(
                __dirname,
                "./test/mocks/better-auth-client-mocks.ts"
              ),
            },
            // Root better-auth logger only (exact match)
            {
              find: /^better-auth$/,
              replacement: path.resolve(
                __dirname,
                "./test/mocks/better-auth-mocks.ts"
              ),
            },
          ],
        },
      },
      {
        extends: true,
        test: {
          name: "integration",
          environment: "node",
          globalSetup: ["./test/setup/integration-global.ts"],
          setupFiles: ["./test/setup/integration.ts"],
          testTimeout: 60000, // 60 seconds for integration tests
          hookTimeout: 60000, // 60 seconds for hooks
          include: ["src/**/*.spec.ts"],
          exclude: ["node_modules", "dist", "src/**/*.test.ts"],
        },
        resolve: {
          alias: [
            {
              find: "@/locales",
              replacement: path.resolve(__dirname, "./locales"),
            },
            { find: "@test", replacement: path.resolve(__dirname, "./test") },
            { find: "@", replacement: path.resolve(__dirname, "./src") },
          ],
        },
      },
    ],
  },
});
