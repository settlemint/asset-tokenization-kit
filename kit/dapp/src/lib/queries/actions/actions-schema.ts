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
export const OnchainActionSchema = t.Object(
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

/**
 * Type for raw onchain action
 */
export type OnchainAction = StaticDecode<typeof OnchainActionSchema>;

export const CalculatedActionSchema = t.Object(
  {
    status: ActionStatusSchema,
  },
  { $id: "CalculatedAction" }
);

export const ActionSchema = t.Intersect([
  OnchainActionSchema,
  CalculatedActionSchema,
]);

/**
 * Type for validated action
 */
export type Action = StaticDecode<typeof ActionSchema>;

/**
 * Schema for action executor with actions
 */
export const OnchainActionExecutorSchema = t.Object(
  {
    id: t.String(),
    executors: t.Array(
      t.Object({
        id: t.String(),
      })
    ),
    actions: t.Array(OnchainActionSchema),
  },
  { $id: "ActionExecutor" }
);
