import { br } from "../procedures/base.router";

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
export const router = br.router({
  /**
   * Account-related API procedures.
  /**
   * Account-related API procedures.
   *
   * Lazy-loaded module containing account-related operations such as
   * managing user accounts and their associated resources.
   *
   * @see {@link ./account/account.router} - Account router implementation
   */
  account: br.account.lazy(() => import("./account/account.router")),

  /**
   * Identity-related API procedures.
   *
   * Lazy-loaded module containing identity management operations.
   * Identities are blockchain-based compliance entities that store verified
   * claims about users or organizations. This module provides endpoints for
   * creating new identities and retrieving identity information including
   * their associated claims.
   *
   * @see {@link ./identity/identity.router} - Identity router implementation
   */
  identity: br.identity.lazy(() => import("./identity/identity.router")),

  /**
   * System-related API procedures.
   *
   * Lazy-loaded module containing SMART system management operations.
   * Systems are the foundational contracts that orchestrate the deployment
   * and management of tokenized assets, including compliance rules, identity
   * verification, and access control. This module provides endpoints for
   * querying and managing these system contracts.
   *
   * @see {@link ./system/system.router} - System router implementation
   */
  system: br.system.lazy(() => import("./system/system.router")),

  /**
   * Transaction-related API procedures.
   *
   * Lazy-loaded module containing transaction-related operations such as
   * tracking transactions and managing transaction-related resources.
   *
   * @see {@link ./transaction/transaction.router} - Transaction router implementation
   */
  transaction: br.transaction.lazy(
    () => import("./transaction/transaction.router")
  ),

  /**
   * Settings-related API procedures.
   *
   * Lazy-loaded module containing application settings management operations.
   * Settings are key-value pairs that control various aspects of the application
   * such as the base currency, system addresses, and other configuration values.
   * This module provides full CRUD operations for managing these settings.
   *
   * @see {@link ./settings/settings.router} - Settings router implementation
   */
  settings: br.settings.lazy(() => import("./settings/settings.router")),
});
