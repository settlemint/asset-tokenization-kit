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
  ActionsListResponseSchema,
  ActionsListSchema,
} from "./routes/actions.list.schema";
import {
  ActionsReadResponseSchema,
  ActionsReadSchema,
} from "./routes/actions.read.schema";

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
  .input(ActionsListSchema)
  .output(ActionsListResponseSchema);

/**
 * Read a single action by ID.
 *
 * This endpoint retrieves detailed information about a specific action,
 * including its executor information, target details, and execution status.
 * The action must be accessible to the authenticated user (user must be
 * listed as an executor).
 *
 * @auth Required - User must be authenticated
 * @function GET
 * @endpoint /actions/read
 * @input ActionsReadSchema - Action ID to query
 * @returns ActionsReadResponseSchema - Detailed action information
 * @throws NOT_FOUND - If action with given ID is not found or not accessible to user
 * @example
 * ```typescript
 * // Read specific action details
 * const action = await client.actions.read({
 *   id: "0x1234567890123456789012345678901234567890123456789012345678901234"
 * });
 *
 * // Check if action is currently executable
 * const canExecute = action.status === "ACTIVE" &&
 *                    (!action.requiredRole || userHasRole(action.requiredRole));
 *
 * // Execute via resource-specific endpoint
 * if (canExecute && action.identifier === "mature-bond") {
 *   await client.tokens.mature({ tokenId: action.target, verification: {...} });
 * }
 * ```
 */
const read = baseContract
  .route({
    method: "GET",
    path: "/actions/read",
    description:
      "Read detailed information about a specific action accessible to the user",
    successDescription: "Action information retrieved successfully",
    tags: ["actions"],
  })
  .input(ActionsReadSchema)
  .output(ActionsReadResponseSchema);

/**
 * Actions API contract collection.
 *
 * Exports all actions-related API contracts for use in the main contract registry.
 * Currently includes:
 * - list: Retrieve actions available to the authenticated user
 * - read: Get detailed information about a specific action
 *
 * Action execution is handled by resource-specific endpoints:
 * - Bond maturity: tokens.mature
 * - XvP approval: xvp.approve
 * - XvP execution: xvp.execute
 */
export const actionsContract = {
  list,
  read,
};
