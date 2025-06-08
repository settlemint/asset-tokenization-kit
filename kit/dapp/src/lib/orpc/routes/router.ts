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
 * (like 'planet' or 'bootstrap') contains related API procedures, making the API more
 * organized and maintainable.
 */
export const router = br.router({
  /**
   * Bootstrap-related API procedures.
   *
   * Lazy-loaded module containing all bootstrap-specific operations such as
   * creating bootstrap configurations, retrieving bootstrap data, updating
   * bootstrap settings, and managing bootstrap-related resources. The lazy loading
   * ensures this module is only bundled and loaded when bootstrap procedures are actually called.
   *
   * @see {@link ./bootstrap/bootstrap.router} - Bootstrap router implementation
   */
  bootstrap: br.bootstrap.lazy(() => import("./bootstrap/bootstrap.router")),

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
});
