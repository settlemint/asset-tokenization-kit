import { addonsList } from "./routes/addons.list";

/**
 * System addons router module.
 *
 * Aggregates all addons-related route handlers into a single exportable object.
 * This module serves as the entry point for the lazy-loaded addons namespace
 * in the main ORPC router.
 *
 * The router handles:
 * - Listing system addons with pagination and filtering
 * - Type-safe input/output validation
 * - Authentication and authorization via middleware
 * - Integration with TheGraph for data retrieval
 *
 * System addons are modular smart contracts that extend token functionality:
 * - Airdrops: Distribute tokens to multiple recipients
 * - Yield: Manage yield distribution schedules
 * - XVP: Handle XVP settlement processes
 *
 * Current routes:
 * - list: GET /addons - Retrieve paginated list of system addons
 *
 * Future endpoints may include:
 * - read: GET /addons/:id - Retrieve detailed information about a specific addon
 * - create: POST /addons - Deploy a new addon instance
 * - update: PUT /addons/:id - Update addon configuration
 * - delete: DELETE /addons/:id - Remove an addon
 *
 * @see {@link ./addons.contract} - Type-safe contract definitions
 * @see {@link ./routes/addons.list} - List endpoint implementation
 */
const routes = {
  list: addonsList,
};

export default routes;
