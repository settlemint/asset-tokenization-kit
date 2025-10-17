import { describe, expect, it } from "vitest";
import { compileThemeCSS, generateFontLinks, hashTheme } from "./compile-css";
import { DEFAULT_THEME, THEME_TOKENS } from "./schema";

describe("compile-css", () => {
  describe("compileThemeCSS", () => {
    it("generates CSS with :root selector", () => {
      const css = compileThemeCSS(DEFAULT_THEME);
      expect(css).toContain(":root {");
    });

    it("generates CSS with .dark selector", () => {
      const css = compileThemeCSS(DEFAULT_THEME);
      expect(css).toContain(".dark {");
    });

    it("includes all CSS variables from THEME_TOKENS", () => {
      const css = compileThemeCSS(DEFAULT_THEME);
      for (const token of THEME_TOKENS) {
        expect(css).toContain(`--${token}:`);
      }
    });

    it("outputs deterministic CSS", () => {
      const css1 = compileThemeCSS(DEFAULT_THEME);
      const css2 = compileThemeCSS(DEFAULT_THEME);
      expect(css1).toBe(css2);
    });

    it("handles Google Fonts", () => {
      const themeWithGoogleFont = {
        ...DEFAULT_THEME,
        fonts: {
          ...DEFAULT_THEME.fonts,
          sans: {
            family: "Inter",
            source: "google" as const,
            weights: [400, 700],
            preload: false,
          },
        },
      };
      const css = compileThemeCSS(themeWithGoogleFont);
      expect(css).toContain('@import url("https://fonts.googleapis.com');
      expect(css).toContain("Inter");
    });

    it("handles custom fonts", () => {
      const themeWithCustomFont = {
        ...DEFAULT_THEME,
        fonts: {
          ...DEFAULT_THEME.fonts,
          sans: {
            family: "Custom Font",
            source: "custom" as const,
            url: "https://example.com/font.css",
            preload: false,
          },
        },
      };
      const css = compileThemeCSS(themeWithCustomFont);
      expect(css).toContain('@import url("https://example.com/font.css")');
    });

    it("does not include fontsource imports", () => {
      const css = compileThemeCSS(DEFAULT_THEME);
      expect(css).not.toContain("Figtree");
      expect(css).not.toContain("Roboto Mono");
    });
  });

  describe("hashTheme", () => {
    it("generates consistent hash for same theme", () => {
      const hash1 = hashTheme(DEFAULT_THEME);
      const hash2 = hashTheme(DEFAULT_THEME);
      expect(hash1).toBe(hash2);
    });

    it("generates different hash for different themes", () => {
      const modifiedTheme = {
        ...DEFAULT_THEME,
        cssVars: {
          ...DEFAULT_THEME.cssVars,
          light: {
            ...DEFAULT_THEME.cssVars.light,
            "sm-text": "#000000",
          },
        },
      };
      const hash1 = hashTheme(DEFAULT_THEME);
      const hash2 = hashTheme(modifiedTheme);
      expect(hash1).not.toBe(hash2);
    });

    it("generates 16-character hash", () => {
      const hash = hashTheme(DEFAULT_THEME);
      expect(hash).toHaveLength(16);
    });

    it("generates hex-only hash", () => {
      const hash = hashTheme(DEFAULT_THEME);
      expect(/^[\da-f]+$/.test(hash)).toBe(true);
    });
  });

  describe("generateFontLinks", () => {
    it("returns empty array for fontsource fonts", () => {
      const links = generateFontLinks(DEFAULT_THEME.fonts);
      expect(links).toEqual([]);
    });

    it("generates preconnect links for Google Fonts", () => {
      const fonts = {
        sans: {
          family: "Inter",
          source: "google" as const,
          preload: false,
        },
        mono: DEFAULT_THEME.fonts.mono,
      };
      const links = generateFontLinks(fonts);
      expect(links.some((l) => l.href === "https://fonts.googleapis.com")).toBe(
        true
      );
      expect(links.some((l) => l.href === "https://fonts.gstatic.com")).toBe(
        true
      );
    });

    it("generates stylesheet link for Google Fonts", () => {
      const fonts = {
        sans: {
          family: "Inter",
          source: "google" as const,
          weights: [400, 700],
          preload: false,
        },
        mono: DEFAULT_THEME.fonts.mono,
      };
      const links = generateFontLinks(fonts);
      const stylesheet = links.find((l) => l.rel === "stylesheet");
      expect(stylesheet).toBeDefined();
      expect(stylesheet?.href).toContain("Inter");
      expect(stylesheet?.href).toContain("400;700");
    });

    it("handles spaces in font family names", () => {
      const fonts = {
        sans: {
          family: "Roboto Mono",
          source: "google" as const,
          preload: false,
        },
        mono: DEFAULT_THEME.fonts.mono,
      };
      const links = generateFontLinks(fonts);
      const stylesheet = links.find((l) => l.rel === "stylesheet");
      expect(stylesheet?.href).toContain("Roboto+Mono");
    });

    it("generates link for custom fonts", () => {
      const fonts = {
        sans: {
          family: "Custom",
          source: "custom" as const,
          url: "https://example.com/font.css",
          preload: false,
        },
        mono: DEFAULT_THEME.fonts.mono,
      };
      const links = generateFontLinks(fonts);
      expect(links.some((l) => l.href === "https://example.com/font.css")).toBe(
        true
      );
    });

    it("deduplicates links by href", () => {
      const fonts = {
        sans: {
          family: "Inter",
          source: "google" as const,
          preload: false,
        },
        mono: {
          family: "Inter",
          source: "google" as const,
          preload: false,
        },
      };
      const links = generateFontLinks(fonts);
      const hrefs = links.map((l) => l.href);
      const uniqueHrefs = new Set(hrefs);
      expect(hrefs.length).toBe(uniqueHrefs.size);
    });
  });
});
