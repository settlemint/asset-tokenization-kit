import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { analyzer } from "vite-bundle-analyzer";
import tsConfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  build: {
    target: "es2022",
    sourcemap: true,
    rollupOptions: {
      external: ["bun"],
      onwarn(warning, warn) {
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
  logLevel: process.env.CLAUDECODE ? "warn" : "info",
  optimizeDeps: {
    esbuildOptions: {
      target: "es2022",
    },
    exclude: ["bun"],
    include: [
      // Only include dependencies that cause full-page reloads or are CommonJS
      "date-fns", // CommonJS library
      "recharts", // Large charting library with d3 dependencies
      "@tanstack/query-async-storage-persister",
      "@tanstack/query-broadcast-client-experimental",
      "superjson",
      "@settlemint/sdk-utils/logging",
      "@orpc/client",
      "@orpc/client/fetch",
      "@orpc/tanstack-query",
      "lucide-react",
      "dnum",
      "zod",
      "class-variance-authority",
      "motion/react",
      "better-auth/client/plugins",
      "better-auth/react",
      "viem",
      "clsx",
      "tailwind-merge",
      "@daveyplate/better-auth-ui/tanstack",
      "better-auth/plugins/access",
      "better-auth/plugins/admin/access",
      "i18next",
      "crypto-js/md5",
      "react-jazzicon",
      "lodash/capitalize",
      "i18n-iso-countries",
      "date-fns/locale",
      "drizzle-orm/pg-core",
    ],
  },
  server: {
    port: 3000,
  },
  plugins: [
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
