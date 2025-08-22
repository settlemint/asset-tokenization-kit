import { statsAssets } from "@/orpc/routes/system/stats/routes/assets";
import { statsTransactionCount } from "@/orpc/routes/system/stats/routes/transaction-count";
import { statsTransactionHistory } from "@/orpc/routes/system/stats/routes/transaction-history";
import { statsValue } from "@/orpc/routes/system/stats/routes/value";

const routes = {
  assets: statsAssets,
  transactionCount: statsTransactionCount,
  transactionHistory: statsTransactionHistory,
  value: statsValue,
};

export default routes;
