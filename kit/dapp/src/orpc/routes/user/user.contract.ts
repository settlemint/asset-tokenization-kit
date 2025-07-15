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

import { kycContract } from "@/orpc/routes/user/kyc/kyc.contract";
import {
  UserActionsInputSchema,
  UserActionsOutputSchema,
} from "@/orpc/routes/user/routes/user.actions.schema";
import {
  UserListOutputSchema,
  UserListSchema,
} from "@/orpc/routes/user/routes/user.list.schema";
import { UserMeSchema } from "@/orpc/routes/user/routes/user.me.schema";
import {
  UserStatsInputSchema,
  UserStatsOutputSchema,
} from "@/orpc/routes/user/routes/user.stats.schema";
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
 * Get user-specific actions.
 *
 * This endpoint returns actions assigned to the currently authenticated user
 * based on their wallet address. Actions are filtered by user permissions
 * and can be further filtered by status, type, and assignedTo parameters.
 * @auth Required - User must be authenticated
 * @function GET
 * @endpoint /user/actions
 * @param status - Filter by action status (PENDING, UPCOMING, COMPLETED)
 * @param type - Filter by action type (ADMIN, USER)
 * @param assignedTo - Filter by specific assignee wallet address
 * @param limit - Number of actions to return (default: 50, max: 100)
 * @param offset - Number of actions to skip for pagination (default: 0)
 * @returns UserActionsOutputSchema - User actions with pagination info
 */
const actions = baseContract
  .route({
    method: "GET",
    path: "/user/actions",
    description: "Get user-specific actions",
    successDescription: "User actions",
    tags: ["user"],
  })
  .input(UserActionsInputSchema)
  .output(UserActionsOutputSchema);

/**
 * User API contract collection.
 */
export const userContract = {
  me,
  list,
  stats,
  actions,
  kyc: kycContract,
};
