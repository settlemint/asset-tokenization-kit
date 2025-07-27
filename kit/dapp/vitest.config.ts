import react from "@vitejs/plugin-react";
import { resolve } from "path";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [
          [
            "babel-plugin-react-compiler",
            { runtimeModule: "react-compiler-runtime" },
          ],
        ],
      },
    }),
    tsconfigPaths(),
  ],
  test: {
    globals: true,
    environment: "happy-dom",
    setupFiles: "./test/setup.ts",
    include: ["src/**/*.test.{ts,tsx}"],
    exclude: ["node_modules", "dist", ".cache"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/**",
        "dist/**",
        ".nitro/**",
        "public/**",
        "src/**/*.gen.ts",
        "src/components/ui/**",
        "src/**/*.test.{ts,tsx}",
        "src/**/*.d.ts",
        "*.config.*",
        "test/**",
      ],
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
      "@settlemint/sdk-utils/logging": resolve(__dirname, "./test/mocks.ts"),
    },
  },
});
