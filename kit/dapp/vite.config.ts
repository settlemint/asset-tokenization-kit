import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { defineConfig } from "vite";
import { analyzer } from "vite-bundle-analyzer";
import tsConfigPaths from "vite-tsconfig-paths";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Generate a build ID
// In development: use stable "dev" to avoid unnecessary cache busting
// In production: use CI/CD provided BUILD_ID or git commit hash
const BUILD_ID =
  process.env.NODE_ENV === "development" 
    ? "dev"
    : (process.env.BUILD_ID ||
       process.env.GITHUB_SHA ||
       process.env.GIT_COMMIT ||
       Date.now().toString());

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
    }),
    analyzer({
      enabled: process.env.ANALYZE === "true",
    }),
    // Custom plugin to serve the dev reset marker file
    {
      name: "serve-dev-reset-marker",
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url === "/.dev-reset-marker") {
            // Properly resolve the path using Node.js path utilities
            const __filename = fileURLToPath(import.meta.url);
            const __dirname = dirname(__filename);
            const markerPath = join(__dirname, ".dev-reset-marker");
            
            Bun.file(markerPath).text()
              .then(content => {
                res.setHeader("Content-Type", "text/plain");
                res.end(content);
              })
              .catch(() => {
                res.statusCode = 404;
                res.end("Not found");
              });
          } else {
            next();
          }
        });
      },
    },
  ],
});
