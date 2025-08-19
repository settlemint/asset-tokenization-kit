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

import { fiatCurrency } from "@atk/zod/validators/fiat-currency";
import { index, numeric, pgTable, primaryKey, timestamp, varchar } from "drizzle-orm/pg-core";
import { z } from "zod";

/**
 * Currency reference table - master data for all supported currencies.
 *
 * WHY SEPARATE REFERENCE TABLE:
 * - Enforces referential integrity via foreign keys in rate tables
 * - Enables consistent currency validation across the platform
 * - Supports currency metadata like decimal precision for display
 * - Small table (~200 rows) cached entirely in memory for fast lookups
 *
 * PERFORMANCE CONSIDERATIONS:
 * - VARCHAR(3) primary key: Fixed-width for optimal index performance
 * - No additional indexes needed: Primary key sufficient for all lookups
 * - Immutable data: No update patterns to optimize for
 */
export const currencies = pgTable("currencies", {
  // WHY: ISO-4217 standard ensures global consistency and interoperability
  code: varchar("code", { length: 3 }).primaryKey(),

  // UX: Human-readable currency names for user interfaces
  name: varchar("name", { length: 64 }).notNull(),

  // PRECISION: Decimal places vary by currency (JPY=0, USD=2, crypto=8)
  // WHY: Numeric instead of integer to maintain PostgreSQL precision semantics
  decimals: numeric("decimals", { precision: 2, scale: 0 }).default("2"),
});

/**
 * Historical exchange rates table - immutable time-series data.
 *
 * ARCHITECTURAL DECISIONS:
 * - Composite primary key: Ensures rate uniqueness per provider/time
 * - Immutable design: Rates never update, only insert new records
 * - Provider separation: Multiple data sources for redundancy and validation
 * - High precision numeric: Handles both fiat (2-4 decimals) and crypto (18+ decimals)
 *
 * PERFORMANCE OPTIMIZATIONS:
 * - Descending time indexes: Latest rates first for typical query patterns
 * - Partition-ready: effectiveAt column supports monthly/yearly partitioning
 * - Compound indexes: Base/quote/time lookups in single index scan
 * - RESTRICT foreign keys: Prevents accidental currency deletion
 *
 * SCALING STRATEGY:
 * - Expected growth: ~10M rows/year with minute-level updates
 * - Archival pattern: Move old data to cold storage after 2+ years
 * - Read pattern: 90% queries on last 30 days of data
 */
export const fxRates = pgTable(
  "fx_rates",
  {
    // INTEGRITY: Foreign key with RESTRICT prevents orphaned rates
    baseCode: varchar("base_code", { length: 3 })
      .references(() => currencies.code, { onDelete: "restrict" })
      .notNull(),

    // INTEGRITY: Quote currency must exist in reference table
    quoteCode: varchar("quote_code", { length: 3 })
      .references(() => currencies.code, { onDelete: "restrict" })
      .notNull(),

    // WHY: Provider separation enables rate comparison and failover strategies
    provider: varchar("provider", { length: 32 }).notNull(),

    // PERFORMANCE: Timezone-aware timestamps enable global rate coordination
    effectiveAt: timestamp("effective_at", { withTimezone: true }).notNull(),

    // PRECISION: 38,18 handles extreme rates (1 BTC = 50,000 USD and micro-currencies)
    // WHY: PostgreSQL NUMERIC avoids floating-point precision errors in financial calculations
    rate: numeric("rate", { precision: 38, scale: 18 }).notNull(),

    // AUDIT: Ingestion timestamp for data pipeline monitoring
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    // WHY: Composite primary key prevents duplicate rates and enables efficient point lookups
    primaryKey({
      columns: [table.baseCode, table.quoteCode, table.provider, table.effectiveAt],
    }),

    // PERF: Reverse pair lookups for bidirectional rate calculations (EUR/USD -> USD/EUR)
    // WHY: DESC on timestamp prioritizes recent rates for cache locality
    index("idx_fx_rates_quote_base_ts").on(table.quoteCode, table.baseCode, table.effectiveAt.desc()),

    // PERF: Forward pair lookups - most common query pattern
    // WHY: Three-column index supports partial matching on base or base+quote
    index("idx_fx_rates_base_quote_ts").on(table.baseCode, table.quoteCode, table.effectiveAt.desc()),

    // PERF: Provider health monitoring and rate comparison queries
    // WHY: DESC timestamp enables "latest from each provider" queries
    index("idx_fx_rates_provider_ts").on(table.provider, table.effectiveAt.desc()),
  ]
);

