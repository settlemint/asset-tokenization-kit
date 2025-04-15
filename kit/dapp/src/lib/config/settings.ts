import { eq } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { db } from "../db";
import {
  DEFAULT_SETTINGS,
  type SettingKey,
  settings,
} from "../db/schema-settings";
import { withAccessControl } from "../utils/access-control";
import { withTracing } from "../utils/tracing";

/**
 * Get a setting value by key, falling back to the default value if not set
 */
export const getSetting = withAccessControl(
  {
    requiredPermissions: {
      setting: ["read"],
    },
  },
  withTracing(
    "queries",
    "getSetting",
    async ({
      key,
    }: {
      key: SettingKey;
    }): Promise<(typeof DEFAULT_SETTINGS)[SettingKey]> => {
      "use cache";
      cacheTag("setting");
      const setting = await db.query.settings.findFirst({
        where: eq(settings.key, key),
      });
      return (
        (setting?.value as (typeof DEFAULT_SETTINGS)[SettingKey]) ??
        DEFAULT_SETTINGS[key]
      );
    }
  )
);

/**
 * Set a setting value by key and invalidate the cache
 */
export const setSetting = withAccessControl(
  {
    requiredPermissions: {
      setting: ["update"],
    },
  },
  async <K extends SettingKey>({
    key,
    value,
  }: {
    key: K;
    value: (typeof DEFAULT_SETTINGS)[K];
  }): Promise<void> => {
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
    revalidateTag("setting");
  }
);
