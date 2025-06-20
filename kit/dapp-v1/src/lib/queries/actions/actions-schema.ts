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

export const ActionStatusSchema = t.Union([
  t.Literal("PENDING"),
  t.Literal("UPCOMING"),
  t.Literal("COMPLETED"),
  t.Literal("EXPIRED"),
]);
export type ActionStatus = StaticDecode<typeof ActionStatusSchema>;

/**
 * Schema for a single action
 */
export const ActionSchema = t.Object(
  {
    id: t.String(),
    name: ActionName,
    type: ActionType,
    createdAt: t.Timestamp(),
    activeAt: t.Timestamp(),
    expiresAt: t.Nullable(t.Timestamp()),
    executedAt: t.Nullable(t.Timestamp()),
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

export type Action = StaticDecode<typeof ActionSchema>;

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

export type ActionExecutor = StaticDecode<typeof ActionExecutorSchema>;
