import { sha256 } from "@noble/hashes/sha2.js";
import { bytesToHex, utf8ToBytes } from "@noble/hashes/utils.js";
import type { ThemeConfig, ThemeToken } from "./schema";
import { THEME_TOKENS } from "./schema";

export type ResolvedFontLink = {
  rel: string;
  href: string;
  crossOrigin?: "anonymous" | "use-credentials";
};

/**
 * Compiles theme configuration into CSS string
 * Generates :root and .dark selectors with all CSS variables
 * Returns deterministic output for cache hashing
 */
export function compileThemeCSS(theme: ThemeConfig): string {
  const lightVars = generateCSSVariables(theme.cssVars.light);
  const darkVars = generateCSSVariables(theme.cssVars.dark);

  const fontImports = generateFontImports(theme.fonts);

  const css = `
${fontImports}

:root {
${lightVars}
}

.dark {
${darkVars}
}
`.trim();

  return css;
}

/**
 * Generates CSS variable declarations from theme vars
 * Sorts keys for deterministic output
 */
function generateCSSVariables(vars: Record<ThemeToken, string>): string {
  const sortedKeys = [...THEME_TOKENS].toSorted();
  return sortedKeys
    .map((key) => {
      const value = vars[key];
      return `  --${key}: ${value};`;
    })
    .join("\n");
}

/**
 * Generates font @import or @font-face declarations
 */
function generateFontImports(fonts: ThemeConfig["fonts"]): string {
  const imports: string[] = [];

  for (const font of Object.values(fonts)) {
    if (font.source === "google") {
      const family = font.family.replaceAll(/\s+/g, "+");
      const weights = font.weights?.join(";") ?? "400;700";
      const url = `https://fonts.googleapis.com/css2?family=${family}:wght@${weights}&display=swap`;
      imports.push(`@import url(${JSON.stringify(url)});`);
    } else if (font.source === "custom" && font.url) {
      imports.push(`@import url(${JSON.stringify(font.url)});`);
    }
    // fontsource is handled by the existing imports in the app
  }

  return imports.join("\n");
}

/**
 * Generates a hash of the theme for cache busting
 */
export function hashTheme(theme: ThemeConfig): string {
  const css = compileThemeCSS(theme);
  const digest = sha256(utf8ToBytes(css));
  return bytesToHex(digest).slice(0, 16);
}

/**
 * Generates font link elements for HTML head
 */
export function generateFontLinks(
  fonts: ThemeConfig["fonts"]
): ResolvedFontLink[] {
  const links: ResolvedFontLink[] = [];

  for (const font of Object.values(fonts)) {
    if (font.source === "google") {
      const preconnect = {
        rel: "preconnect",
        href: "https://fonts.googleapis.com",
      };
      const preconnectStatic = {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous" as const,
      };
      const family = font.family.replaceAll(/\s+/g, "+");
      const weights = font.weights?.join(";") ?? "400;700";
      const stylesheet = {
        rel: "stylesheet",
        href: `https://fonts.googleapis.com/css2?family=${family}:wght@${weights}&display=swap`,
      };
      links.push(preconnect, preconnectStatic, stylesheet);
    } else if (font.source === "custom" && font.url) {
      links.push({
        rel: "stylesheet",
        href: font.url,
      });
    }
  }

  // Dedupe by href
  return links.filter(
    (link, index, self) => self.findIndex((l) => l.href === link.href) === index
  );
}

/**
 * Convenience helper returning link descriptor objects for HTML head consumption.
 * Alias around generateFontLinks for semantic clarity in routing layers.
 */
export function resolveFontLinks(
  fonts: ThemeConfig["fonts"]
): ResolvedFontLink[] {
  return generateFontLinks(fonts);
}

export type FontVariables = Record<"--font-sans" | "--font-mono", string>;

function formatFontValue(family: string, fallback: string): string {
  const sanitized = family.replaceAll('"', "'");
  return `"${sanitized}", ${fallback}`;
}

export function resolveFontVariables(
  fonts: ThemeConfig["fonts"]
): FontVariables {
  return {
    "--font-sans": formatFontValue(fonts.sans.family, "sans-serif"),
    "--font-mono": formatFontValue(fonts.mono.family, "monospace"),
  };
}