/**
 * Latest rates cache table - hot cache for current exchange rates.
 *
 * CACHE DESIGN RATIONALE:
 * - Exactly one row per (base, quote, provider): Prevents stale data confusion
 * - Small table size: ~1000 rows fits entirely in PostgreSQL shared buffers
 * - UPSERT pattern: INSERT ... ON CONFLICT UPDATE for atomic rate updates
 * - Hot/cold separation: Avoids scanning millions of historical rows for current rates
 *
 * PERFORMANCE CHARACTERISTICS:
 * - Sub-millisecond lookups: Primary key index lookup
 * - Memory resident: Entire table cached in RAM for instant access
 * - Lock-free reads: MVCC allows concurrent access during updates
 * - Batch updates: Single transaction can update hundreds of rates atomically
 *
 * WHY DENORMALIZED FROM HISTORICAL TABLE:
 * - Latest rate queries are 1000x more frequent than historical queries
 * - Avoids expensive ORDER BY ... LIMIT 1 queries on time-series data
 * - Enables efficient rate comparison across providers
 * - Supports real-time rate monitoring with minimal latency
 */
export const fxRatesLatest = pgTable(
  "fx_rates_latest",
  {
    // INTEGRITY: Foreign key ensures only valid currencies have rates
    baseCode: varchar("base_code", { length: 3 })
      .references(() => currencies.code, { onDelete: "restrict" })
      .notNull(),

    // INTEGRITY: Quote currency validation prevents invalid pairs
    quoteCode: varchar("quote_code", { length: 3 })
      .references(() => currencies.code, { onDelete: "restrict" })
      .notNull(),

    // PROVIDER: Enables multi-source rate validation and fallback logic
    provider: varchar("provider", { length: 32 }).notNull(),

    // PRECISION: Same high precision as historical table for consistency
    rate: numeric("rate", { precision: 38, scale: 18 }).notNull(),

    // BUSINESS: When this rate became effective (copied from source)
    effectiveAt: timestamp("effective_at", { withTimezone: true }).notNull(),

    // AUDIT: Cache update timestamp for freshness monitoring
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    // WHY: Primary key enforces exactly one rate per pair/provider combination
    // PERF: Three-column primary key enables efficient UPSERT operations
    primaryKey({
      columns: [table.baseCode, table.quoteCode, table.provider],
    }),

    // PERF: Reverse pair lookups for bidirectional conversions (USD/EUR -> EUR/USD)
    // WHY: Two-column index sufficient since we don't filter by time in this table
    index("idx_fx_latest_quote_base").on(table.quoteCode, table.baseCode),

    // PERF: Provider health monitoring - find all rates from specific provider
    // WHY: Enables quick provider failover and rate staleness detection
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
      if (!val || val.trim() === "") {
        return false;
      }

      // Trim the value for validation
      const trimmed = val.trim();

      // Check length bounds first
      if (trimmed.length > 40) {
        return false;
      }

      // Use a simpler regex pattern to avoid ReDoS
      const parts = trimmed.split(".");
      if (parts.length > 2) {
        return false;
      }

      // Check if all parts are valid digits
      if (!parts.every((part) => part.length > 0 && /^\d+$/.test(part))) {
        return false;
      }

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
      if (!val || val.trim() === "") {
        return false;
      }

      // Trim the value for validation
      const trimmed = val.trim();

      // Check length bounds first
      if (trimmed.length > 40) {
        return false;
      }

      // Use a simpler regex pattern to avoid ReDoS
      const parts = trimmed.split(".");
      if (parts.length > 2) {
        return false;
      }

      // Check if all parts are valid digits
      if (!parts.every((part) => part.length > 0 && /^\d+$/.test(part))) {
        return false;
      }

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
