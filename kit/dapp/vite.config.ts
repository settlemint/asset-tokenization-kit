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
  },
  define: {
    "process.env.BUILD_ID": JSON.stringify(BUILD_ID),
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
      // babel: {
      //   plugins: [["babel-plugin-react-compiler", {}]],
      // },
    }),
    analyzer({
      enabled: process.env.ANALYZE === "true",
    }),
  ],
});
