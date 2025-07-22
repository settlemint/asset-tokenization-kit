import { z } from "zod";
import { ActionSchema } from "./actions.list.schema";

/**
 * Input schema for reading a single action.
 *
 * Requires the action ID to fetch detailed information about a specific action.
 * The action must be accessible to the authenticated user (user must be listed
 * as an executor).
 */
export const ActionsReadSchema = z.object({
  /**
   * The unique identifier of the action to read.
   *
   * This should be the bytes32 ID of the action as stored in the subgraph.
   * The action must exist and be accessible to the authenticated user.
   */
  id: z.string().describe("The unique identifier of the action to read"),
});

/**
 * Response schema for reading a single action.
 *
 * Returns the complete action object with all its details including
 * executor information, target details, and execution status.
 * This provides all the information needed to display action details
 * and determine if the action can be executed by the current user.
 */
export const ActionsReadResponseSchema = z.object({
  /**
   * The action data with full details.
   *
   * Uses the same ActionSchema as the list endpoint to ensure consistency
   * across all action-related API responses.
   */
  data: ActionSchema.describe("Complete action information"),
});

// Type exports for enhanced TypeScript integration
export type ActionsReadInput = z.infer<typeof ActionsReadSchema>;
export type ActionsReadResponse = z.infer<typeof ActionsReadResponseSchema>;
