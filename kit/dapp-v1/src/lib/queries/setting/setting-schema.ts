import { SETTING_KEYS } from "@/lib/db/schema-settings";
import { t, type StaticDecode } from "@/lib/utils/typebox";
import type { NonEmptyArray } from "../../utils/non-empty-array";

const settingKeys = Object.values(SETTING_KEYS);

/**
 * TypeBox schema for setting key
 *
 * Represents a setting key
 */
export const SettingKeySchema = t.UnionEnum(
  settingKeys as NonEmptyArray<(typeof settingKeys)[number]>
);

/**
 * TypeBox schema for setting data
 *
 * Represents a setting with a key and value
 */
export const SettingSchema = t.Object({
  key: SettingKeySchema,
  value: t.String(),
});

/**
 * Type for decoded setting data
 *
 * Represents a setting with a key and value
 */
export type Setting = StaticDecode<typeof SettingSchema>;
