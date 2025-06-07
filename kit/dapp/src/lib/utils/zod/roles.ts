import { z } from "zod";

export const roleNames = [
  "admin",
  "issuer",
  "manager",
  "compliance",
  "auditor",
  "investor",
] as const;

export const roles = () =>
  z.enum(roleNames).describe("System role").brand<"Role">();

export const roleMap = () =>
  z.record(z.string(), roles()).describe("Mapping of addresses to roles");

export type Role = z.infer<ReturnType<typeof roles>>;
export type RoleMap = z.infer<ReturnType<typeof roleMap>>;

/**
 * Type guard to check if a value is a valid role
 * @param value - The value to check
 * @returns true if the value is a valid role
 */
export function isRole(value: unknown): value is Role {
  return roles().safeParse(value).success;
}

/**
 * Safely parse and return a role or throw an error
 * @param value - The value to parse
 * @returns The role if valid, throws when not
 */
export function getRole(value: unknown): Role {
  if (!isRole(value)) {
    throw new Error(`Invalid role: ${value}`);
  }
  return value;
}

/**
 * Type guard to check if a value is a valid role map
 * @param value - The value to check
 * @returns true if the value is a valid role map
 */
export function isRoleMap(value: unknown): value is RoleMap {
  return roleMap().safeParse(value).success;
}

/**
 * Safely parse and return a role map or throw an error
 * @param value - The value to parse
 * @returns The role map if valid, throws when not
 */
export function getRoleMap(value: unknown): RoleMap {
  if (!isRoleMap(value)) {
    throw new Error(`Invalid role map: ${value}`);
  }
  return value;
}
