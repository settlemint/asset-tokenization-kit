import { t, type StaticDecode } from "@/lib/utils/typebox";

export const OnChainXvPSettlementFlowSchema = t.Object({
  id: t.String(),
  from: t.Object({ id: t.EthereumAddress() }),
  to: t.Object({ id: t.EthereumAddress() }),
  amountExact: t.StringifiedBigInt(),
  asset: t.Object({ id: t.EthereumAddress() }),
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

/**
 * TypeBox schema for XvPSettlementApproval
 */
export const XvPSettlementApprovalSchema = t.Object({
  id: t.String(),
  account: t.Object({ id: t.EthereumAddress() }),
  approved: t.Boolean(),
  timestamp: t.Nullable(t.StringifiedBigInt()),
});

export const OnChainXvPSettlementSchema = t.Object({
  id: t.EthereumAddress(),
  cutoffDate: t.StringifiedBigInt(),
  autoExecute: t.Boolean(),
  claimed: t.Boolean(),
  cancelled: t.Boolean(),
  approvals: t.Array(XvPSettlementApprovalSchema),
  flows: t.Array(OnChainXvPSettlementFlowSchema),
  createdAt: t.StringifiedBigInt(),
});

export type OnChainXvPSettlement = StaticDecode<
  typeof OnChainXvPSettlementSchema
>;

export const CalculatedXvPSettlementSchema = t.Object({
  totalPrice: t.Price({
    description: "Total price of the settlement",
  }),
});

/**
 * TypeBox schema for XvPSettlement
 */
export const XvPSettlementSchema = t.Intersect(
  [
    OnChainXvPSettlementSchema,
    CalculatedXvPSettlementSchema,
    t.Object({
      flows: t.Array(XvPSettlementFlowSchema),
    }),
  ],
  {
    description: "XvPSettlement",
  }
);

export type XvPSettlement = StaticDecode<typeof XvPSettlementSchema>;
