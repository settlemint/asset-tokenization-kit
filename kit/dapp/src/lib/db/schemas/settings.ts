import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

/**
 * Valid setting keys
 */
export const SETTING_KEYS = ["BASE_CURRENCY", "SYSTEM_ADDRESS"] as const;

/**
 * Setting key type derived from the valid keys
 */
export type SettingKey = (typeof SETTING_KEYS)[number];

/**
 * Default values for each setting
 */
export const DEFAULT_SETTINGS: Record<SettingKey, string> = {
  BASE_CURRENCY: "EUR", // Default currency
  SYSTEM_ADDRESS: "", // Empty by default, should be set during deployment
} as const;

/**
 * Settings table schema for storing application-wide settings
 * Currently supports:
 * - baseCurrency: The default currency symbol for the application (defaults to EUR)
 */
export const settings = pgTable("settings", {
  /** The unique key identifying the setting */
  key: text("key").primaryKey(),
  /** The value of the setting */
  value: text("value").notNull(),
  /** When the setting was last updated */
  lastUpdated: timestamp("last_updated").notNull().defaultNow(),
});
