import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    globalSetup: ["./test/scripts/setup.ts"],
    testTimeout: 60000, // 60 seconds for integration tests
    hookTimeout: 60000, // 60 seconds for hooks
    pool: "forks",
    poolOptions: {
      forks: {
        singleFork: true, // Run all tests in a single process
      },
    },
    include: ["test/**/*.spec.ts"],
    exclude: ["node_modules", "dist", "src/**/*.test.ts", "src/**/*.spec.ts"],
  },
  resolve: {
    alias: {
      test: path.resolve(__dirname, "./test"),
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
