import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { analyzer } from "vite-bundle-analyzer";
import Terminal from "vite-plugin-terminal";
import tsConfigPaths from "vite-tsconfig-paths";

const IS_DEV = process.env.NODE_ENV === "development";

// Generate a build ID
// In development: use stable "dev" to avoid unnecessary cache busting
// In production: use CI/CD provided BUILD_ID or git commit hash
const BUILD_ID = IS_DEV
  ? "dev"
  : process.env.BUILD_ID ||
    process.env.GITHUB_SHA ||
    process.env.GIT_COMMIT ||
    Date.now().toString();

export default defineConfig({
  build: {
    sourcemap: IS_DEV,
    minify: IS_DEV ? false : "esbuild",
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
  define: {
    "process.env.BUILD_ID": JSON.stringify(BUILD_ID),
  },
  logLevel: process.env.CLAUDECODE ? "warn" : "info",
  optimizeDeps: {
    include: [
      "@radix-ui/react-accordion",
      "@radix-ui/react-alert-dialog",
      "@radix-ui/react-aspect-ratio",
      "@radix-ui/react-avatar",
      "@radix-ui/react-checkbox",
      "@radix-ui/react-collapsible",
      "@radix-ui/react-context-menu",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-hover-card",
      "@radix-ui/react-label",
      "@radix-ui/react-menubar",
      "@radix-ui/react-navigation-menu",
      "@radix-ui/react-popover",
      "@radix-ui/react-progress",
      "@radix-ui/react-radio-group",
      "@radix-ui/react-scroll-area",
      "@radix-ui/react-select",
      "@radix-ui/react-separator",
      "@radix-ui/react-slider",
      "@radix-ui/react-slot",
      "@radix-ui/react-switch",
      "@radix-ui/react-tabs",
      "@radix-ui/react-toggle",
      "@radix-ui/react-toggle-group",
      "@radix-ui/react-tooltip",
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
