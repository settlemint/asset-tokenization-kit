import { z } from 'zod/v4';
import { settingKeySchema } from '@/lib/zod/validators/settings-key';

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
