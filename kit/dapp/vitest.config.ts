import react from "@vitejs/plugin-react";
import { resolve } from "path";
import tsconfigPaths from "vite-tsconfig-paths";
import { defaultExclude, defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    globals: true,
    environment: "happy-dom",
    setupFiles: "./test/setup.ts",
    include: ["src/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
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
        ...defaultExclude,
      ],
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
      "@settlemint/sdk-utils/logging": resolve(__dirname, "./test/mocks.ts"),
      "@/lib/settlemint/portal": resolve(__dirname, "./test/portal-mocks.ts"),
      "@settlemint/sdk-portal": resolve(
        __dirname,
        "./test/sdk-portal-mocks.ts"
      ),
    },
  },
});
