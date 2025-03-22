/**
 * TypeBox validators for time units
 *
 * This module provides TypeBox schemas for validating time units,
 * ensuring they match predefined enumerations.
 */
import type { SchemaOptions } from "@sinclair/typebox";
import { t } from "elysia";

/**
 * Enum of valid time units
 */
export const timeUnits = [
  "seconds",
  "hours",
  "days",
  "weeks",
  "months",
] as const;

/**
 * Validates a time unit
 *
 * @param options - Additional schema options
 * @returns A TypeBox schema that validates time units
 */
export const TimeUnit = (options?: SchemaOptions) =>
  t.UnionEnum(timeUnits, {
    ...options,
  });
