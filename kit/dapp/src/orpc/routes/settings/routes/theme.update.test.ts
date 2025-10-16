import { describe, it, expect } from "vitest";
import { ThemeUpdateSchema } from "./theme.update.schema";
import { DEFAULT_THEME } from "@/components/theme/schema";

describe("theme update schema validation", () => {
  it("should accept valid theme configuration", () => {
    const result = ThemeUpdateSchema.safeParse(DEFAULT_THEME);
    expect(result.success).toBe(true);
  });

  it("should reject invalid CSS colors", () => {
    const invalidTheme = {
      ...DEFAULT_THEME,
      cssVars: {
        ...DEFAULT_THEME.cssVars,
        light: {
          ...DEFAULT_THEME.cssVars.light,
          primary: "not-a-color",
        },
      },
    };

    const result = ThemeUpdateSchema.safeParse(invalidTheme);
    expect(result.success).toBe(false);
  });

  it("should reject invalid HTTP URLs in lightUrl", () => {
    const invalidTheme = {
      ...DEFAULT_THEME,
      logo: {
        ...DEFAULT_THEME.logo,
        lightUrl: "ftp://invalid.url",
      },
    };

    const result = ThemeUpdateSchema.safeParse(invalidTheme);
    expect(result.success).toBe(false);
  });

  it("should reject invalid HTTP URLs in darkUrl", () => {
    const invalidTheme = {
      ...DEFAULT_THEME,
      logo: {
        ...DEFAULT_THEME.logo,
        darkUrl: "javascript:alert('xss')",
      },
    };

    const result = ThemeUpdateSchema.safeParse(invalidTheme);
    expect(result.success).toBe(false);
  });

  it("should reject invalid HTTP URLs in custom font", () => {
    const invalidTheme = {
      ...DEFAULT_THEME,
      fonts: {
        ...DEFAULT_THEME.fonts,
        sans: {
          ...DEFAULT_THEME.fonts.sans,
          source: "custom" as const,
          url: "ftp://fonts.example.com/font.woff2",
        },
      },
    };

    const result = ThemeUpdateSchema.safeParse(invalidTheme);
    expect(result.success).toBe(false);
  });

  it("should reject missing required fields", () => {
    const invalidTheme = {
      cssVars: DEFAULT_THEME.cssVars,
      // Missing fonts, logo, metadata
    };

    const result = ThemeUpdateSchema.safeParse(invalidTheme);
    expect(result.success).toBe(false);
  });

  it("should reject invalid metadata version", () => {
    const invalidTheme = {
      ...DEFAULT_THEME,
      metadata: {
        ...DEFAULT_THEME.metadata,
        version: -1,
      },
    };

    const result = ThemeUpdateSchema.safeParse(invalidTheme);
    expect(result.success).toBe(false);
  });

  it("should reject non-integer version", () => {
    const invalidTheme = {
      ...DEFAULT_THEME,
      metadata: {
        ...DEFAULT_THEME.metadata,
        version: 1.5,
      },
    };

    const result = ThemeUpdateSchema.safeParse(invalidTheme);
    expect(result.success).toBe(false);
  });
});
