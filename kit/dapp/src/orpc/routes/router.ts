import { baseRouter } from "../procedures/base.router";

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
   * Settings-related API procedures.
   *
   * Lazy-loaded module containing settings management operations.
   * @see {@link ./settings/settings.router} - Settings router implementation
   */
  settings: baseRouter.settings.lazy(
    async () => import("./settings/settings.router")
  ),

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
