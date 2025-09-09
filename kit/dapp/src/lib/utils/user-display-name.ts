import type { User } from "@/orpc/routes/user/routes/user.me.schema";

/**
 * Utility function to generate a display name for a user.
 *
 * Prioritizes the combination of firstName and lastName from KYC data,
 * falling back to the user's name field if KYC data is not available.
 *
 * @param user - User object with firstName, lastName, and name fields
 * @returns Display name string for the user
 *
 * @example
 * ```typescript
 * // User with KYC data
 * const user = { firstName: "John", lastName: "Doe", name: "john.doe@example.com" };
 * getUserDisplayName(user); // "John Doe"
 *
 * // User without KYC data
 * const user = { firstName: null, lastName: null, name: "john.doe@example.com" };
 * getUserDisplayName(user); // "john.doe@example.com"
 * ```
 */
export function getUserDisplayName(
  user: Pick<User, "firstName" | "lastName" | "name">
): string {
  return user.firstName && user.lastName
    ? `${user.firstName} ${user.lastName}`
    : user.name;
}
