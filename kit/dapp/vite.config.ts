// import { nitroV2Plugin as nitro } from "@tanstack/nitro-v2-vite-plugin";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { config } from "dotenv";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";
import { analyzer } from "vite-bundle-analyzer";
import tsConfigPaths from "vite-tsconfig-paths";

config({
  path: [".env", ".env.local"],
  quiet: true,
});

export default defineConfig({
  build: {
    target: "ES2023",
    sourcemap: true,
  },
  logLevel: process.env.CLAUDECODE ? "warn" : "info",
  server: {
    port: 3000,
  },
  plugins: [
    devtools(),
    tsConfigPaths(),
    tanstackStart(),
    nitro({
      config: {
        preset: "bun",
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
