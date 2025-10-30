import { cssColor } from "@atk/zod/css-color";
import { httpURL } from "@atk/zod/http-url";
import { isoDateTime } from "@atk/zod/iso-datetime";
import { z } from "zod";

// Allows theme assets to reference remote URLs or app-hosted paths
const themeAssetURL = z
  .string()
  .max(2048, "URL must be at most 2048 characters")
  .refine(
    (value) => value.startsWith("/") || httpURL.safeParse(value).success,
    {
      message: "Must be an HTTP(S) URL or absolute path",
    }
  );

/**
 * All theme tokens that can be customized
 * Maps directly to CSS variables in app.css
 */
export const THEME_TOKENS = [
  // SettleMint Brand Colors
  "sm-text",
  "sm-text-contrast",
  "sm-accent",
  "sm-accent-hover",
  "sm-background-darkest",
  "sm-background-lightest",
  "sm-background-gradient-start",
  "sm-background-gradient-end",
  "sm-state-success",
  "sm-state-success-background",
  "sm-state-success-fg-deep",
  "sm-state-warning",
  "sm-state-warning-background",
  "sm-state-error",
  "sm-state-error-background",
  "sm-graphics-primary",
  "sm-graphics-secondary",
  "sm-graphics-tertiary",
  "sm-graphics-quaternary",
  "sm-colored-shadow",
  "sm-inset-shadow",
  "sm-muted",
  "sm-border",
  "radius",
] as const;

export type ThemeToken = (typeof THEME_TOKENS)[number];

/**
 * Schema for CSS color values
 * Uses the cssColor validator from @atk/zod
 */
const cssValueSchema = cssColor;

/**
 * Schema for theme variables per color mode
 * All tokens from THEME_TOKENS must be present
 */
const themeVarsSchema = z.object(
  THEME_TOKENS.reduce(
    (acc, token) => {
      acc[token] = cssValueSchema;
      return acc;
    },
    {} as Record<ThemeToken, z.ZodType<string>>
  )
);

/**
 * Font source types
 */
export const fontSourceSchema = z.enum(["fontsource", "google", "custom"]);

/**
 * Font configuration
 */
const fontSchema = z.object({
  family: z.string().min(1).max(100),
  source: fontSourceSchema,
  weights: z.array(z.number().int().min(100).max(900)).optional(),
  preload: z.boolean().optional().default(false),
  url: httpURL.optional(), // for custom fonts
});

/**
 * Logo configuration
 */
const logoSchema = z.object({
  lightUrl: themeAssetURL.optional(),
  darkUrl: themeAssetURL.optional(),
  lightIconUrl: themeAssetURL.optional(),
  darkIconUrl: themeAssetURL.optional(),
  alt: z.string().max(200).optional().default("Logo"),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  etag: z.string().optional(),
  updatedAt: isoDateTime.optional(),
});

/**
 * Theme metadata
 */
const metadataSchema = z.object({
  version: z.number().int().gte(1).default(1),
  updatedBy: z.string().min(1),
  updatedAt: isoDateTime,
  previewHash: z.string().optional(),
});

/**
 * Complete theme configuration
 */
export const themeConfigSchema = z.object({
  logo: logoSchema,
  fonts: z.object({
    sans: fontSchema,
    mono: fontSchema,
  }),
  cssVars: z.object({
    light: themeVarsSchema,
    dark: themeVarsSchema,
  }),
  metadata: metadataSchema,
});

export const themeConfigPartialSchema = z.object({
  logo: logoSchema.partial().optional(),
  fonts: z
    .object({
      sans: fontSchema.partial().optional(),
      mono: fontSchema.partial().optional(),
    })
    .partial()
    .optional(),
  cssVars: z
    .object({
      light: themeVarsSchema.partial().optional(),
      dark: themeVarsSchema.partial().optional(),
    })
    .partial()
    .optional(),
  metadata: metadataSchema.partial().optional(),
});
export type ThemeConfigPartial = z.infer<typeof themeConfigPartialSchema>;

export type ThemeConfig = z.infer<typeof themeConfigSchema>;
export type ThemeVars = z.infer<typeof themeVarsSchema>;
export type FontConfig = z.infer<typeof fontSchema>;
export type LogoConfig = z.infer<typeof logoSchema>;
export type ThemeMetadata = z.infer<typeof metadataSchema>;

/**
 * Helper to assert all theme tokens are present
 * Returns lists of missing and extra keys
 */
export function assertThemeTokens(theme: {
  cssVars: { light: Record<string, string>; dark: Record<string, string> };
}): {
  lightMissing: string[];
  lightExtra: string[];
  darkMissing: string[];
  darkExtra: string[];
} {
  const tokenSet = new Set(THEME_TOKENS);

  const lightKeys = new Set(Object.keys(theme.cssVars.light));
  const darkKeys = new Set(Object.keys(theme.cssVars.dark));

  const lightMissing = [...tokenSet]
    .filter((t) => !lightKeys.has(t))
    .toSorted();
  const lightExtra = [...lightKeys]
    .filter((k) => !tokenSet.has(k as ThemeToken))
    .toSorted();

  const darkMissing = [...tokenSet].filter((t) => !darkKeys.has(t)).toSorted();
  const darkExtra = [...darkKeys]
    .filter((k) => !tokenSet.has(k as ThemeToken))
    .toSorted();

  return {
    lightMissing,
    lightExtra,
    darkMissing,
    darkExtra,
  };
}

