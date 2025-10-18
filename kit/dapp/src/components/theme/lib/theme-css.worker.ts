/// <reference lib="webworker" />

import { compileThemeCSS } from "./compile-css";
import type { ThemeConfig } from "./schema";

type ThemeCompileWorkerRequest = {
  id: number;
  theme: ThemeConfig;
};

type ThemeCompileWorkerResponse = {
  id: number;
  css?: string;
  error?: string;
};

const workerScope = globalThis as unknown as DedicatedWorkerGlobalScope;

workerScope.addEventListener(
  "message",
  (event: MessageEvent<ThemeCompileWorkerRequest>) => {
    const { id, theme } = event.data;
    try {
      const css = compileThemeCSS(theme);
      workerScope.postMessage({
        id,
        css,
      } satisfies ThemeCompileWorkerResponse);
    } catch (error) {
      workerScope.postMessage({
        id,
        error:
          error instanceof Error
            ? error.message
            : "Failed to compile theme CSS",
      } satisfies ThemeCompileWorkerResponse);
    }
  }
);
