import { settingKeySchema } from "@atk/zod/validators/settings-key";
import { z } from "zod";

/**
 * Schema for deleting a setting.
 *
 * Validates that the provided key exists in the predefined SETTING_KEYS.
 */
export const SettingsDeleteSchema = z.object({
  /**
   * The setting key to delete.
   * Must be one of the predefined SETTING_KEYS values.
   */
  key: settingKeySchema,
});
