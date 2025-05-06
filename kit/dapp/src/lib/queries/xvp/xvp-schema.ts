import { t } from "@/lib/utils/typebox";
import type { Static } from "@sinclair/typebox";
/**
 * TypeBox schema for XvPSettlementFlow
 */
export const XvPSettlementFlowSchema = t.Object({
  id: t.String(),
  from: t.Object({ id: t.EthereumAddress() }),
  to: t.Object({ id: t.EthereumAddress() }),
  amountExact: t.StringifiedBigInt(),
  asset: t.Object({ id: t.EthereumAddress() }),
});

/**
 * TypeBox schema for XvPSettlementApproval
 */
export const XvPSettlementApprovalSchema = t.Object({
  id: t.String(),
  account: t.Object({ id: t.EthereumAddress() }),
  approved: t.Boolean(),
  timestamp: t.Nullable(t.StringifiedBigInt()),
});

/**
 * TypeBox schema for XvPSettlement
 */
export const XvPSettlementSchema = t.Object({
  id: t.EthereumAddress(),
  cutoffDate: t.StringifiedBigInt(),
  autoExecute: t.Boolean(),
  claimed: t.Boolean(),
  cancelled: t.Boolean(),
  approvals: t.Array(XvPSettlementApprovalSchema),
  flows: t.Array(XvPSettlementFlowSchema),
  createdAt: t.StringifiedBigInt(),
});

export type XvPSettlement = Static<typeof XvPSettlementSchema>;
