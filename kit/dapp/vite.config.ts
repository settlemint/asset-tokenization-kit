import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { analyzer } from "vite-bundle-analyzer";
import tsConfigPaths from "vite-tsconfig-paths";

type MinimalRollupWarning = {
  code?: string;
  message?: string;
};

export default defineConfig({
  logLevel: process.env.CLAUDECODE ? "warn" : "info",
  server: {
    port: 3000,
  },
  build: {
    target: "es2023",
    sourcemap: true,
    rollupOptions: {
      onwarn(
        warning: MinimalRollupWarning,
        warn: (warning: MinimalRollupWarning) => void
      ) {
        // Suppress unused import warnings from external modules
        if (warning.code === "UNUSED_EXTERNAL_IMPORT") {
          return;
        }
        // Suppress sourcemap warnings for plugins that don't generate them
        if (
          warning.message &&
          (warning.message.includes("Sourcemap is likely to be incorrect") ||
            warning.message.includes("Error when using sourcemap"))
        ) {
          return;
        }
        warn(warning);
      },
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      target: "es2023",
    },
  },
  esbuild: {
    target: "es2023",
  },
  plugins: [
    devtools(),
    tsConfigPaths(),
    tailwindcss(),
    tanstackStart({
      target: "bun",
      customViteReactPlugin: true,
    }),
    viteReact({
      babel: {
        plugins: [["babel-plugin-react-compiler", {}]],
      },
    }),
    analyzer({
      enabled: process.env.ANALYZE === "true",
    }),
  ],
});
