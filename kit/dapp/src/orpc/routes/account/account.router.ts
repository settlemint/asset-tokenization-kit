import { search } from "@/orpc/routes/account/routes/account.search";

/**
 * Account router module.
 *
 * Aggregates all account-related route handlers into a single exportable object.
 * This module serves as the entry point for the lazy-loaded account namespace
 * in the main ORPC router.
 *
 * Current routes:
 * - search: GET /account/search - Search accounts by various criteria
 *
 * Note: Identity-related functionality has been moved to the system.identity namespace.
 * @see {@link ./account.contract} - Type-safe contract definitions
 * @see {@link ./account.search} - Account search implementation
 */
const routes = {
  search,
};

export default routes;
