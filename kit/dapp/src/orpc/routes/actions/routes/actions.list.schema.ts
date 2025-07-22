import { ethereumAddress } from "@/lib/zod/validators/ethereum-address";
import { ListSchema } from "@/orpc/routes/common/schemas/list.schema";
import { z } from "zod";

/**
 * Action status enumeration matching the subgraph schema.
 *
 * These statuses represent the current state of an action:
 * - PENDING: Action is not yet active (activeAt is in the future)
 * - ACTIVE: Action is currently executable (activeAt has passed, expiresAt hasn't)
 * - EXECUTED: Action has been successfully executed
 * - EXPIRED: Action has expired without being executed
 */
export const ActionStatusSchema = z.enum([
  "PENDING",
  "ACTIVE",
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
  createdAt: z.bigint().describe("Timestamp when the action was created"),
  activeAt: z.bigint().describe("Timestamp when the action becomes active"),
  expiresAt: z
    .bigint()
    .nullable()
    .describe("Timestamp when the action expires (null if no expiry)"),
  requiredRole: z
    .string()
    .nullable()
    .describe("Role required to execute the action (null if no role required)"),
  status: ActionStatusSchema.describe("Current status of the action"),
  executed: z
    .boolean()
    .describe(
      "DEPRECATED: Whether the action has been executed (use status instead)"
    ),
  executedAt: z
    .bigint()
    .nullable()
    .describe("Timestamp when the action was executed"),
  executedBy: ethereumAddress
    .nullable()
    .describe("Address that executed the action"),
  identifier: z
    .string()
    .nullable()
    .describe("Optional identifier for the action"),
  executor: ActionExecutorSchema.describe(
    "Executor information for the action"
  ),
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
 * Schema for validating the GraphQL query response from TheGraph.
 *
 * Wraps the array of actions in a response object to match TheGraph's
 * response structure. This ensures type safety and runtime validation
 * of the data returned from the subgraph.
 */
export const ActionsResponseSchema = z.object({
  actions: ActionsListDataSchema,
});

/**
 * Input schema for actions listing queries.
 *
 * Extends the base ListSchema with actions-specific filtering parameters.
 * Note that user filtering is handled automatically server-side - only actions
 * accessible to the authenticated user are returned.
 */
export const ActionsListSchema = ListSchema.extend({
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
  target: ethereumAddress
    .optional()
    .describe("Filter actions by their target address"),

  /**
   * Filter by required role.
   *
   * When specified, only actions requiring the specified role will be returned.
   * This is useful for filtering actions by permission level.
   */
  requiredRole: z
    .string()
    .optional()
    .describe("Filter actions by the role required to execute them"),

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
 * Returns a paginated list of actions with metadata about the result set.
 * The data array contains the actual action objects.
 */
export const ActionsListResponseSchema = z.object({
  data: ActionsListDataSchema.describe(
    "Array of actions matching the query criteria"
  ),
  total: z
    .number()
    .int()
    .nonnegative()
    .describe("Total number of actions available (before pagination)"),
  offset: z
    .number()
    .int()
    .nonnegative()
    .describe("The offset used for this query"),
  limit: z
    .number()
    .int()
    .positive()
    .optional()
    .describe("The limit used for this query"),
});

// Type exports for enhanced TypeScript integration
export type Action = z.infer<typeof ActionSchema>;
export type ActionExecutor = z.infer<typeof ActionExecutorSchema>;
export type ActionsListData = z.infer<typeof ActionsListDataSchema>;
export type ActionsResponse = z.infer<typeof ActionsResponseSchema>;
export type ActionsListInput = z.infer<typeof ActionsListSchema>;
export type ActionsListResponse = z.infer<typeof ActionsListResponseSchema>;
