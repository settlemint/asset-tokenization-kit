import { ListSchema } from '@/orpc/routes/common/schemas/list.schema';
import { SettingSchema } from './settings.read.schema';

/**
 * Schema for listing settings.
 *
 * Uses the standard ListSchema for pagination parameters.
 */
export const SettingsListSchema = ListSchema;

/**
 * Output schema for listing settings.
 *
 * Returns an array of setting records.
 */
export const SettingsListOutputSchema = SettingSchema.array();
