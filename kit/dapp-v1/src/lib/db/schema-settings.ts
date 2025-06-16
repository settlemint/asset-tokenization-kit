import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import type { fiatCurrencies } from "../utils/typebox/fiat-currency";

/** Type for valid currency codes */
export type CurrencyCode = (typeof fiatCurrencies)[number];

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

/** Type-safe keys for settings table */
export const SETTING_KEYS = {
  /** The base currency symbol used throughout the application */
  BASE_CURRENCY: "baseCurrency",
} as const;

/** Type for valid setting keys */
export type SettingKey = (typeof SETTING_KEYS)[keyof typeof SETTING_KEYS];

/** Default values for settings */
export const DEFAULT_SETTINGS: {
  [SETTING_KEYS.BASE_CURRENCY]: CurrencyCode;
} = {
  [SETTING_KEYS.BASE_CURRENCY]: "EUR",
};
