import { t, type StaticDecode } from "@/lib/utils/typebox";
import type { Static } from "@sinclair/typebox";

export const OnChainXvPSettlementFlowSchema = t.Object({
  id: t.String(),
  from: t.Object({ id: t.EthereumAddress() }),
  to: t.Object({ id: t.EthereumAddress() }),
  amount: t.BigDecimal(),
  asset: t.Object({
    id: t.EthereumAddress(),
    symbol: t.AssetSymbol(),
    type: t.AssetType(),
    decimals: t.Decimals(),
  }),
});

/**
 * TypeBox schema for XvPSettlementFlow
 */
export const CalculatedXvPSettlementFlowSchema = t.Object({
  assetPrice: t.Price({
    description: "Price of the asset",
  }),
});

export const XvPSettlementFlowSchema = t.Intersect(
  [OnChainXvPSettlementFlowSchema, CalculatedXvPSettlementFlowSchema],
  {
    description: "Flows of the settlement",
  }
);

export type XvPSettlementFlow = Static<typeof XvPSettlementFlowSchema>;

/**
 * TypeBox schema for XvPSettlementApproval
 */
export const XvPSettlementApprovalSchema = t.Object({
  id: t.String(),
  account: t.Object({ id: t.EthereumAddress() }),
  approved: t.Boolean(),
  timestamp: t.Nullable(t.String()),
});

export type XvPSettlementApproval = StaticDecode<
  typeof XvPSettlementApprovalSchema
>;

export const OnChainXvPSettlementSchema = t.Object({
  id: t.EthereumAddress(),
  cutoffDate: t.String(),
  autoExecute: t.Boolean(),
  executed: t.Boolean(),
  cancelled: t.Boolean(),
  approvals: t.Array(XvPSettlementApprovalSchema),
  flows: t.Array(OnChainXvPSettlementFlowSchema),
  createdAt: t.String(),
});

export type OnChainXvPSettlement = StaticDecode<
  typeof OnChainXvPSettlementSchema
>;

export const CalculatedXvPSettlementSchema = t.Object({
  flows: t.Array(XvPSettlementFlowSchema),
  totalPrice: t.Price({
    description: "Total price of the settlement",
  }),
});

/**
 * TypeBox schema for XvPSettlement
 */
export const XvPSettlementSchema = t.Intersect(
  [
    t.Omit(OnChainXvPSettlementSchema, ["flows"]),
    CalculatedXvPSettlementSchema,
  ],
  {
    description: "XvPSettlement",
  }
);

export type XvPSettlement = StaticDecode<typeof XvPSettlementSchema>;

export const XvPStatusSchema = t.Union([
  t.Literal("PENDING"),
  t.Literal("APPROVED"),
  t.Literal("EXECUTED"),
  t.Literal("CANCELLED"),
  t.Literal("EXPIRED"),
]);

export type XvPStatus = StaticDecode<typeof XvPStatusSchema>;
