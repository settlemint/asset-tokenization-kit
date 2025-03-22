/**
 * TypeBox validators for equity classes
 *
 * This module provides TypeBox schemas for validating equity classes,
 * ensuring they match predefined enumerations.
 */
import type { SchemaOptions } from "@sinclair/typebox";
import { t } from "elysia";

/**
 * Enum of valid equity classes
 */
export const equityClasses = [
  "COMMON_EQUITY",
  "PREFERRED_EQUITY",
  "MARKET_CAPITALIZATION_EQUITY",
  "GEOGRAPHIC_EQUITY",
  "SECTOR_INDUSTRY_EQUITY",
  "INVESTMENT_STYLE_EQUITY",
  "INVESTMENT_STAGE_PRIVATE_EQUITY",
  "SPECIAL_CLASSES_EQUITY",
] as const;

/**
 * Validates an equity class
 *
 * @param options - Additional schema options
 * @returns A TypeBox schema that validates equity classes
 */
export const EquityClass = (options?: SchemaOptions) =>
  t.UnionEnum(equityClasses, {
    ...options,
  });
