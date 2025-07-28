import { z } from "zod";

export const SETTING_KEYS = [
  "BASE_CURRENCY",
  "SYSTEM_ADDRESS",
  "SYSTEM_ADDONS_SKIPPED",
] as const;

export type SettingKey = (typeof SETTING_KEYS)[number];

export const settingKeySchema = z.enum(SETTING_KEYS);