export function cloneThemeConfig(theme: ThemeConfig): ThemeConfig {
  if (typeof structuredClone === "function") {
    return structuredClone(theme);
  }
  return {
    logo: { ...theme.logo },
    fonts: {
      sans: { ...theme.fonts.sans },
      mono: { ...theme.fonts.mono },
    },
    cssVars: {
      light: { ...theme.cssVars.light },
      dark: { ...theme.cssVars.dark },
    },
    metadata: { ...theme.metadata },
  };
}

/**
 * Default theme configuration matching current app.css
 */
export const DEFAULT_THEME: ThemeConfig = {
  logo: {
    alt: "SettleMint",
    lightUrl: "/logos/settlemint-logo-h-lm.svg",
    darkUrl: "/logos/settlemint-logo-h-dm.svg",
    lightIconUrl: "/logos/settlemint-logo-i-lm.svg",
    darkIconUrl: "/logos/settlemint-logo-i-dm.svg",
  },
  fonts: {
    sans: {
      family: "Figtree Variable",
      source: "fontsource",
      preload: true,
    },
    mono: {
      family: "Roboto Mono Variable",
      source: "fontsource",
      preload: true,
    },
  },
  cssVars: {
    light: {
      "sm-text": "oklch(0.2264 0 87)",
      "sm-text-contrast": "oklch(1 0 87)",
      "sm-accent": "oklch(0.5745 0.2028 263.15)",
      "sm-accent-hover": "oklch(0.5745 0.2028 263.15 / 0.2)",
      "sm-background-darkest": "oklch(0.9359 0.0275 265.45)",
      "sm-background-lightest": "oklch(0.967 0.014 268.49)",
      "sm-background-gradient-start": "oklch(0.9886 0.0026 286.35)",
      "sm-background-gradient-end": "oklch(0.9691 0.0103 261.79)",
      "sm-state-success": "oklch(0.2264 0 87)",
      "sm-state-success-background": "oklch(0.812 0.1064 153.89)",
      "sm-state-success-fg-deep": "hsl(140, 100%, 27%)",
      "sm-state-warning": "oklch(0.2264 0 87)",
      "sm-state-warning-background": "oklch(0.8354 0.1274 72.2)",
      "sm-state-error": "oklch(0.2264 0 87)",
      "sm-state-error-background": "oklch(0.7044 0.1872 23.19)",
      "sm-graphics-primary": "oklch(0.7675 0.0982 182.83)",
      "sm-graphics-secondary": "oklch(0.7284 0.1133 210.64)",
      "sm-graphics-tertiary": "oklch(0.6396 0.145 248.18)",
      "sm-graphics-quaternary": "oklch(0.6296 0.2209 300.47)",
      "sm-colored-shadow": "oklch(0.5745 0.2028 263.15 / 0.12)",
      "sm-inset-shadow": "rgba(0, 0, 0, 0.21)",
      "sm-muted": "oklch(0.2264 0 87 / 32%)",
      "sm-border": "oklch(0.2264 0 87 / 12%)",
      radius: "0.625rem",
    },
    dark: {
      "sm-text": "oklch(1 0 87)",
      "sm-text-contrast": "oklch(0.2264 0 87)",
      "sm-accent": "oklch(0.6219 0.1772 263.65)",
      "sm-accent-hover": "oklch(0.5745 0.2028 263.15 / 0.2)",
      "sm-background-darkest": "oklch(0.2264 0 0)",
      "sm-background-lightest": "oklch(0.2809 0 0)",
      "sm-background-gradient-start": "oklch(0.3368 0 0)",
      "sm-background-gradient-end": "oklch(0.3092 0 0)",
      "sm-state-success": "oklch(1 0 87)",
      "sm-state-success-background": "oklch(0.812 0.1064 153.89)",
      "sm-state-success-fg-deep": "hsl(140, 100%, 27%)",
      "sm-state-warning": "oklch(1 0 87)",
      "sm-state-warning-background": "oklch(0.8354 0.1274 72.2)",
      "sm-state-error": "oklch(1 0 87)",
      "sm-state-error-background": "oklch(0.7044 0.1872 23.19)",
      "sm-graphics-primary": "oklch(0.7675 0.0982 182.83)",
      "sm-graphics-secondary": "oklch(0.7284 0.1133 210.64)",
      "sm-graphics-tertiary": "oklch(0.6396 0.145 248.18)",
      "sm-graphics-quaternary": "oklch(0.6296 0.2209 300.47)",
      "sm-colored-shadow": "oklch(0.2264 0 0)",
      "sm-inset-shadow": "rgba(0, 0, 0, 0.21)",
      "sm-muted": "oklch(1 0 87 / 32%)",
      "sm-border": "oklch(1 0 87 / 12%)",
      radius: "0.625rem",
    },
  },
  metadata: {
    version: 1,
    updatedBy: "system",
    updatedAt: new Date().toISOString(),
  },
};
