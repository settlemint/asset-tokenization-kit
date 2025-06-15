import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { generateDeclarations } from "intl-t/declarations";
import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";

void generateDeclarations("./src/locales/");

export default defineConfig({
  server: {
    port: 3000,
  },
  plugins: [
    tsConfigPaths(),
    tanstackStart({
      target: "bun",
    }),
  ],
});
