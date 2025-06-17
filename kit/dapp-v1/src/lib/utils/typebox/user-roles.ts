import type { SchemaOptions } from "@sinclair/typebox";
import { t } from "elysia/type-system";

export type UserRole = "user" | "issuer" | "admin";

/**
 * Enum of valid user roles
 */
export const userRoles: [UserRole, UserRole, UserRole] = [
  "user",
  "issuer",
  "admin",
];

/**
 * Validates a user role
 *
 * @param options - Additional schema options
 * @returns A TypeBox schema that validates user roles
 */
export const UserRoles = (options?: SchemaOptions) =>
  t.UnionEnum(userRoles, {
    ...options,
  });
