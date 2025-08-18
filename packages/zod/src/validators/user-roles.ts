/**
 * User Role Validation Utilities
 *
 * This module provides Zod schemas for validating user roles in the application,
 * implementing a simple role-based access control (RBAC) system for managing
 * user permissions and access levels.
 * @module UserRoleValidation
 */
import { z } from "zod";

/**
 * Available user roles with different permission levels.
 * @remarks
 * Simple role hierarchy for application access:
 * - `admin`: Full administrative access, can manage users and settings
 * - `investor`: Standard investor access, can perform regular operations
 * - `issuer`: Trusted issuer access, can see all users data and issue claims
 *
 * Note: This is separate from system roles (roles.ts) which handle
 * blockchain/smart contract permissions.
 */
export const userRoleNames = ["admin", "investor", "issuer"] as const;

/**
 * Creates a Zod schema that validates user roles.
 * @returns A Zod enum schema for user role validation
 * @example
 * ```typescript
 * const schema = userRoles();
 *
 * // Valid roles
 * schema.parse("admin");    // Administrative access
 * schema.parse("investor"); // Standard investor access
 * schema.parse("issuer");   // Trusted issuer access
 *
 * // Invalid role
 * schema.parse("moderator"); // Throws ZodError
 * ```
 */
export const userRoles = () => z.enum(userRoleNames).describe("User role in the system").default("investor");

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
 *   } else if (role === "issuer") {
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
 *   const role = getUserRole("investor"); // Returns "investor" as UserRole
 *   const invalid = getUserRole("superuser"); // Throws Error
 * } catch (error) {
 *   console.error("Invalid user role provided");
 *   // Default to investor for safety
 *   assignRole("investor");
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
 * const canEdit = role === "admin" || role === "investor";
 * const canCreateAssets = role === "admin" || role === "issuer";
 * ```
 */
export function getUserRole(value: unknown): UserRole {
  return userRoles().parse(value);
}
