import { z } from "zod/v4";

export const ActionTypeSchema = z.enum(["ADMIN", "USER"]);
export const ActionStatusSchema = z.enum(["PENDING", "UPCOMING", "COMPLETED"]);

export const ActionSchema = z.object({
  id: z.string(),
  type: ActionTypeSchema,
  status: ActionStatusSchema,
  title: z.string(),
  description: z.string().nullable(),
  dueDate: z.number().nullable(),
  createdAt: z.number(),
  updatedAt: z.number(),
  createdBy: z.string(),
  assignedTo: z.string().nullable(),
  token: z.string().nullable(),
  metadata: z
    .array(
      z.object({
        key: z.string(),
        value: z.string(),
      })
    )
    .optional(),
});

export const TokenActionsInputSchema = z.object({
  status: ActionStatusSchema.optional(),
  type: ActionTypeSchema.optional(),
  assignedTo: z.string().optional(),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
});

export const TokenActionsOutputSchema = z.object({
  actions: z.array(ActionSchema),
  total: z.number(),
  hasMore: z.boolean(),
});

export type ActionType = z.infer<typeof ActionTypeSchema>;
export type ActionStatus = z.infer<typeof ActionStatusSchema>;
export type Action = z.infer<typeof ActionSchema>;
export type TokenActionsInput = z.infer<typeof TokenActionsInputSchema>;
export type TokenActionsOutput = z.infer<typeof TokenActionsOutputSchema>;
