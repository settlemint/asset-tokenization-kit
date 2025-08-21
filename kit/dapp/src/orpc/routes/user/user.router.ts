import { list as actionsList } from "@/orpc/routes/actions/routes/actions.list";
import kyc from "@/orpc/routes/user/kyc/kyc.router";
import pincode from "@/orpc/routes/user/pincode/pincode.router";
import secretCodes from "@/orpc/routes/user/secret-codes/secret-codes.router";
import twoFactor from "@/orpc/routes/user/two-factor/two-factor.router";
import { createWallet } from "@/orpc/routes/user/routes/mutations/create-wallet";
import { list } from "@/orpc/routes/user/routes/user.list";
import { me } from "@/orpc/routes/user/routes/user.me";
import { read } from "@/orpc/routes/user/routes/user.read";
import { search } from "@/orpc/routes/user/routes/user.search";
import { stats } from "@/orpc/routes/user/routes/user.stats";
import { statsGrowthOverTime } from "@/orpc/routes/user/routes/user.stats.growth-over-time";
import { statsUserCount } from "@/orpc/routes/user/routes/user.stats.user-count";

/**
 * User router module.
 *
 * Aggregates all user-related route handlers into a single exportable object.
 * This module serves as the entry point for the lazy-loaded user namespace
 * in the main ORPC router.
 *
 * Current routes:
 * - me: GET /user/me - Retrieve current authenticated user information
 * - search: GET /user/search - Search users by name or wallet address
 * - list: GET /user/list - List users with pagination
 * - read: GET /user/read - Get specific user by ID or wallet address
 * - stats: GET /user/stats - User statistics and metrics
 * - kyc: KYC profile management routes (nested namespace)
 * - pincode: PIN code management routes (nested namespace)
 * - secretCodes: Secret codes recovery management routes (nested namespace)
 * - twoFactor: Two-factor authentication management routes (nested namespace)
 * - actions: GET /user/actions - User's accessible actions (alias for /actions/list)
 *
 * The router is designed to be extended with additional user management
 * endpoints such as profile updates, preference management, and session control.
 * @see {@link ./user.contract} - Type-safe contract definitions
 * @see {@link ./routes/user.me} - Current user endpoint implementation
 * @see {@link ./routes/user.stats} - User statistics endpoint implementation
 * @see {@link ./kyc/kyc.router} - KYC profile management routes
 * @see {@link ./pincode/pincode.router} - PIN code management routes
 * @see {@link ./secret-codes/secret-codes.router} - Secret codes management routes
 * @see {@link ./two-factor/two-factor.router} - Two-factor authentication routes
 */
const routes = {
  me,
  actions: actionsList,
  search,
  list,
  read,
  stats,
  statsGrowthOverTime,
  statsUserCount,
  kyc,
  pincode,
  secretCodes,
  twoFactor,
  createWallet,
};

export default routes;
