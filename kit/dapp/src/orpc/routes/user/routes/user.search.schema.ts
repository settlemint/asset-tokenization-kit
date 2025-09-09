/**
 * Schema for user search parameters.
 *
 * This schema defines the input parameters for searching users across
 * multiple fields (firstName, lastName, name, wallet) with a single query string.
 *
 * **Important**: This endpoint returns lightweight user data optimized for UI components.
 * It deliberately excludes blockchain identity data (identity, claims, isRegistered)
 * for better performance and cleaner UI integration.
 *
 * **Use user.list instead when you need:**
 * - Complete user data with identity information
 * - Pagination support for large datasets
 * - Administrative user management features
 */

import { ethereumAddress } from "@atk/zod/ethereum-address";
import { userRoles } from "@atk/zod/user-roles";
import { z } from "zod";

/**
 * Input schema for user search endpoint.
 *
 * Supports searching across firstName, lastName, name, and wallet address
 * with a single query parameter. Results are limited for performance.
 */
export const UserSearchInputSchema = z.object({
  /**
   * Search query string.
   *
   * This query will be matched against:
   * - firstName (case-insensitive partial match)
   * - lastName (case-insensitive partial match)
   * - name (case-insensitive partial match)
   * - wallet address (case-insensitive partial match)
   *
   * Uses OR logic to match any of these fields.
   */
  query: z.string().min(1).describe("Search term to match against user fields"),

  /**
   * Maximum number of results to return.
   *
   * Defaults to 10 results, with a maximum of 50 to ensure
   * optimal performance for autocomplete and search suggestions.
   */
  limit: z.number().int().positive().max(50).default(10),
});

/**
 * Search-specific user schema with minimal fields for UI components.
 *
 * This is a dedicated schema that only includes the essential fields needed
 * for user search results. This approach is safer than using .omit() because:
 * - It won't accidentally expose new fields added to UserSchema
 * - It's explicit about what data is returned
 * - It's optimized for performance with minimal data transfer
 *
 * **Included Fields:**
 * - `name`: User's display name (from KYC if available, otherwise from auth)
 * - `wallet`: User's Ethereum wallet address for identification
 * - `role`: User's role for display and filtering
 */
export const UserSearchResultSchema = z.object({
  name: z.string().describe("User's display name"),
  wallet: ethereumAddress.nullable().describe("User's Ethereum wallet address"),
  role: userRoles().describe("User's role for access control"),
});

/**
 * Output schema for user search results.
 *
 * Returns an array of lightweight user objects optimized for:
 * - Dropdown/select components
 * - Autocomplete interfaces
 * - User picker forms
 * - Quick lookup scenarios
 *
 * **Missing Identity Data**: Use `user.list` or `user.read` when you need
 * complete user information including blockchain identity details.
 */
export const UserSearchOutputSchema = UserSearchResultSchema.array();

export type UserSearchInput = z.infer<typeof UserSearchInputSchema>;
export type UserSearchResult = z.infer<typeof UserSearchResultSchema>;
export type UserSearchOutput = z.infer<typeof UserSearchOutputSchema>;
