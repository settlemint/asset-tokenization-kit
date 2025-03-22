/**
 * TypeBox validator for token decimals
 *
 * This module provides a TypeBox schema for validating token decimals,
 * ensuring they are integers within an appropriate range.
 */
import type { SchemaOptions } from "@sinclair/typebox";
import { t } from "elysia";

/**
 * Validates a token's decimals value
 *
 * @param options - Additional schema options
 * @returns A TypeBox schema that validates token decimals
 */
export const Decimals = (options?: SchemaOptions) =>
  t.Integer({
    minimum: 0,
    maximum: 18,
    title: "Decimals",
    description: "The number of decimal places for the token (0-18)",
    examples: [0, 6, 18],
    ...options,
  });
