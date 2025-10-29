import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import mdx from "fumadocs-mdx/vite";
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
      /*
      Manual chunking is disabled as it is not working when bundling for production.
      It gives all kind of race issues in the module loading logic resulting into "undefined" / TypeError errors.
      output: {
        manualChunks: (id: string) => {
          // Skip node_modules processing for non-vendor chunks
          if (!id.includes("node_modules")) {
            return;
          }

          // Chart libraries - lazy-loaded by chart components
          if (id.includes("recharts")) {
            return "vendor-charts";
          }

          // Documentation libraries - only loaded in /docs routes
          // Split by library for better caching and lazy loading
          if (
            id.includes("mermaid") ||
            id.includes("cytoscape") ||
            id.includes("chevrotain") ||
            id.includes("langium") ||
            id.includes("layout-base") ||
            id.includes("cose-base") ||
            id.includes("roughjs")
          ) {
            return "vendor-mermaid";
          }
          if (id.includes("katex")) {
            return "vendor-katex";
          }
          if (
            id.includes("fumadocs-core") ||
            id.includes("fumadocs-ui") ||
            id.includes("fumadocs-mdx") ||
            id.includes("orama")
          ) {
            return "vendor-fumadocs";
          }
          if (id.includes("shiki") || id.includes("shikiji")) {
            return "vendor-shiki";
          }

          // Icon library - used throughout app but can be split
          if (id.includes("lucide-react")) {
            return "vendor-icons";
          }

          // Animation library - used in various components
          if (id.includes("motion") || id.includes("framer-motion")) {
            return "vendor-motion";
          }

          // Internationalization - used throughout app
          if (id.includes("i18next") || id.includes("react-i18next")) {
            return "vendor-i18n";
          }

          // Date utilities - used in various components
          if (id.includes("date-fns")) {
            return "vendor-dates";
          }

          // Authentication - better-auth and related
          if (
            id.includes("better-auth") ||
            id.includes("@daveyplate/better-auth") ||
            id.includes("marked")
          ) {
            return "vendor-auth";
          }

          // Database ORM - drizzle
          if (id.includes("drizzle-orm")) {
            return "vendor-db";
          }

          // RPC framework - orpc
          if (id.includes("@orpc/")) {
            return "vendor-orpc";
          }

          // Validation library - zod (large with many schemas)
          if (id.includes("zod") && !id.includes("@atk/zod")) {
            return "vendor-validation";
          }

          // Table utilities - code-split for table-heavy routes
          if (id.includes("@tanstack/react-table")) {
            return "vendor-tables";
          }

          // Core UI libraries - used across many routes
          if (id.includes("@radix-ui")) {
            return "vendor-ui";
          }

          // Form libraries - code-split for form-heavy routes
          if (id.includes("@tanstack/react-form")) {
            return "vendor-forms";
          }

          // TanStack Query & Router - used throughout app (before react check to avoid misclassification)
          if (
            id.includes("@tanstack/react-query") ||
            id.includes("@tanstack/query-") ||
            id.includes("@tanstack/react-router") ||
            id.includes("@tanstack/router-")
          ) {
            return "vendor-tanstack";
          }

          // React core ecosystem - shared across all routes
          // Match only actual react packages, not react-* third-party libs
          if (
            id.includes("/node_modules/react/") ||
            id.includes("/node_modules/react-dom/") ||
            id.includes("/node_modules/scheduler/") ||
            id.endsWith("/node_modules/react") ||
            id.endsWith("/node_modules/react-dom") ||
            id.endsWith("/node_modules/scheduler")
          ) {
            return "vendor-react-core";
          }

          // Blockchain libraries - viem, etc
          if (id.includes("viem") || id.includes("@noble")) {
            return "vendor-blockchain";
          }

          // Everything else goes to vendor
          return "vendor";
        },
      },
      */
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
    // Pre-bundle frequently accessed libs to skip startup re-optimization
    include: [
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
      "date-fns",
      "class-variance-authority",
      "clsx",
      "tailwind-merge",
      "@noble/hashes/sha2.js",
      "@noble/hashes/utils.js",
      "motion/react",
      "better-auth/client/plugins",
      "better-auth/react",
      "viem",
      "@daveyplate/better-auth-ui/tanstack",
      "better-auth/plugins/access",
      "better-auth/plugins/admin/access",
      "i18next",
      "crypto-js/md5",
      "react-jazzicon",
      "change-case",
      "recharts",
      "drizzle-orm/pg-core",
      "lodash.capitalize",
      "date-fns/locale",
      "i18n-iso-countries",
    ],
    esbuildOptions: {
      target: "es2023",
    },
  },
  esbuild: {
    target: "es2023",
  },
  plugins: [
    devtools(),
    mdx(await import("./source.config")),
    tsConfigPaths(),
    tailwindcss(),
    tanstackStart({
      prerender: {
        enabled: true,
        filter: ({ path }) => path.startsWith("/docs"),
      },
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
