import { ethereumAddress } from "@atk/zod/ethereum-address";
import { timestamp } from "@atk/zod/timestamp";
import * as z from "zod";

/**
 * Action status enumeration matching the subgraph schema.
 *
 * These statuses represent the current state of an action:
 * - PENDING: Action is ready to be executed (activeAt has passed, expiresAt hasn't)
 * - UPCOMING: Action is not yet active (activeAt is in the future)
 * - EXECUTED: Action has been successfully executed
 * - EXPIRED: Action has expired without being executed
 */
export const ActionStatusSchema = z.enum([
  "PENDING",
  "UPCOMING",
  "EXECUTED",
  "EXPIRED",
]);
export type ActionStatus = z.infer<typeof ActionStatusSchema>;

/**
 * Action executor schema representing who can execute the action.
 *
 * Contains the list of addresses that are authorized to execute
 * actions associated with this executor.
 */
export const ActionExecutorSchema = z.object({
  id: z.string().describe("Unique identifier for the action executor"),
  executors: z
    .array(ethereumAddress)
    .describe("List of addresses authorized to execute actions"),
});

/**
 * Schema for a single action entity.
 *
 * Represents an action that can be executed by authorized users.
 * Actions are time-bound tasks with specific targets and requirements.
 */
export const ActionSchema = z.object({
  id: z.string().describe("Unique identifier for the action"),
  name: z.string().describe("Human-readable name of the action"),
  target: ethereumAddress.describe("Target address for the action"),
  activeAt: timestamp().describe("Timestamp when the action becomes active"),
  status: ActionStatusSchema.describe("Current status of the action"),
  executedAt: timestamp()
    .nullable()
    .describe("Timestamp when the action was executed"),
  executedBy: ethereumAddress
    .nullable()
    .describe("Address that executed the action"),
  executor: ActionExecutorSchema.describe(
    "Executor information for the action"
  ),
  expiresAt: timestamp()
    .nullable()
    .describe("Timestamp when the action expires"),
});

/**
 * Schema for validating a list of actions from GraphQL responses.
 *
 * This schema ensures that each action in the list conforms to the
 * ActionSchema structure, providing runtime validation and type safety.
 * Used for list views and pagination results.
 */
export const ActionsListDataSchema = z.array(ActionSchema);

/**
 * Input schema for actions listing queries.
 *
 * Contains actions-specific filtering parameters.
 * Note that user filtering is handled automatically server-side - only actions
 * accessible to the authenticated user are returned.
 */
export const ActionsListInputSchema = z.object({
  /**
   * Filter by action status.
   *
   * When specified, only actions with the matching status will be returned.
   * This is useful for showing pending actions, executed actions, etc.
   */
  status: ActionStatusSchema.optional().describe(
    "Filter actions by their current status"
  ),

  /**
   * Filter by target address.
   *
   * When specified, only actions targeting the specified address will be returned.
   * This is useful for showing actions related to a specific token or contract.
   */
  targets: z
    .array(ethereumAddress)
    .optional()
    .describe("Filter actions by their target addresses"),

  /**
   * Filter by action name.
   *
   * When specified, only actions with the matching name will be returned.
   * This is useful for filtering specific types of actions.
   */
  name: z.string().optional().describe("Filter actions by their name"),
});

/**
 * Response schema for the actions list endpoint.
 *
 * Returns a simple array of actions matching the query criteria.
 */
export const ActionsListResponseSchema = ActionsListDataSchema;

// Type exports for enhanced TypeScript integration
export type Action = z.infer<typeof ActionSchema>;
export type ActionExecutor = z.infer<typeof ActionExecutorSchema>;
export type ActionsListData = z.infer<typeof ActionsListDataSchema>;
export type ActionsListInput = z.infer<typeof ActionsListInputSchema>;
export type ActionsListResponse = z.infer<typeof ActionsListResponseSchema>;
