import { db } from "@/lib/db";
import { settings } from "@/lib/db/schemas/settings";
import {
  DEFAULT_THEME,
  themeConfigPartialSchema,
  themeConfigSchema,
  type ThemeConfig,
  type ThemeConfigPartial,
} from "./schema";
import { and, eq, sql } from "drizzle-orm";

const THEME_KEY = "THEME";

export class ThemeVersionConflictError extends Error {
  constructor() {
    super("Theme version conflict");
    this.name = "ThemeVersionConflictError";
  }
}

/**
 * Fetches the theme configuration from the database
 * Falls back to DEFAULT_THEME if not found or invalid
 */
export async function getTheme(): Promise<ThemeConfig> {
  const result = await db
    .select()
    .from(settings)
    .where(eq(settings.key, THEME_KEY))
    .limit(1);

  if (!result[0]?.value) {
    return DEFAULT_THEME;
  }

  try {
    const parsed = JSON.parse(result[0].value);
    const theme = themeConfigSchema.parse(parsed);
    return theme;
  } catch {
    return DEFAULT_THEME;
  }
}

/**
 * Updates the theme configuration in the database
 * Bumps version and updates metadata
 */
export async function updateTheme(
  theme: ThemeConfig,
  updatedBy: string
): Promise<ThemeConfig> {
  const updatedAt = new Date().toISOString();
  const previousVersion = theme.metadata.version;
  const newTheme: ThemeConfig = {
    ...theme,
    metadata: {
      ...theme.metadata,
      version: theme.metadata.version + 1,
      updatedBy,
      updatedAt,
    },
  };
  const serializedTheme = JSON.stringify(newTheme);
  const timestamp = new Date();

  const updated = await db
    .update(settings)
    .set({
      value: serializedTheme,
      lastUpdated: timestamp,
    })
    .where(
      and(
        eq(settings.key, THEME_KEY),
        sql`((${settings.value})::jsonb -> 'metadata' ->> 'version')::int = ${previousVersion}`
      )
    )
    .returning({ key: settings.key });

  if (updated.length === 0) {
    const inserted = await db
      .insert(settings)
      .values({
        key: THEME_KEY,
        value: serializedTheme,
        lastUpdated: timestamp,
      })
      .onConflictDoNothing()
      .returning({ key: settings.key });

    if (inserted.length === 0) {
      throw new ThemeVersionConflictError();
    }
  }

  return newTheme;
}

export function mergeTheme(
  base: ThemeConfig,
  partial: ThemeConfigPartial
): ThemeConfig {
  const merged: ThemeConfig = {
    logo: { ...base.logo, ...(partial.logo ?? {}) },
    images: { ...base.images, ...(partial.images ?? {}) },
    fonts: {
      sans: { ...base.fonts.sans, ...partial.fonts?.sans },
      mono: { ...base.fonts.mono, ...partial.fonts?.mono },
    },
    cssVars: {
      light: {
        ...base.cssVars.light,
        ...partial.cssVars?.light,
      },
      dark: {
        ...base.cssVars.dark,
        ...partial.cssVars?.dark,
      },
    },
    metadata: { ...base.metadata, ...partial.metadata },
  };

  return themeConfigSchema.parse(merged);
}

/**
 * Patches the theme configuration with partial updates
 * Merges changes with existing theme
 */
export async function patchTheme(
  partial: ThemeConfigPartial,
  updatedBy: string
): Promise<ThemeConfig> {
  const currentTheme = await getTheme();

  themeConfigPartialSchema.parse(partial);

  const updatedTheme = mergeTheme(currentTheme, partial);

  return updateTheme(updatedTheme, updatedBy);
}

/**
 * Resets the theme to default by deleting the row
 */
export async function resetTheme(): Promise<void> {
  await db.delete(settings).where(eq(settings.key, THEME_KEY));
}
