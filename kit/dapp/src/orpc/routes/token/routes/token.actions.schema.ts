import { ListSchema } from "@/orpc/routes/common/schemas/list.schema";
import { ACTION_TYPES, ACTION_USER_TYPES, ACTION_STATUS } from "@/lib/constants/action-types";
import { z } from "zod/v4";

/**
 * Action status enum - using centralized definitions
 */
export const ActionStatusEnum = z.enum([
  ACTION_STATUS.PENDING,
  ACTION_STATUS.UPCOMING, 
  ACTION_STATUS.COMPLETED,
  ACTION_STATUS.EXPIRED
]);
export type ActionStatus = z.infer<typeof ActionStatusEnum>;

/**
 * Input schema for token actions query
 */
export const TokenActionsInputSchema = ListSchema.extend({
  tokenId: z.string().optional(),
  status: ActionStatusEnum.optional(),
  type: z.enum([ACTION_USER_TYPES.ADMIN, ACTION_USER_TYPES.USER]).optional(),
  userAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address").optional(),
});

export type TokenActionsInput = z.infer<typeof TokenActionsInputSchema>;

/**
 * Schema for a single action response
 */
export const TokenActionSchema = z.object({
  id: z.string(),
  name: z.enum([
    ACTION_TYPES.APPROVE_XVP_SETTLEMENT,
    ACTION_TYPES.EXECUTE_XVP_SETTLEMENT,
    ACTION_TYPES.MATURE_BOND
  ]),
  type: z.enum([ACTION_USER_TYPES.ADMIN, ACTION_USER_TYPES.USER]),
  status: ActionStatusEnum, // Computed server-side
  createdAt: z.number(), // UTC seconds
  activeAt: z.number(), // UTC seconds  
  expiresAt: z.number().nullable(), // UTC seconds
  executedAt: z.number().nullable(), // UTC seconds
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