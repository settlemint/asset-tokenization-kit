import { settingKeySchema } from "@/lib/zod/validators/settings-key";
import { z } from "zod/v4";

/**
 * Schema for creating a new setting.
 *
 * Validates the setting key and value before creation.
 */
export const SettingsCreateSchema = z.object({
  /**
   * The setting key to create.
   * Must be one of the predefined SETTING_KEYS values.
   */
  key: settingKeySchema,
  /**
   * The value to set for the setting.
   * Must be a non-empty string.
   */
  value: z.string().nonempty("Value cannot be empty"),
});
