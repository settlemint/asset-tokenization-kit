/**
 * TypeBox validator for positive amounts
 *
 * This module provides a TypeBox schema for validating positive amounts,
 * ensuring they are numbers above a minimum threshold.
 */
import type { SchemaOptions } from "@sinclair/typebox";
import { t } from "elysia/type-system";

/**
 * Validates a positive amount with specific boundaries
 *
 * @param max - Maximum allowed value
 * @param min - Minimum allowed value
 * @param options - Additional schema options
 * @returns A TypeBox schema that validates positive amounts with specific boundaries
 */
export const Amount = (
  max = Number.MAX_SAFE_INTEGER,
  min = 0,
  options?: SchemaOptions
) =>
  t.Number({
    minimum: min,
    maximum: max,
    title: "Amount",
    description: `A positive numerical amount between ${min} and ${max}`,
    examples: [1.5, Math.min(10, max), Math.min(100.25, max)],
    ...options,
  });
