import { settingKeySchema } from "@atk/zod/settings-key";
import * as z from "zod";

/**
 * Schema for reading a single setting by key.
 *
 * Validates that the provided key exists in the predefined SETTING_KEYS
 * to ensure type safety and prevent arbitrary key access.
 */
export const SettingsReadSchema = z.object({
  /**
   * The setting key to retrieve.
   * Must be one of the predefined SETTING_KEYS values.
   */
  key: settingKeySchema,
});

/**
 * Output schema for a single setting.
 *
 * Represents the structure of a setting record from the database.
 */
export const SettingSchema = z.object({
  /** The unique key identifying the setting */
  key: z.string(),
  /** The value of the setting */
  value: z.string(),
  /** When the setting was last updated */
  lastUpdated: z.date(),
});
