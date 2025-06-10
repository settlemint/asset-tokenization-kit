import { br } from "./procedures/base.router";

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
   * Planet-related API procedures.
   *
   * Lazy-loaded module containing all planet-specific operations such as
   * retrieving planet information, updating planet data, and managing
   * planet-related resources. The lazy loading ensures this module is
   * only bundled and loaded when planet procedures are actually called.
   *
   * @see {@link ./planet/planet.router} - Planet router implementation
   */
  planet: br.planet.lazy(() => import("./planet/planet.router")),

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
});
