/**
 * User Management Contract
 *
 * This contract defines the type-safe interfaces for user-related operations.
 * It provides endpoints for accessing and managing user information, starting
 * with the current authenticated user's profile data.
 *
 * All endpoints in this contract require authentication, ensuring that user
 * data is properly protected and only accessible to authorized users.
 *
 * @see {@link @/orpc/procedures/auth.contract} - Base authenticated contract
 * @see {@link ./user.router} - Implementation router
 */

import { UserMeSchema } from "@/orpc/routes/user/routes/user.me.schema";
import { ac } from "../../procedures/auth.contract";

/**
 * Get current authenticated user information.
 *
 * This endpoint returns comprehensive information about the currently
 * authenticated user, including their profile data, wallet address,
 * and verification settings.
 *
 * @auth Required - User must be authenticated
 * @method GET
 * @endpoint /user/me
 *
 * @returns UserMeSchema - Complete user profile information
 *
 * @example
 * ```typescript
 * // Fetch current user
 * const user = await client.user.me();
 * console.log(`Logged in as: ${user.email}`);
 * console.log(`Wallet: ${user.wallet}`);
 * ```
 */
const me = ac
  .route({
    method: "GET",
    path: "/user/me",
    description: "Get the current user",
    successDescription: "Current user",
    tags: ["user"],
  })
  .output(UserMeSchema);

/**
 * User API contract collection.
 *
 * Exports all user-related API contracts for use in the main contract registry.
 * Currently includes:
 * - me: Retrieve current authenticated user information
 *
 * Future endpoints may include:
 * - update: Update user profile information
 * - preferences: Manage user preferences
 * - sessions: View and manage active sessions
 * - notifications: Configure notification settings
 */
export const userContract = {
  me,
};
