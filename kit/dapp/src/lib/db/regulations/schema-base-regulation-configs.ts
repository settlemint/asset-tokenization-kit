/**
 * Base Regulation Configurations Schema
 *
 * This schema defines the common configuration fields shared across all regulation types.
 * We use a design with:
 *
 * 1. A base table (regulation_configs) - Contains common fields for all regulation types
 * 2. Type-specific tables (e.g., mica_regulation_configs) - Contains fields specific to that regulation
 *
 * This approach allows:
 * - Adding new regulation types without modifying the base schema
 * - Querying across all regulations regardless of type
 * - Type-specific validation and business logic
 * - One-to-one relationships between base and specific config
 */

import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

// Regulation types enum
export const RegulationType = {
  MICA: "mica",
  // Add more regulation types here as needed
} as const;

export type RegulationType =
  (typeof RegulationType)[keyof typeof RegulationType];

// Regulation compliance status enum
export const RegulationStatus = {
  COMPLIANT: "compliant",
  NOT_COMPLIANT: "not_compliant",
} as const;

export type RegulationStatus =
  (typeof RegulationStatus)[keyof typeof RegulationStatus];

// Base regulation configs table with common fields
export const regulationConfigs = pgTable("regulation_configs", {
  id: text("id").primaryKey(),
  assetId: text("asset_id").notNull(),
  regulationType: text("regulation_type").notNull(),
  status: text("status").notNull().$type<RegulationStatus>(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Export types
export type RegulationConfig = typeof regulationConfigs.$inferSelect;
export type NewRegulationConfig = typeof regulationConfigs.$inferInsert;
