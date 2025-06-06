import { z } from "zod/v4";

export const userRoleNames = ["admin", "user", "viewer"] as const;

export const userRoles = () =>
  z.enum(userRoleNames).describe("User role in the system").brand<"UserRole">();

export type UserRole = z.infer<ReturnType<typeof userRoles>>;

/**
 * Type guard to check if a value is a valid user role
 * @param value - The value to check
 * @returns true if the value is a valid user role
 */
export function isUserRole(value: unknown): value is UserRole {
  return userRoles().safeParse(value).success;
}

/**
 * Safely parse and return a user role or throw an error
 * @param value - The value to parse
 * @returns The user role if valid, throws when not
 */
export function getUserRole(value: unknown): UserRole {
  if (!isUserRole(value)) {
    throw new Error(`Invalid user role: ${value}`);
  }
  return value;
}
