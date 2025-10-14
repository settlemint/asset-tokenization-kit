/**
 * Exchange Rates Database Schema
 *
 * This module defines the database schema for foreign exchange rate storage and management.
 * It implements a production-grade FX microservice schema optimized for:
 * - Fast retrieval of latest rates (p99 < 2ms)
 * - Efficient historical data scanning for charting and analysis
 * - Support for multiple rate providers
 * - High-precision rates for both traditional and crypto currencies
 *
 * The schema uses a dual-table design:
 * - `fx_rates`: Immutable time-series data for historical records
 * - `fx_rates_latest`: Hot cache table for current rates
 *
 * @module ExchangeRatesSchema
 */

import { fiatCurrency } from "@atk/zod/fiat-currency";
import {
  index,
  numeric,
  pgTable,
  primaryKey,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import * as z from "zod";

/**
 * Reference table for currency metadata.
 * Stores ISO-4217 currency codes and their properties.
 */
export const currencies = pgTable("currencies", {
  /** ISO-4217 currency code (e.g., 'USD', 'EUR') */
  code: varchar("code", { length: 3 }).primaryKey(),
  /** Full currency name */
  name: varchar("name", { length: 64 }).notNull(),
  /** Number of decimal places used by the currency (0-8) */
  decimals: numeric("decimals", { precision: 2, scale: 0 }).default("2"),
});

/**
 * Time-series table for exchange rate history.
 * Stores all historical exchange rates with provider information.
 * Designed for partitioning by month for efficient archival.
 *
 * Primary key: (baseCode, quoteCode, provider, effectiveAt)
 * This ensures uniqueness and supports efficient point lookups.
 */
export const fxRates = pgTable(
  "fx_rates",
  {
    /** Base currency code (what you're converting from) */
    baseCode: varchar("base_code", { length: 3 })
      .references(() => currencies.code, { onDelete: "restrict" })
      .notNull(),
    /** Quote currency code (what you're converting to) */
    quoteCode: varchar("quote_code", { length: 3 })
      .references(() => currencies.code, { onDelete: "restrict" })
      .notNull(),
    /** Rate provider identifier (e.g., 'ECB', 'er-api') */
    provider: varchar("provider", { length: 32 }).notNull(),
    /** Timestamp when this rate became effective */
    effectiveAt: timestamp("effective_at", { withTimezone: true }).notNull(),
    /** Exchange rate with high precision (38 digits, 18 decimal places) */
    rate: numeric("rate", { precision: 38, scale: 18 }).notNull(),
    /** Timestamp when this record was created */
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    /** Composite primary key for uniqueness */
    primaryKey({
      columns: [
        table.baseCode,
        table.quoteCode,
        table.provider,
        table.effectiveAt,
      ],
    }),
    /** Index for reverse pair lookups (e.g., finding EUR/USD when you have USD/EUR) */
    index("idx_fx_rates_quote_base_ts").on(
      table.quoteCode,
      table.baseCode,
      table.effectiveAt.desc()
    ),
    /** Index for forward pair lookups */
    index("idx_fx_rates_base_quote_ts").on(
      table.baseCode,
      table.quoteCode,
      table.effectiveAt.desc()
    ),
    /** Index for provider-specific queries */
    index("idx_fx_rates_provider_ts").on(
      table.provider,
      table.effectiveAt.desc()
    ),
  ]
);

/**
 * Latest rates cache table for O(1) retrieval.
 * Maintains exactly one row per currency pair and provider.
 * This small table (<1000 rows) stays in memory for sub-millisecond access.
 *
 * Updated via UPSERT whenever new rates arrive.
 */
export const fxRatesLatest = pgTable(
  "fx_rates_latest",
  {
    /** Base currency code */
    baseCode: varchar("base_code", { length: 3 })
      .references(() => currencies.code, { onDelete: "restrict" })
      .notNull(),
    /** Quote currency code */
    quoteCode: varchar("quote_code", { length: 3 })
      .references(() => currencies.code, { onDelete: "restrict" })
      .notNull(),
    /** Rate provider identifier */
    provider: varchar("provider", { length: 32 }).notNull(),
    /** Current exchange rate */
    rate: numeric("rate", { precision: 38, scale: 18 }).notNull(),
    /** When this rate became effective */
    effectiveAt: timestamp("effective_at", { withTimezone: true }).notNull(),
    /** When this record was last updated */
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    /** Primary key ensures one rate per pair/provider */
    primaryKey({
      columns: [table.baseCode, table.quoteCode, table.provider],
    }),
    /** Index for reverse pair lookups */
    index("idx_fx_latest_quote_base").on(table.quoteCode, table.baseCode),
    /** Index for finding all rates from a provider */
    index("idx_fx_latest_provider").on(table.provider),
  ]
);

/**
 * Type exports for TypeScript usage
 */
export type Currency = typeof currencies.$inferSelect;
export type NewCurrency = typeof currencies.$inferInsert;
export type FxRate = typeof fxRates.$inferSelect;
export type NewFxRate = typeof fxRates.$inferInsert;
export type FxRateLatest = typeof fxRatesLatest.$inferSelect;
export type NewFxRateLatest = typeof fxRatesLatest.$inferInsert;

/**
 * Zod schemas for validation
 */

// Currency schemas
export const insertCurrencySchema = z.object({
  code: z.string().length(3),
  name: z.string().max(64),
  decimals: z
    .string()
    .regex(/^[0-8]$/)
    .optional(),
});

export const selectCurrencySchema = z.object({
  code: z.string().length(3),
  name: z.string().max(64),
  decimals: z
    .string()
    .regex(/^[0-8]$/)
    .nullable(),
});

// Exchange rate providers
const exchangeRateProvider = z.enum(["er-api", "ECB", "manual"]);

// Custom validation schemas for input data
export const currencyDataSchema = z.object({
  code: fiatCurrency(),
  name: z.string(),
  decimals: z
    .string()
    .regex(/^[0-8]$/, "Decimals must be between 0 and 8")
    .optional(),
});

export const fxRateDataSchema = z.object({
  baseCode: fiatCurrency(),
  quoteCode: fiatCurrency(),
  provider: exchangeRateProvider,
  rate: z.string().refine(
    (val) => {
      // Validate positive decimal numbers
      if (!val || val.trim() === "") return false;

      // Trim the value for validation
      const trimmed = val.trim();

      // Check length bounds first
      if (trimmed.length > 40) return false;

      // Use a simpler regex pattern to avoid ReDoS
      const parts = trimmed.split(".");
      if (parts.length > 2) return false;

      // Check if all parts are valid digits
      if (!parts.every((part) => part.length > 0 && /^\d+$/.test(part)))
        return false;

      // Ensure the number is positive (not zero)
      const num = Number.parseFloat(trimmed);
      return num > 0 && Number.isFinite(num);
    },
    {
      message: "Rate must be a positive decimal number",
    }
  ),
  effectiveAt: z.date(),
  createdAt: z.date().optional(),
});

export const fxRateLatestDataSchema = z.object({
  baseCode: fiatCurrency(),
  quoteCode: fiatCurrency(),
  provider: exchangeRateProvider,
  rate: z.string().refine(
    (val) => {
      // Validate positive decimal numbers
      if (!val || val.trim() === "") return false;

      // Trim the value for validation
      const trimmed = val.trim();

      // Check length bounds first
      if (trimmed.length > 40) return false;

      // Use a simpler regex pattern to avoid ReDoS
      const parts = trimmed.split(".");
      if (parts.length > 2) return false;

      // Check if all parts are valid digits
      if (!parts.every((part) => part.length > 0 && /^\d+$/.test(part)))
        return false;

      // Ensure the number is positive (not zero)
      const num = Number.parseFloat(trimmed);
      return num > 0 && Number.isFinite(num);
    },
    {
      message: "Rate must be a positive decimal number",
    }
  ),
  effectiveAt: z.date(),
  updatedAt: z.date().optional(),
});

// FX rates schemas
export const insertFxRateSchema = z.object({
  baseCode: z.string().length(3),
  quoteCode: z.string().length(3),
  provider: z.string().max(32),
  effectiveAt: z.date(),
  rate: z.string(),
  createdAt: z.date().optional(),
});

export const selectFxRateSchema = z.object({
  baseCode: z.string().length(3),
  quoteCode: z.string().length(3),
  provider: z.string().max(32),
  effectiveAt: z.date(),
  rate: z.string(),
  createdAt: z.date(),
});

// FX rates latest schemas
export const insertFxRateLatestSchema = z.object({
  baseCode: z.string().length(3),
  quoteCode: z.string().length(3),
  provider: z.string().max(32),
  rate: z.string(),
  effectiveAt: z.date(),
  updatedAt: z.date().optional(),
});

export const selectFxRateLatestSchema = z.object({
  baseCode: z.string().length(3),
  quoteCode: z.string().length(3),
  provider: z.string().max(32),
  rate: z.string(),
  effectiveAt: z.date(),
  updatedAt: z.date(),
});

// Parsed types from schemas
export type InsertCurrency = z.infer<typeof insertCurrencySchema>;
export type SelectCurrency = z.infer<typeof selectCurrencySchema>;
export type InsertFxRate = z.infer<typeof insertFxRateSchema>;
export type SelectFxRate = z.infer<typeof selectFxRateSchema>;
export type InsertFxRateLatest = z.infer<typeof insertFxRateLatestSchema>;
export type SelectFxRateLatest = z.infer<typeof selectFxRateLatestSchema>;
