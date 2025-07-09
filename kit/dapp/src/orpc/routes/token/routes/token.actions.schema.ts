import { ListSchema } from "@/orpc/routes/common/schemas/list.schema";
import { z } from "zod/v4";

/**
 * Action status enum
 */
export const ActionStatusEnum = z.enum(["PENDING", "UPCOMING", "COMPLETED", "EXPIRED"]);
export type ActionStatus = z.infer<typeof ActionStatusEnum>;

/**
 * Input schema for token actions query
 */
export const TokenActionsInputSchema = ListSchema.extend({
  tokenId: z.string().optional(),
  status: ActionStatusEnum.optional(),
  type: z.enum(["Admin", "User"]).optional(),
  userAddress: z.string().optional(),
});

export type TokenActionsInput = z.infer<typeof TokenActionsInputSchema>;

/**
 * Schema for a single action response
 */
export const TokenActionSchema = z.object({
  id: z.string(),
  name: z.enum(["ApproveXvPSettlement", "ExecuteXvPSettlement", "MatureBond"]),
  type: z.enum(["Admin", "User"]),
  createdAt: z.string(),
  activeAt: z.string(),
  expiresAt: z.string().nullable(),
  executedAt: z.string().nullable(),
  executed: z.boolean(),
  target: z.object({
    id: z.string(),
  }),
  executedBy: z.object({
    id: z.string(),
  }).nullable(),
});

export type TokenAction = z.infer<typeof TokenActionSchema>;

/**
 * Schema for the actions response
 */
export const TokenActionsResponseSchema = z.object({
  actions: z.array(TokenActionSchema),
});

export type TokenActionsResponse = z.infer<typeof TokenActionsResponseSchema>;

/**
 * Output schema for token actions list
 */
export const TokenActionsListSchema = z.array(TokenActionSchema);

export type TokenActionsList = z.infer<typeof TokenActionsListSchema>;