import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

/**
 * Settings table schema for storing application-wide settings
 * Currently supports:
 * - BASE_CURRENCY: The default currency symbol for the application (defaults to EUR)
 * - SYSTEM_ADDRESS: The system's Ethereum address
 * - SYSTEM_ADDONS_SKIPPED: Whether the user has skipped the system addons step (defaults to false)
 */
export const settings = pgTable("settings", {
  /** The unique key identifying the setting */
  key: text("key").primaryKey(),
  /** The value of the setting */
  value: text("value").notNull(),
  /** When the setting was last updated */
  lastUpdated: timestamp("last_updated").notNull().defaultNow(),
});
