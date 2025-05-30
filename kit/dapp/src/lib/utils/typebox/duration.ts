/**
 * TypeBox validators for duration
 *
 * This module provides TypeBox schemas for validating durations,
 * which consist of a value and a time unit.
 */
import type { SchemaOptions, Static } from "@sinclair/typebox";
import { t } from "elysia/type-system";
import { TimeUnit } from "./time-units";

/**
 * Validates a duration with value and unit
 *
 * @param options - Additional schema options
 * @returns A TypeBox schema that validates durations
 */
export const Duration = (options?: SchemaOptions) =>
  t.Object(
    {
      value: t.Number({
        minimum: 0, // Durations are non-negative
        description: "The numeric value of the duration",
      }),
      unit: TimeUnit({
        description: "The unit of the duration (e.g., days, months)",
      }),
    },
    {
      ...options,
      description: "A duration consisting of a value and a time unit",
    }
  );

export type Duration = Static<ReturnType<typeof Duration>>;
