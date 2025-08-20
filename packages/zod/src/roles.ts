/**
 * System Role Validation Utilities
 *
 * This module provides Zod schemas for validating system roles and role mappings,
 * essential for access control and permission management in the asset tokenization
 * platform. Supports role-based access control (RBAC) patterns.
 * @module RoleValidation
 */
import { z } from "zod";

/**
 * Available system roles with different permission levels.
 * @remarks
 * Role hierarchy and responsibilities:
 * - `admin`: Full system access, user management, configuration
 * - `issuer`: Can create and manage token issuances
 * - `manager`: Can manage existing assets and operations
 * - `compliance`: Handles KYC/AML and regulatory compliance
 * - `auditor`: Read-only access for audit and reporting
 * - `investor`: Standard user role for token holders
 */
export const roleNames = ["admin", "issuer", "manager", "compliance", "auditor", "investor"] as const;

/**
 * Creates a Zod schema that validates system roles.
 * @returns A Zod enum schema for role validation
 * @example
 * ```typescript
 * const schema = roles();
 *
 * // Valid roles
 * schema.parse("admin");      // System administrator
 * schema.parse("issuer");     // Token issuer
 * schema.parse("compliance"); // Compliance officer
 * schema.parse("investor");   // Regular investor
 *
 * // Invalid role
 * schema.parse("superuser"); // Throws ZodError
 * ```
 */
export const roles = () => z.enum(roleNames).describe("System role");

/**
 * Creates a Zod schema for validating role mappings.
 * Maps addresses (or identifiers) to their assigned roles.
 * @returns A Zod record schema mapping strings to roles
 * @example
 * ```typescript
 * const schema = roleMap();
 *
 * // Valid role mapping
 * schema.parse({
 *   "0x123...": "admin",
 *   "0x456...": "issuer",
 *   "0x789...": "investor"
 * });
 *
 * // Invalid - contains invalid role
 * schema.parse({
 *   "0x123...": "superadmin" // Throws - invalid role
 * });
 * ```
 */
export const roleMap = () => z.record(z.string(), roles()).describe("Mapping of addresses to roles");

/**
 * Type representing a validated system role.
 * Ensures type safety.
 */
export type Role = z.infer<ReturnType<typeof roles>>;

/**
 * Type representing a validated role mapping.
 * Maps identifiers to their assigned roles.
 */
export type RoleMap = z.infer<ReturnType<typeof roleMap>>;

/**
 * Type guard to check if a value is a valid role.
 * @param value - The value to check
 * @returns `true` if the value is a valid role, `false` otherwise
 * @example
 * ```typescript
 * const userRole: unknown = "issuer";
 * if (isRole(userRole)) {
 *   // TypeScript knows userRole is Role
 *   console.log(`Valid role: ${userRole}`);
 *
 *   // Apply role-based logic
 *   if (userRole === "admin") {
 *     enableAdminFeatures();
 *   } else if (userRole === "compliance") {
 *     showComplianceTools();
 *   }
 * }
 * ```
 */
export function isRole(value: unknown): value is Role {
  return roles().safeParse(value).success;
}

/**
 * Safely parse and return a role or throw an error.
 * @param value - The value to parse as a role
 * @returns The validated role
 * @throws {Error} If the value is not a valid role
 * @example
 * ```typescript
 * try {
 *   const role = getRole("manager"); // Returns "manager" as Role
 *   const invalid = getRole("guest"); // Throws Error
 * } catch (error) {
 *   console.error("Invalid role provided");
 * }
 *
 * // Use in permission checks
 * const userRole = getRole(session.role);
 * if (userRole === "admin" || userRole === "issuer") {
 *   allowTokenCreation();
 * }
 * ```
 */
export function getRole(value: unknown): Role {
  return roles().parse(value);
}

/**
 * Type guard to check if a value is a valid role map.
 * @param value - The value to check
 * @returns `true` if the value is a valid role map, `false` otherwise
 * @example
 * ```typescript
 * const mapping: unknown = { "user123": "investor" };
 * if (isRoleMap(mapping)) {
 *   // TypeScript knows mapping is RoleMap
 *   Object.entries(mapping).forEach(([id, role]) => {
 *     console.log(`User ${id} has role: ${role}`);
 *   });
 * }
 * ```
 */
export function isRoleMap(value: unknown): value is RoleMap {
  return roleMap().safeParse(value).success;
}

/**
 * Safely parse and return a role map or throw an error.
 * @param value - The value to parse as a role map
 * @returns The validated role mapping
 * @throws {Error} If the value is not a valid role map
 * @example
 * ```typescript
 * try {
 *   const roles = getRoleMap({
 *     "0x123...": "admin",
 *     "0x456...": "investor"
 *   });
 *   // Process role assignments
 * } catch (error) {
 *   console.error("Invalid role mapping");
 * }
 * ```
 */
export function getRoleMap(value: unknown): RoleMap {
  return roleMap().parse(value);
}
