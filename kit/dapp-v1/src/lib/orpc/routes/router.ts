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
});
