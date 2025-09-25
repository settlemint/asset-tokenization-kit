import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { config } from "dotenv";
import { defineConfig } from "vite";
import { analyzer } from "vite-bundle-analyzer";
import tsConfigPaths from "vite-tsconfig-paths";

config({
  path: [".env", ".env.local"],
  quiet: true,
});

export default defineConfig({
  logLevel: process.env.CLAUDECODE ? "warn" : "info",
  server: {
    port: 3000,
  },
  plugins: [
    devtools(),
    tsConfigPaths(),
    tanstackStart({
      router: {
        codeSplittingOptions: {
          defaultBehavior: [],
        },
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
