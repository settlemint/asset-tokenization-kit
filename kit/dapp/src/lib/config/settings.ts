import { eq } from "drizzle-orm";
import { cache } from "react";
import { db } from "../db";
import {
  DEFAULT_SETTINGS,
  type SettingKey,
  settings,
} from "../db/schema-settings";

/**
 * Get a setting value by key, falling back to the default value if not set
 */
export const getSetting = cache(
  async <K extends SettingKey>(
    key: K
  ): Promise<(typeof DEFAULT_SETTINGS)[K]> => {
    const setting = await db.query.settings.findFirst({
      where: eq(settings.key, key),
    });
    return (
      (setting?.value as (typeof DEFAULT_SETTINGS)[K]) ?? DEFAULT_SETTINGS[key]
    );
  }
);

/**
 * Set a setting value by key and invalidate the cache
 */
export async function setSetting<K extends SettingKey>(
  key: K,
  value: (typeof DEFAULT_SETTINGS)[K]
): Promise<void> {
  await db
    .insert(settings)
    .values({
      key,
      value,
    })
    .onConflictDoUpdate({
      target: settings.key,
      set: { value },
    });

  // Revalidate the cache by calling the function again
  await getSetting(key);
}
