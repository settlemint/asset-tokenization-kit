import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { defineConfig } from "vite";
import { analyzer } from "vite-bundle-analyzer";
import { consoleForwardPlugin } from "vite-console-forward-plugin";
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
    consoleForwardPlugin(),
  ],
});
