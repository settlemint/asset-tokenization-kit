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
      "currency-codes",
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
