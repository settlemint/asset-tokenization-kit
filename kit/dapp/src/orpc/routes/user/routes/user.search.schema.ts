/**
 * Schema for user search parameters.
 *
 * This schema defines the input parameters for searching users across
 * multiple fields (firstName, lastName, name, wallet) with a single query string.
 * Similar to token search functionality, it provides flexible search
 * capabilities for user management interfaces.
 */

import { UserSchema } from "@/orpc/routes/user/routes/user.me.schema";
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
 * Output schema for user search results.
 *
 * Returns an array of user objects matching the search criteria.
 * Uses the same User schema as the list endpoint for consistency.
 */
export const UserSearchOutputSchema = UserSchema.array();

export type UserSearchInput = z.infer<typeof UserSearchInputSchema>;
export type UserSearchOutput = z.infer<typeof UserSearchOutputSchema>;
