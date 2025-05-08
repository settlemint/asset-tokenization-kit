import { t } from "@/lib/utils/typebox";
/**
 * TypeBox schema for VaultList
 */
export const VaultListSchema = t.Object({
  id: t.String(),
  lastActivity: t.Timestamp(),
  paused: t.Boolean(),
  pendingTransactionsCount: t.Number(),
  executedTransactionsCount: t.Number(),
  totalSigners: t.StringifiedBigInt(),
  requiredSigners: t.StringifiedBigInt(),
});
