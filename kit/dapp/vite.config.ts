import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { analyzer } from "vite-bundle-analyzer";
import Terminal from "vite-plugin-terminal";
import tsConfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  build: {
    sourcemap: true,
    rollupOptions: {
      onwarn(warning, warn) {
        // Suppress unused import warnings from external modules
        if (warning.code === "UNUSED_EXTERNAL_IMPORT") {
          return;
        }
        // Suppress sourcemap warnings for plugins that don't generate them
        if (
          warning.message &&
          warning.message.includes("Sourcemap is likely to be incorrect")
        ) {
          return;
        }
        warn(warning);
      },
    },
  },
  logLevel: process.env.CLAUDECODE ? "warn" : "info",
  optimizeDeps: {
    include: [
      // Only include dependencies that cause full-page reloads or are CommonJS
      "date-fns", // CommonJS library
      "recharts", // Large charting library with d3 dependencies
    ],
  },
  server: {
    port: 3000,
  },
  plugins: [
    Terminal({
      console: "terminal",
      output: ["terminal", "console"],
    }),
    tsConfigPaths(),
    tanstackStart({
      target: "bun",
      customViteReactPlugin: true,
    }),
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler", {}]],
      },
    }),
    analyzer({
      enabled: process.env.ANALYZE === "true",
    }),
  ],
});
