import type { FiatCurrency } from "@/lib/zod/validators/fiat-currency";
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
export const DEFAULT_SETTINGS: {
  BASE_CURRENCY: FiatCurrency;
  SYSTEM_ADDRESS: string;
} = {
  BASE_CURRENCY: "EUR", // Default currency - must be a valid fiat currency
  SYSTEM_ADDRESS: "", // Empty by default, should be set during deployment
} as const;

/**
 * Settings table schema for storing application-wide settings
 * Currently supports:
 * - BASE_CURRENCY: The default currency symbol for the application (defaults to EUR)
 * - SYSTEM_ADDRESS: The system's Ethereum address
 */
export const settings = pgTable("settings", {
  /** The unique key identifying the setting */
  key: text("key").primaryKey(),
  /** The value of the setting */
  value: text("value").notNull(),
  /** When the setting was last updated */
  lastUpdated: timestamp("last_updated").notNull().defaultNow(),
});
