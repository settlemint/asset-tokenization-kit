import type { ThemeConfig, ThemeToken } from "@/components/theme/schema";
import { compileThemeCSS, resolveFontLinks } from "@/components/theme/compile-css";

const THEME_FONT_ATTRIBUTE = "data-theme-font";

export const VAR_REFERENCE_PATTERN = /^var\(/i;

export function isReferenceValue(value: string | undefined | null): boolean {
  if (typeof value !== "string") {
    return false;
  }
  return VAR_REFERENCE_PATTERN.test(value.trim());
}

export type ThemeOverridesSnapshot = {
  existed: boolean;
  css: string | null;
  state?: string;
  origin?: string;
};

export type ThemeMutationContext = {
  previousTheme?: ThemeConfig;
  previousStyle: ThemeOverridesSnapshot;
};

export function setThemeOverridesCss(
  css: string,
  meta: { state: "pending" | "ready"; origin: string }
): ThemeOverridesSnapshot {
  if (typeof document === "undefined") {
    return { existed: false, css: null };
  }

  const existing = document.querySelector<HTMLStyleElement>("#theme-overrides");
  const styleElement =
    existing instanceof HTMLStyleElement
      ? existing
      : (() => {
          const element = document.createElement("style");
          element.id = "theme-overrides";
          document.head.append(element);
          return element;
        })();

  const snapshot: ThemeOverridesSnapshot = {
    existed: existing instanceof HTMLStyleElement,
    css:
      existing instanceof HTMLStyleElement
        ? existing.textContent ?? ""
        : null,
    state:
      existing instanceof HTMLStyleElement ? existing.dataset.state : undefined,
    origin:
      existing instanceof HTMLStyleElement
        ? existing.dataset.origin
        : undefined,
  };

  styleElement.textContent = css;
  styleElement.dataset.state = meta.state;
  styleElement.dataset.origin = meta.origin;

  return snapshot;
}

export function restoreThemeOverridesCss(
  snapshot: ThemeOverridesSnapshot | null | undefined
): void {
  if (typeof document === "undefined" || !snapshot) {
    return;
  }

  const styleElement =
    document.querySelector<HTMLStyleElement>("#theme-overrides");
  if (!styleElement) {
    return;
  }

  if (!snapshot.existed) {
    styleElement.remove();
    return;
  }

  styleElement.textContent = snapshot.css ?? "";
  if (snapshot.state) {
    styleElement.dataset.state = snapshot.state;
  } else {
    delete styleElement.dataset.state;
  }
  if (snapshot.origin) {
    styleElement.dataset.origin = snapshot.origin;
  } else {
    delete styleElement.dataset.origin;
  }
}

export function removePreviewFontLinks(): void {
  if (typeof document === "undefined") {
    return;
  }

  const links = document.querySelectorAll<HTMLLinkElement>(
    `link[${THEME_FONT_ATTRIBUTE}]`
  );

  for (const link of links) {
    link.remove();
  }
}

export function applyPreviewFontLinks(fonts: ThemeConfig["fonts"]): void {
  if (typeof document === "undefined") {
    return;
  }

  const descriptors = resolveFontLinks(fonts);
  const head = document.head;

  for (const descriptor of descriptors) {
    const link = document.createElement("link");
    link.rel = descriptor.rel;
    link.href = descriptor.href;

    if (descriptor.crossOrigin) {
      link.crossOrigin = descriptor.crossOrigin;
    }

    link.setAttribute(THEME_FONT_ATTRIBUTE, "preview");
    head.append(link);
  }
}

export function cloneThemeConfig(theme: ThemeConfig): ThemeConfig {
  return structuredClone(theme);
}

export function countChangedTokens(
  baseTheme: ThemeConfig,
  draft: ThemeConfig
): number {
  let changes = 0;
  (["light", "dark"] as Array<keyof ThemeConfig["cssVars"]>).forEach((mode) => {
    const tokens = Object.keys(baseTheme.cssVars[mode]) as ThemeToken[];
    for (const token of tokens) {
      if (baseTheme.cssVars[mode][token] !== draft.cssVars[mode][token]) {
        changes += 1;
      }
    }
  });
  return changes;
}

export type IdleHandle = number | ReturnType<typeof setTimeout>;

export function scheduleIdleCallbackCompat(
  callback: IdleRequestCallback
): IdleHandle {
  if (globalThis.window === undefined) {
    return 0;
  }
  if (typeof globalThis.requestIdleCallback === "function") {
    return globalThis.requestIdleCallback(callback);
  }
  return globalThis.setTimeout(() => {
    const fallbackDeadline: IdleDeadline = {
      didTimeout: false,
      timeRemaining: () => 0,
    };
    callback(fallbackDeadline);
  }, 0);
}

export function cancelIdleCallbackCompat(handle: IdleHandle): void {
  if (globalThis.window === undefined) {
    return;
  }
  if (
    typeof globalThis.cancelIdleCallback === "function" &&
    typeof handle === "number"
  ) {
    globalThis.cancelIdleCallback(handle);
  } else {
    globalThis.clearTimeout(handle);
  }
}

export function fallbackCompileTheme(
  getLatestDraft: () => ThemeConfig,
  setCss: (css: string) => void,
  setCompiling: (value: boolean) => void
): void {
  try {
    const css = compileThemeCSS(getLatestDraft());
    setCss(css);
  } finally {
    setCompiling(false);
  }
}

export const THEME_COMPILE_THRESHOLD = 20;
