/**
 * TypeBox validators for action types
 *
 * This module provides TypeBox schemas for validating action types,
 * ensuring they match predefined enumerations.
 */
import type { SchemaOptions, Static } from "@sinclair/typebox";
import { t } from "elysia/type-system";

/**
 * Enum of valid action types
 */
export const actionTypes = ["UPDATE_COLLATERAL", "MATURE_BOND"] as const;

/**
 * Validates an action type
 *
 * @param options - Additional schema options
 * @returns A TypeBox schema that validates action types
 */
export const ActionType = (options?: SchemaOptions) =>
  t.UnionEnum(actionTypes, {
    ...options,
  });

export type ActionType = Static<ReturnType<typeof ActionType>>;
