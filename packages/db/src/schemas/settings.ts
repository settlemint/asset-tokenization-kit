/**
 * Application Settings Database Schema
 *
 * This module defines the schema for storing system-wide configuration settings
 * that persist across application restarts and deployments.
 *
 * DESIGN PRINCIPLES:
 * - Key-value store: Flexible schema accommodates varying setting types
 * - Type safety: Compile-time validation of setting keys and default values
 * - Immutable defaults: Fallback values defined at compile time
 * - Audit trail: Modification timestamps for configuration change tracking
 *
 * SECURITY CONSIDERATIONS:
 * - No sensitive data: Database settings are not encrypted (use env vars for secrets)
 * - Access control: Settings modification requires admin privileges
 * - Input validation: All setting values validated against type schemas
 * - Change auditing: All modifications logged for security monitoring
 *
 * OPERATIONAL BENEFITS:
 * - Runtime configuration: Settings changeable without code deployment
 * - Feature flags: Enable/disable functionality via database flags
 * - A/B testing: Configure experimental features dynamically
 * - Disaster recovery: Settings backed up with database snapshots
 *
 * @module SettingsSchema
 */

import type { FiatCurrency } from "@atk/zod/validators/fiat-currency";
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

/**
 * Valid setting keys enumeration.
 *
 * WHY CONST ASSERTION INSTEAD OF ENUM:
 * - TypeScript literal types: Provides exact string type inference
 * - Tree shaking: Dead code elimination removes unused settings
 * - Compile-time safety: Invalid keys caught at build time
 * - Runtime validation: Array can be used for input validation
 *
 * ADDING NEW SETTINGS:
 * 1. Add key to SETTING_KEYS array
 * 2. Add default value to DEFAULT_SETTINGS object
 * 3. Update type definitions if needed
 * 4. Consider migration for existing deployments
 */
export const SETTING_KEYS = [
  // BUSINESS: Default currency for asset pricing and financial calculations
  "BASE_CURRENCY",

  // INTEGRATION: Blockchain system contract address for asset operations
  "SYSTEM_ADDRESS",

  // UX: Onboarding flow state - whether user completed addon configuration
  "SYSTEM_ADDONS_SKIPPED",
] as const;

/**
 * Setting key type derived from the valid keys array.
 * Provides compile-time type safety for setting operations.
 */
export type SettingKey = (typeof SETTING_KEYS)[number];

/**
 * Default values for each setting with type safety guarantees.
 *
 * DESIGN RATIONALE:
 * - Explicit typing: Ensures default values match expected setting types
 * - Const assertion: Prevents accidental modification of defaults
 * - Validation integration: Defaults serve as examples for setting validators
 * - Deployment safety: Missing database settings fall back to safe defaults
 *
 * VALUE CHOICES:
 * - EUR default: European regulatory compliance and market focus
 * - Empty system address: Forces explicit configuration during deployment
 * - False addon skip: Default to full onboarding experience
 */
export const DEFAULT_SETTINGS: {
  BASE_CURRENCY: FiatCurrency;
  SYSTEM_ADDRESS: string;
  SYSTEM_ADDONS_SKIPPED: string;
} = {
  // WHY EUR: European market focus and regulatory framework alignment
  // BUSINESS: Can be changed to USD, GBP, etc. based on deployment region
  BASE_CURRENCY: "EUR",

  // WHY EMPTY: Forces explicit configuration during deployment setup
  // SECURITY: Prevents accidental use of wrong contract address
  SYSTEM_ADDRESS: "",

  // WHY FALSE: Default to complete onboarding for better user education
  // UX: Users must explicitly choose to skip addon configuration
  SYSTEM_ADDONS_SKIPPED: "false",
} as const;

/**
 * Settings table - key-value store for application configuration.
 *
 * SCHEMA DESIGN RATIONALE:
 * - Key-value pattern: Flexible schema supports diverse configuration types
 * - Text primary key: Human-readable setting identification for debugging
 * - Text values: String storage accommodates all setting types with app-level parsing
 * - No foreign keys: Settings are independent of user/tenant data
 *
 * PERFORMANCE CHARACTERISTICS:
 * - Small table: <100 rows expected, entirely cached in memory
 * - Primary key lookups: O(1) setting retrieval by key
 * - No indexes needed: Single primary key sufficient for all queries
 * - Infrequent writes: Settings modified rarely, optimized for reads
 *
 * OPERATIONAL CONSIDERATIONS:
 * - Backup critical: Settings loss would require full reconfiguration
 * - Migration safe: New settings can be added without schema changes
 * - Monitoring ready: lastUpdated enables change detection alerts
 * - Debug friendly: Human-readable keys simplify troubleshooting
 */
export const settings = pgTable("settings", {
  // WHY TEXT PRIMARY KEY: Human-readable setting identification and validation
  // PERFORMANCE: String comparison faster than integer joins for small dataset
  key: text("key").primaryKey(),

  // WHY TEXT VALUES: Accommodates string, number, boolean, and JSON setting types
  // FLEXIBILITY: Application-layer parsing handles type conversion and validation
  value: text("value").notNull(),

  // AUDIT: Configuration change tracking for operational monitoring
  // WHY DEFAULT NOW: Automatic timestamping reduces application complexity
  lastUpdated: timestamp("last_updated").notNull().defaultNow(),
});
