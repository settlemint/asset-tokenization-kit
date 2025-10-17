import type { FontVariables } from "../lib/compile-css";
import { queueThemeDomUpdates } from "../lib/theme-dom-updater";
import { useThemeContext } from "@/providers/theme-context";
import { useTheme } from "next-themes";
import { useEffect } from "react";

const LIGHT_BACKGROUND = "oklch(0.967 0.014 268.49)";
const DARK_BACKGROUND = "oklch(0.2809 0 0)";
const THEME_STYLE_ID = "theme-overrides";
const RUNTIME_ORIGIN = "runtime";
const READY_STATE = "ready";

function applyThemeMetadata(resolved: string, source: string) {
  const root = document.documentElement;
  const applied = resolved === "dark" ? "dark" : "light";

  root.dataset.theme = applied;
  root.dataset.themeMode = source;

  root.classList.remove("light", "dark");
  root.classList.add(applied);

  root.style.colorScheme = applied === "dark" ? "dark" : "light";
  root.style.backgroundColor =
    applied === "dark" ? DARK_BACKGROUND : LIGHT_BACKGROUND;
}

export function ThemeSync({
  fontVariables,
}: {
  fontVariables?: FontVariables;
}): null {
  const { hash } = useThemeContext();
  const { resolvedTheme, theme } = useTheme();

  useEffect(() => {
    if (globalThis.window === undefined) {
      return;
    }

    const applied = resolvedTheme ?? theme ?? "light";
    applyThemeMetadata(applied, theme ?? applied);
  }, [resolvedTheme, theme]);

  useEffect(() => {
    if (!fontVariables) {
      return;
    }

    queueThemeDomUpdates(fontVariables);
  }, [fontVariables]);

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    const existing = document.querySelector<HTMLStyleElement>(
      `#${THEME_STYLE_ID}`
    );
    const requestHash = hash ?? existing?.dataset.hash ?? "";
    const searchParams = requestHash
      ? `?hash=${encodeURIComponent(requestHash)}`
      : "";
    const url = `/api/theme.css${searchParams}`;
    let cancelled = false;

    void fetch(url, { headers: { Accept: "text/css" } }).then(
      async (response) => {
        if (!response.ok || cancelled) {
          return;
        }

        const css = await response.text();
        if (cancelled) {
          return;
        }

        const etag = response.headers.get("etag");
        const normalizedHash = etag
          ? etag.replaceAll(/^"+|"+$/g, "")
          : undefined;
        const target =
          document.querySelector<HTMLStyleElement>(`#${THEME_STYLE_ID}`) ??
          (() => {
            const element = document.createElement("style");
            element.id = THEME_STYLE_ID;
            document.head.append(element);
            return element;
          })();

        if (normalizedHash && target.dataset.hash === normalizedHash) {
          return;
        }

        target.textContent = css;
        if (normalizedHash) {
          target.dataset.hash = normalizedHash;
        }
        target.dataset.state = READY_STATE;
        target.dataset.origin = RUNTIME_ORIGIN;
      }
    );

    return () => {
      cancelled = true;
    };
  }, [hash]);

  return null;
}
