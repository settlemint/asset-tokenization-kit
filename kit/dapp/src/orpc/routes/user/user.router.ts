import { list as actionsList } from "@/orpc/routes/actions/routes/actions.list";
import kyc from "@/orpc/routes/user/kyc/kyc.router";
import { createWallet } from "@/orpc/routes/user/routes/mutations/create-wallet";
import { list } from "@/orpc/routes/user/routes/user.list";
import { me } from "@/orpc/routes/user/routes/user.me";
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
 * - list: GET /user/list - List users with filtering and pagination
 * - stats: GET /user/stats - User statistics and metrics
 * - kyc: KYC profile management routes (nested namespace)
 * - actions: GET /user/actions - User's accessible actions (alias for /actions/list)
 *
 * The router is designed to be extended with additional user management
 * endpoints such as profile updates, preference management, and session control.
 * @see {@link ./user.contract} - Type-safe contract definitions
 * @see {@link ./routes/user.me} - Current user endpoint implementation
 * @see {@link ./routes/user.stats} - User statistics endpoint implementation
 * @see {@link ./kyc/kyc.router} - KYC profile management routes
 */
const routes = {
  me,
  actions: actionsList,
  list,
  stats,
  statsGrowthOverTime,
  statsUserCount,
  kyc,
  createWallet,
};

export default routes;
