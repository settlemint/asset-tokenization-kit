import type { StaticDecode } from "@/lib/utils/typebox";
import { t } from "@/lib/utils/typebox";

export const ActionName = t.Union([
  t.Literal("ApproveXvPSettlement"),
  t.Literal("ExecuteXvPSettlement"),
  t.Literal("MatureBond"),
]);
export type ActionName = StaticDecode<typeof ActionName>;

export const ActionType = t.Union([t.Literal("Admin"), t.Literal("User")]);
export type ActionType = StaticDecode<typeof ActionType>;

/**
 * Schema for a single action
 */
export const ActionSchema = t.Object(
  {
    id: t.String(),
    name: ActionName,
    type: ActionType,
    createdAt: t.String(),
    activeAt: t.String(),
    expiresAt: t.Nullable(t.String()),
    executedAt: t.Nullable(t.String()),
    executed: t.Boolean(),
    target: t.Object({
      id: t.String(),
    }),
    executedBy: t.Nullable(
      t.Object({
        id: t.String(),
      })
    ),
  },
  { $id: "Action" }
);

/**
 * Type for validated action
 */
export type Action = StaticDecode<typeof ActionSchema>;

/**
 * Schema for a list of actions
 */
export const ActionsListSchema = t.Array(ActionSchema);

/**
 * Type for validated action list
 */
export type ActionsList = StaticDecode<typeof ActionsListSchema>;

/**
 * Schema for action executor with actions
 */
export const ActionExecutorSchema = t.Object(
  {
    id: t.String(),
    executors: t.Array(
      t.Object({
        id: t.String(),
      })
    ),
    actions: t.Array(ActionSchema),
  },
  { $id: "ActionExecutor" }
);

/**
 * Type for validated action executor with actions
 */
export type ActionExecutor = StaticDecode<typeof ActionExecutorSchema>;

/**
 * Schema for the actions list response
 */
export const ActionExecutorList = t.Array(ActionExecutorSchema);

/**
 * Type for validated actions list
 */
export type ActionExecutorList = StaticDecode<typeof ActionExecutorList>;

export const ActionStateSchema = t.Union([
  t.Literal("PENDING"),
  t.Literal("UPCOMING"),
  t.Literal("COMPLETED"),
]);
export type ActionState = StaticDecode<typeof ActionStateSchema>;
