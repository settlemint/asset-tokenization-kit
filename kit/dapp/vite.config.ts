import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { defineConfig } from "vite";
import { analyzer } from "vite-bundle-analyzer";
import tsConfigPaths from "vite-tsconfig-paths";

// Generate a build ID
// In development: use stable "dev" to avoid unnecessary cache busting
// In production: use CI/CD provided BUILD_ID or git commit hash
const BUILD_ID =
  process.env.NODE_ENV === "development"
    ? "dev"
    : process.env.BUILD_ID ||
      process.env.GITHUB_SHA ||
      process.env.GIT_COMMIT ||
      Date.now().toString();

export default defineConfig({
  define: {
    "process.env.BUILD_ID": JSON.stringify(BUILD_ID),
  },
  server: {
    port: 3000,
  },
  optimizeDeps: {
    entries: ["src/**/*.tsx", "src/**/*.ts"],
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      treeshake: "smallest",
      output: {
        manualChunks: (id) => {
          // Separate vendor chunks for better caching
          // Core React and routing libraries - use exact package matching
          if (
            id.includes("node_modules/react/") ||
            id.includes("node_modules/react-dom/") ||
            id.includes("node_modules/scheduler/")
          ) {
            return "vendor-react";
          }
          if (
            id.includes("kit/dapp/locales") ||
            id.includes("node_modules/i18n")
          ) {
            return "vendor-i18n";
          }
          // UI libraries
          if (
            id.includes("node_modules/@radix-ui") ||
            id.includes("node_modules/class-variance-authority") ||
            id.includes("node_modules/clsx") ||
            id.includes("node_modules/tailwind-merge") ||
            id.includes("node_modules/sonner") ||
            id.includes("node_modules/lucide")
          ) {
            return "vendor-ui";
          }
          // Blockchain/Web3 libraries
          if (
            id.includes("node_modules/viem") ||
            id.includes("node_modules/abitype")
          ) {
            return "vendor-blockchain";
          }
        },
      },
    },
  },
  plugins: [
    tsConfigPaths(),
    tanstackStart({
      target: "bun",
      react: {
        babel: {
          plugins: [["babel-plugin-react-compiler"]],
        },
      },
    }),
    analyzer({
      enabled: process.env.ANALYZE === "true",
    }),
  ],
});
