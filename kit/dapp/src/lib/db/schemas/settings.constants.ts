import type { FiatCurrency } from "@atk/zod/fiat-currency";

/**
 * Valid setting keys
 */
export const SETTING_KEYS = [
  "BASE_CURRENCY",
  "SYSTEM_ADDRESS",
  "SYSTEM_ADDONS_SKIPPED",
] as const;

/**
 * Setting key type derived from the valid keys
 */
export type SettingKey = (typeof SETTING_KEYS)[number];

/**
 * Default values for each setting
 */
export const DEFAULT_SETTINGS: {
  BASE_CURRENCY: FiatCurrency;
  SYSTEM_ADDRESS: string;
  SYSTEM_ADDONS_SKIPPED: string;
} = {
  BASE_CURRENCY: "EUR", // Default currency - must be a valid fiat currency
  SYSTEM_ADDRESS: "", // Empty by default, should be set during deployment
  SYSTEM_ADDONS_SKIPPED: "false", // Whether user skipped system addons step
} as const;
