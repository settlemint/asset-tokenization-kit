/**
 * Actions Router Implementation
 *
 * This router implements the actions API contract, providing handlers for
 * actions-related operations. Actions represent time-bound, executable tasks
 * that users can perform on assets within the platform.
 *
 * All routes in this router require authentication and automatically filter
 * results to only include actions accessible to the authenticated user.
 *
 * Routes:
 * - list: Retrieve paginated list of user's actions with filtering
 *
 * Note: Action execution is handled by resource-specific routes rather than
 * a generic actions.execute endpoint. For example:
 * - Bond maturity → tokens.mature
 * - XvP settlement approval → xvp.approve
 * - XvP settlement execution → xvp.execute
 *
 * @see {@link ./actions.contract} - Type-safe contract definitions
 * @see {@link ./routes/actions.list} - List implementation
 */

import { list } from "./routes/actions.list";

/**
 * Actions router collection.
 *
 * Exports all actions-related route handlers for use in the main router.
 * These handlers implement the type-safe contracts defined in actions.contract.ts
 * and provide the actual business logic for actions management.
 *
 * All routes require authentication and implement proper authorization checks
 * to ensure users can only access actions they are authorized to view.
 */
const actionsRouter = {
  list,
};

export default actionsRouter;
