/**
 * TypeBox validators for user roles
 *
 * This module provides TypeBox schemas for validating user roles,
 * ensuring they match predefined enumerations.
 */
import type { SchemaOptions } from "@sinclair/typebox";
import { t } from "elysia/type-system";
/**
 * Enum of valid user roles
 */
export const roles = [
  "issuer",
  "investor",
  "regulator",
  "custodian",
  "admin",
] as const;

/**
 * Validates a user role
 *
 * @param options - Additional schema options
 * @returns A TypeBox schema that validates user roles
 */
export const Roles = (options?: SchemaOptions) =>
  t.UnionEnum(roles, {
    ...options,
  });
