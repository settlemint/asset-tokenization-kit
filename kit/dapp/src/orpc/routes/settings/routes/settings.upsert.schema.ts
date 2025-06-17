import { settingKeySchema } from "@/lib/zod/validators/settings-key";
import { z } from "zod/v4";

/**
 * Schema for updating an existing setting.
 *
 * Validates the setting key and new value before update.
 */
export const SettingsUpsertSchema = z.object({
  /**
   * The setting key to update.
   * Must be one of the predefined SETTING_KEYS values.
   */
  key: settingKeySchema,
  /**
   * The new value for the setting.
   * Must be a non-empty string.
   */
  value: z.string().min(1, "Value cannot be empty"),
});
