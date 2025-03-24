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

/**
 * Validates user roles selection
 *
 * Ensures at least one role is selected from the available options.
 *
 * @param options - Additional schema options
 * @returns A TypeBox schema that validates user role selections
 */
export const RoleMap = (options?: SchemaOptions) =>
  t.Object(
    {
      DEFAULT_ADMIN_ROLE: t.Boolean(),
      SUPPLY_MANAGEMENT_ROLE: t.Boolean(),
      USER_MANAGEMENT_ROLE: t.Boolean(),
    },
    {
      ...options,
      additionalProperties: false,
      message: {
        additionalProperties: "Additional properties are not allowed",
        required: "role-required",
      },
    }
  );
