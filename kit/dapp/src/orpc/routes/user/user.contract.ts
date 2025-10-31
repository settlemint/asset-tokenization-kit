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
  ActionsListInputSchema,
  ActionsListResponseSchema,
} from "@/orpc/routes/actions/routes/actions.list.schema";
import { kycContract } from "@/orpc/routes/user/kyc/kyc.contract";
import { AdminListOutputSchema } from "@/orpc/routes/user/routes/admins.list.schema";
import { createWalletContract } from "@/orpc/routes/user/routes/mutations/create-wallet.contract";
import {
  UserAssetsInputSchema,
  UserAssetsResponseSchema,
} from "@/orpc/routes/user/routes/user.assets.schema";
import {
  UserEventsInputSchema,
  UserEventsResponseSchema,
} from "@/orpc/routes/user/routes/user.events.schema";
import {
  UserListInputSchema,
  UserListOutputSchema,
} from "@/orpc/routes/user/routes/user.list.schema";
import { UserMeSchema } from "@/orpc/routes/user/routes/user.me.schema";
import { UserReadOutputSchema } from "@/orpc/routes/user/routes/user.read.schema";
import {
  UserSearchInputSchema,
  UserSearchOutputSchema,
} from "@/orpc/routes/user/routes/user.search.schema";
import {
  UserStatsGrowthOverTimeInputSchema,
  UserStatsGrowthOverTimeOutputSchema,
} from "@/orpc/routes/user/routes/user.stats.growth-over-time.schema";
import {
  UserStatsInputSchema,
  UserStatsOutputSchema,
} from "@/orpc/routes/user/routes/user.stats.schema";
import {
  UserStatsUserCountInputSchema,
  UserStatsUserCountOutputSchema,
} from "@/orpc/routes/user/routes/user.stats.user-count.schema";
import { baseContract } from "../../procedures/base.contract";
import { ethereumAddress } from "@atk/zod/ethereum-address";
import { z } from "zod";

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

/**
 * Get actions available to the current authenticated user.
 *
 * This endpoint retrieves actions from TheGraph that are available to the
 * authenticated user. It's an alias for /actions/list but scoped to the
 * current user's context for convenience.
 * @auth Required - User must be authenticated
 * @function GET
 * @endpoint /user/me/actions
 * @input ActionsListSchema - Filtering and pagination parameters
 * @returns ActionsListResponseSchema - Paginated list of user's actions
 */
const actions = baseContract
  .route({
    method: "GET",
    path: "/user/me/actions",
    description: "List actions available to the current user",
    successDescription: "User actions retrieved successfully",
    tags: ["user"],
  })
  .input(ActionsListInputSchema)
  .output(ActionsListResponseSchema);

/**
 * Search for users by name or wallet address.
 *
 * This endpoint provides flexible search functionality across user fields
 * including firstName, lastName, name, and wallet address. It's optimized for
 * autocomplete and quick user lookups.
 * @auth Required - User must be authenticated
 * @function GET
 * @endpoint /user/search
 * @input UserSearchInputSchema - Search query and limit parameters
 * @returns UserSearchOutputSchema - Array of matching users
 */
const search = baseContract
  .route({
    method: "GET",
    path: "/user/search",
    description: "Search users by name or wallet address",
    successDescription: "Matching users found",
    tags: ["user"],
  })
  .input(UserSearchInputSchema)
  .output(UserSearchOutputSchema);

const list = baseContract
  .route({
    method: "GET",
    path: "/user/list",
    description: "Get the list of users",
    successDescription: "List of users",
    tags: ["user"],
  })
  .input(UserListInputSchema)
  .output(UserListOutputSchema);

const adminList = baseContract
  .route({
    method: "GET",
    path: "/user/list/admins",
    description: "Get the list of admins",
    successDescription: "List of admins",
    tags: ["user"],
  })
  .output(AdminListOutputSchema);

/**
 * Get specific user by ID or wallet address.
 *
 * This endpoint retrieves detailed information about a specific user
 * identified by either their internal ID or wallet address. Used for
 * user profile views and admin user management.
 * @auth Required - User must be authenticated
 * @function GET
 * @endpoint /user/read
 * @input UserReadInputSchema - User ID or wallet address
 * @returns UserReadOutputSchema - Complete user information
 */
const readByUserId = baseContract
  .route({
    method: "GET",
    path: "/user/by-id/{userId}",
    description: "Get specific user by internal user ID",
    successDescription: "User found",
    tags: ["user"],
  })
  .input(
    z.object({
      userId: z.string().describe("The internal database ID of the user"),
    })
  )
  .output(UserReadOutputSchema);

const readByWallet = baseContract
  .route({
    method: "GET",
    path: "/user/by-wallet/{wallet}",
    description: "Get specific user by wallet address",
    successDescription: "User found",
    tags: ["user"],
  })
  .input(
    z.object({
      wallet: ethereumAddress.describe(
        "The Ethereum wallet address of the user"
      ),
    })
  )
  .output(UserReadOutputSchema);

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

const statsUserCount = baseContract
  .route({
    method: "GET",
    path: "/user/stats/user-count",
    description: "Get user count statistics",
    successDescription: "User count statistics",
    tags: ["user"],
  })
  .input(UserStatsUserCountInputSchema)
  .output(UserStatsUserCountOutputSchema);

const statsGrowthOverTime = baseContract
  .route({
    method: "GET",
    path: "/user/stats/growth-over-time",
    description: "Get user growth over time",
    successDescription: "User growth data",
    tags: ["user"],
  })
  .input(UserStatsGrowthOverTimeInputSchema)
  .output(UserStatsGrowthOverTimeOutputSchema);

export const assets = baseContract
  .route({
    method: "GET",
    path: "/user/assets",
    description: "Get all token assets held by a user",
    successDescription: "List of token balances for the user",
    tags: ["user"],
  })
  .input(UserAssetsInputSchema)
  .output(UserAssetsResponseSchema);

export const events = baseContract
  .route({
    method: "GET",
    path: "/user/events",
    description: "Get recent blockchain events for the authenticated user",
    successDescription: "List of recent events",
    tags: ["user"],
  })
  .input(UserEventsInputSchema)
  .output(UserEventsResponseSchema);

/**
 * User API contract collection.
 */
export const userContract = {
  me,
  actions,
  assets,
  events,
  search,
  list,
  adminList,
  readByUserId,
  readByWallet,
  stats,
  statsGrowthOverTime,
  statsUserCount,
  kyc: kycContract,
  createWallet: createWalletContract,
};
