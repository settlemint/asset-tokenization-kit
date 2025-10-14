/**
 * User Role Validation Utilities
 *
 * This module provides Zod schemas for validating user roles in the application,
 * implementing a simple role-based access control (RBAC) system for managing
 * user permissions and access levels.
 * @module UserRoleValidation
 */
import * as z from "zod";

/**
 * Available user roles with different permission levels.
 * @remarks
 * Simple role hierarchy for application access:
 * - `admin`: Full administrative access, can create a system and manage settings
 * - `user`: Standard user access, can perform regular operations
 *
 * Note: This is separate from system roles (roles.ts) which handle
 * blockchain/smart contract permissions.
 */
export const userRoleNames = ["admin", "user"] as const;

/**
 * Creates a Zod schema that validates user roles.
 * @returns A Zod enum schema for user role validation
 * @example
 * ```typescript
 * const schema = userRoles();
 *
 * // Valid roles
 * schema.parse("admin");   // Admin, can bootstrap a system
 * schema.parse("user");    // Standard user access
 *
 * // Invalid role
 * schema.parse("moderator"); // Throws ZodError
 * ```
 */
export const userRoles = () =>
  z.enum(userRoleNames).describe("User role in the system").default("user");

/**
 * Type representing a validated user role.
 * Ensures type safety in access control.
 */
export type UserRole = z.infer<ReturnType<typeof userRoles>>;

/**
 * Type guard to check if a value is a valid user role.
 * @param value - The value to check
 * @returns `true` if the value is a valid user role, `false` otherwise
 * @example
 * ```typescript
 * const role: unknown = "admin";
 * if (isUserRole(role)) {
 *   // TypeScript knows role is UserRole
 *   console.log(`User has ${role} privileges`);
 *
 *   // Apply role-based logic
 *   if (role === "admin") {
 *     showAdminDashboard();
 *   } else if (role === "user") {
 *     showAssetCreationTools();
 *   }
 * }
 * ```
 */
export function isUserRole(value: unknown): value is UserRole {
  return userRoles().safeParse(value).success;
}

/**
 * Safely parse and return a user role or throw an error.
 * @param value - The value to parse as a user role
 * @returns The validated user role
 * @throws {Error} If the value is not a valid user role
 * @example
 * ```typescript
 * try {
 *   const role = getUserRole("user"); // Returns "user" as UserRole
 *   const invalid = getUserRole("superuser"); // Throws Error
 * } catch (error) {
 *   console.error("Invalid user role provided");
 *   // Default to user for safety
 *   assignRole("user");
 * }
 *
 * // Use in middleware
 * const userRole = getUserRole(session.user.role);
 * if (userRole !== "admin") {
 *   throw new UnauthorizedError("Admin access required");
 * }
 *
 * // Permission checks
 * const role = getUserRole(currentUser.role);
 * const canEdit = role === "admin";
 * ```
 */
export function getUserRole(value: unknown): UserRole {
  return userRoles().parse(value);
}
