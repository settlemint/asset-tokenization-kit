import { describe, expect, it } from "vitest";
import {
  assertThemeTokens,
  DEFAULT_THEME,
  themeConfigSchema,
  THEME_TOKENS,
} from "./schema";

describe("theme schema", () => {
  describe("themeConfigSchema", () => {
    it("validates DEFAULT_THEME successfully", () => {
      const result = themeConfigSchema.safeParse(DEFAULT_THEME);
      expect(result.success).toBe(true);
    });

    it("rejects theme with missing tokens", () => {
      const invalidTheme = {
        ...DEFAULT_THEME,
        cssVars: {
          light: {},
          dark: {},
        },
      };
      const result = themeConfigSchema.safeParse(invalidTheme);
      expect(result.success).toBe(false);
    });

    it("rejects invalid CSS values with url()", () => {
      const invalidTheme = {
        ...DEFAULT_THEME,
        cssVars: {
          ...DEFAULT_THEME.cssVars,
          light: {
            ...DEFAULT_THEME.cssVars.light,
            "sm-text": "url(javascript:alert(1))",
          },
        },
      };
      const result = themeConfigSchema.safeParse(invalidTheme);
      expect(result.success).toBe(false);
    });

    it("rejects CSS values with script tags", () => {
      const invalidTheme = {
        ...DEFAULT_THEME,
        cssVars: {
          ...DEFAULT_THEME.cssVars,
          light: {
            ...DEFAULT_THEME.cssVars.light,
            "sm-text": "<script>alert(1)</script>",
          },
        },
      };
      const result = themeConfigSchema.safeParse(invalidTheme);
      expect(result.success).toBe(false);
    });

    it("accepts valid hex colors", () => {
      const validTheme = {
        ...DEFAULT_THEME,
        cssVars: {
          light: {
            ...DEFAULT_THEME.cssVars.light,
            "sm-text": "#ff0000",
          },
          dark: DEFAULT_THEME.cssVars.dark,
        },
      };
      const result = themeConfigSchema.safeParse(validTheme);
      expect(result.success).toBe(true);
    });

    it("accepts valid oklch colors", () => {
      const validTheme = {
        ...DEFAULT_THEME,
        cssVars: {
          light: {
            ...DEFAULT_THEME.cssVars.light,
            "sm-text": "oklch(0.5 0.2 180)",
          },
          dark: DEFAULT_THEME.cssVars.dark,
        },
      };
      const result = themeConfigSchema.safeParse(validTheme);
      expect(result.success).toBe(true);
    });

    it("accepts CSS variable references", () => {
      const validTheme = {
        ...DEFAULT_THEME,
        cssVars: {
          light: {
            ...DEFAULT_THEME.cssVars.light,
            "sm-text": "var(--sm-accent)",
          },
          dark: DEFAULT_THEME.cssVars.dark,
        },
      };
      const result = themeConfigSchema.safeParse(validTheme);
      expect(result.success).toBe(true);
    });

    it("rejects CSS values over 256 characters", () => {
      const longValue = "a".repeat(257);
      const invalidTheme = {
        ...DEFAULT_THEME,
        cssVars: {
          light: {
            ...DEFAULT_THEME.cssVars.light,
            "sm-text": longValue,
          },
          dark: DEFAULT_THEME.cssVars.dark,
        },
      };
      const result = themeConfigSchema.safeParse(invalidTheme);
      expect(result.success).toBe(false);
    });
  });

  describe("assertThemeTokens", () => {
    it("returns empty arrays for valid theme", () => {
      const result = assertThemeTokens(DEFAULT_THEME);
      expect(result.lightMissing).toEqual([]);
      expect(result.lightExtra).toEqual([]);
      expect(result.darkMissing).toEqual([]);
      expect(result.darkExtra).toEqual([]);
    });

    it("detects missing tokens in light mode", () => {
      const { "sm-text": _removed, ...rest } = DEFAULT_THEME.cssVars.light;
      const incompleteTheme = {
        cssVars: {
          light: rest,
          dark: DEFAULT_THEME.cssVars.dark,
        },
      };
      const result = assertThemeTokens(incompleteTheme);
      expect(result.lightMissing).toContain("sm-text");
    });

    it("detects extra tokens in dark mode", () => {
      const themeWithExtra = {
        cssVars: {
          light: DEFAULT_THEME.cssVars.light,
          dark: {
            ...DEFAULT_THEME.cssVars.dark,
            "custom-token": "#ff0000",
          },
        },
      };
      const result = assertThemeTokens(themeWithExtra);
      expect(result.darkExtra).toContain("custom-token");
    });

    it("returns sorted arrays", () => {
      const {
        "sm-text": _a,
        "sm-accent": _b,
        ...rest
      } = DEFAULT_THEME.cssVars.light;
      const incompleteTheme = {
        cssVars: {
          light: rest,
          dark: DEFAULT_THEME.cssVars.dark,
        },
      };
      const result = assertThemeTokens(incompleteTheme);
      expect(result.lightMissing).toEqual([...result.lightMissing].toSorted());
    });
  });

  describe("THEME_TOKENS", () => {
    it("contains all expected token categories", () => {
      const tokens = [...THEME_TOKENS];
      expect(tokens.some((t) => t.startsWith("sm-"))).toBe(true);
      expect(tokens.some((t) => t.startsWith("sidebar-"))).toBe(true);
      expect(tokens.some((t) => t.startsWith("chart-"))).toBe(true);
    });

    it("has no duplicate tokens", () => {
      const uniqueTokens = new Set(THEME_TOKENS);
      expect(uniqueTokens.size).toBe(THEME_TOKENS.length);
    });
  });
});
