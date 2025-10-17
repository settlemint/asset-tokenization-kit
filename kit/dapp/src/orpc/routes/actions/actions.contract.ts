/**
 * Actions Management Contract
 *
 * This contract defines the type-safe interfaces for actions-related operations.
 * Actions represent time-bound, executable tasks that users can perform on assets.
 * The system supports various action types including XvP settlement approvals/executions
 * and bond maturity operations.
 *
 * Actions have statuses (PENDING, ACTIVE, EXECUTED, EXPIRED) and can be filtered
 * by action status, target addresses, and required roles. All actions returned
 * are scoped to the authenticated user's permissions.
 *
 * Note: Action execution is handled by resource-specific routes (e.g., tokens.mature,
 * xvp.approve, xvp.execute) rather than a generic actions.execute endpoint.
 *
 * @see {@link @/orpc/procedures/base.contract} - Base contract
 * @see {@link ./actions.router} - Implementation router
 */

import { baseContract } from "../../procedures/base.contract";
import {
  ActionsListInputSchema,
  ActionsListResponseSchema,
} from "./routes/actions.list.schema";

/**
 * List actions for the authenticated user.
 *
 * This endpoint retrieves actions from TheGraph that are available to the
 * authenticated user. Actions are automatically filtered to only include
 * those where the user is listed as an executor. Additional filtering is
 * available by action status, target addresses, and required roles.
 *
 * @auth Required - User must be authenticated
 * @function GET
 * @endpoint /actions/list
 * @input ActionsListSchema - Filtering and pagination parameters
 * @returns ActionsListResponseSchema - Paginated list of user's actions
 * @example
 * ```typescript
 * // List pending actions for current user
 * const actions = await client.actions.list({
 *   status: "PENDING",
 *   first: 20,
 *   skip: 0
 * });
 *
 * actions.data.forEach(action => {
 *   console.log(`Action: ${action.name}, Status: ${action.status}`);
 *   console.log(`Active at: ${new Date(Number(action.activeAt) * 1000)}`);
 * });
 * ```
 */
const list = baseContract
  .route({
    method: "GET",
    path: "/actions/list",
    description: "List actions available to the authenticated user",
    successDescription: "User actions retrieved successfully",
    tags: ["actions"],
  })
  .input(ActionsListInputSchema)
  .output(ActionsListResponseSchema);

/**
 * Actions API contract collection.
 *
 * Exports all actions-related API contracts for use in the main contract registry.
 * Currently includes:
 * - list: Retrieve actions available to the authenticated user
 *
 * Action execution is handled by resource-specific endpoints:
 * - Bond maturity: tokens.mature
 * - XvP approval: xvp.approve
 * - XvP execution: xvp.execute
 */
export const actionsContract = {
  list,
};
