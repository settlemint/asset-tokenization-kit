/**
 * User Management Contract
 *
 * This contract defines the type-safe interfaces for user-related operations.
 * It provides endpoints for accessing and managing user information, starting
 * with the current authenticated user's profile data.
 *
 * All endpoints in this contract require authentication, ensuring that user
 * data is properly protected and only accessible to authorized users.
 * @see {@link @/orpc/procedures/auth.contract} - Base authenticated contract
 * @see {@link ./user.router} - Implementation router
 */

import {
  UserListOutputSchema,
  UserListSchema,
} from "@/orpc/routes/user/routes/user.list.schema";
import { UserMeSchema } from "@/orpc/routes/user/routes/user.me.schema";
import {
  UserStatsInputSchema,
  UserStatsOutputSchema,
} from "@/orpc/routes/user/routes/user.stats.schema";
import { kycContract } from "@/orpc/routes/user/kyc/kyc.contract";
import { baseContract } from "../../procedures/base.contract";

/**
 * Get current authenticated user information.
 *
 * This endpoint returns comprehensive information about the currently
 * authenticated user, including their profile data, wallet address,
 * and verification settings.
 * @auth Required - User must be authenticated
 * @function GET
 * @endpoint /user/me
 * @returns UserMeSchema - Complete user profile information
 */
const me = baseContract
  .route({
    method: "GET",
    path: "/user/me",
    description: "Get the current user",
    successDescription: "Current user",
    tags: ["user"],
  })
  .output(UserMeSchema);

const list = baseContract
  .route({
    method: "GET",
    path: "/user/list",
    description: "Get the list of users",
    successDescription: "List of users",
    tags: ["user"],
  })
  .input(UserListSchema)
  .output(UserListOutputSchema);

/**
 * Get user statistics and metrics.
 *
 * This endpoint returns comprehensive user statistics including total counts,
 * recent activity, and user growth data over time for dashboard and analytics
 * purposes.
 * @auth Required - User must be authenticated
 * @function GET
 * @endpoint /user/stats
 * @param timeRange - Number of days to look back for recent activity
 * @returns UserStatsOutputSchema - User statistics and metrics
 */
const stats = baseContract
  .route({
    method: "GET",
    path: "/user/stats",
    description: "Get user statistics and metrics",
    successDescription: "User statistics",
    tags: ["user"],
  })
  .input(UserStatsInputSchema)
  .output(UserStatsOutputSchema);

/**
 * User API contract collection.
 */
export const userContract = {
  me,
  list,
  stats,
  kyc: kycContract,
};
