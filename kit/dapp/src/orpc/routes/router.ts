import { baseRouter } from "../procedures/base.router";
import settingsRouter from "./settings/settings.router";

/**
 * Main ORPC router configuration.
 *
 * This router serves as the root of the API route tree, organizing all
 * API endpoints into logical namespaces. It uses lazy loading to optimize
 * bundle size and startup performance by only loading route modules when
 * they are actually needed.
 *
 * The router structure follows a hierarchical pattern where each namespace
 * (like 'planet') contains related API procedures, making the API more
 * organized and maintainable.
 */
export const router = baseRouter.router({
  /**
   * Account-related API procedures.
   *
   * Lazy-loaded module containing account management operations.
   * Accounts represent blockchain wallet addresses and their associated
   * identity claims within the ERC-3643 compliance framework. This module
   * provides endpoints for creating wallets and querying account information
   * including verified identity attributes.
   * @see {@link ./account/account.router} - Account router implementation
   */
  account: baseRouter.account.lazy(
    async () => import("./account/account.router")
  ),

  /**
   * Actions-related API procedures.
   *
   * Lazy-loaded module containing actions management operations.
   * Actions represent time-bound, executable tasks that users can perform on assets.
   * This module provides endpoints for listing and reading action details,
   * with automatic filtering to only show actions accessible to the authenticated user.
   *
   * **Architecture Decision**: Actions are implemented as a top-level namespace
   * rather than nested under tokens (e.g., /tokens/{id}/actions) for several reasons:
   * - Actions are domain entities that can target various resources, not just tokens
   * - Provides unified "my actions" view for users across all entities
   * - Enables efficient querying without multiple API calls
   * - Maintains consistent authorization model with centralized user filtering
   * - Future-proof for actions targeting accounts, systems, compliance modules, etc.
   *
   * @see {@link ./actions/actions.router} - Actions router implementation
   */
  actions: baseRouter.actions.lazy(
    async () => import("./actions/actions.router")
  ),

  /**
   * Exchange rates API procedures.
   *
   * Lazy-loaded module containing foreign exchange rate management operations.
   * Provides real-time currency conversion rates with automatic synchronization
   * from external providers, manual rate overrides, and historical data access
   * for analytics and charting.
   * @see {@link ./exchange-rates/exchange-rates.router} - Exchange rates router implementation
   */
  exchangeRates: baseRouter.exchangeRates.lazy(
    async () => import("./exchange-rates/exchange-rates.router")
  ),

  /**
   * Fixed yield schedule API procedures.
   *
   * Lazy-loaded module containing fixed yield schedule management operations.
   * Provides access to yield schedule configuration, tracking metrics, period
   * management, and denomination asset details for tokenized assets with
   * yield-bearing capabilities. This module enables comprehensive yield
   * schedule data retrieval for client applications.
   * @see {@link ./fixed-yield-schedule/fixed-yield-schedule.router} - Fixed yield schedule router implementation
   */
  fixedYieldSchedule: baseRouter.fixedYieldSchedule.lazy(
    async () => import("./fixed-yield-schedule/fixed-yield-schedule.router")
  ),

  /**
   * Settings-related API procedures.
   *
   * The settings router is not lazy-loaded to avoid issues with circular dependencies.
   * The system router calls procedures from the settings router, which sometimes leads to errors (Cannot access 'default' before initialization.)
   * @see {@link ./settings/settings.router} - Settings router implementation
   */
  settings: settingsRouter,

  /**
   * Token-related API procedures.
   *
   * Lazy-loaded module containing token management operations.
   * @see {@link ./token/token.router} - Token router implementation
   */
  token: baseRouter.token.lazy(async () => import("./token/token.router")),

  /**
   * System-related API procedures.
   *
   * Lazy-loaded module containing SMART system management operations.
   * Systems are the foundational contracts that orchestrate the deployment
   * and management of tokenized assets, including compliance rules, identity
   * verification, and access control. This module provides endpoints for
   * querying and managing these system contracts.
   * @see {@link ./system/system.router} - System router implementation
   */
  system: baseRouter.system.lazy(async () => import("./system/system.router")),

  /**
   * User-related API procedures.
   *
   * Lazy-loaded module containing user-related operations such as
   * querying and managing user-related resources.
   */
  user: baseRouter.user.lazy(async () => import("./user/user.router")),
});
