/**
 * TypeBox validator for positive amounts
 *
 * This module provides a TypeBox schema for validating positive amounts,
 * ensuring they are numbers above a minimum threshold.
 */
import type { SchemaOptions } from "@sinclair/typebox";
import { t } from "elysia/type-system";

/**
 * Options for the Amount schema
 */
interface AmountOptions extends SchemaOptions {
  min?: number;
  max?: number;
  decimals?: number;
}

/**
 * Validates a positive amount with specific boundaries

 * @param options - Schema options
 * @returns A TypeBox schema that validates positive amounts with specific boundaries
 */
export const Amount = ({
  max = Number.MAX_SAFE_INTEGER,
  min,
  decimals,
  ...options
}: AmountOptions = {}) => {
  const minimum =
    typeof min === "number"
      ? min
      : typeof decimals === "number"
        ? 10 ** -decimals
        : 0;
  return t.Number({
    minimum,
    maximum: max,
    title: "Amount",
    description: `A positive numerical amount between ${minimum} and ${max}`,
    examples: [1.5, Math.min(10, max), Math.min(100.25, max)],
    errorMessage: `Must be at least ${minimum}`,
    ...options,
  });
};
