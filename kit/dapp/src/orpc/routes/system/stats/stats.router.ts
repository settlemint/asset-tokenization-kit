import { statsAssets } from "@/orpc/routes/system/stats/routes/assets";
import { statsPortfolio } from "@/orpc/routes/system/stats/routes/portfolio";
import { statsTransactionCount } from "@/orpc/routes/system/stats/routes/transaction-count";
import { statsTransactionHistory } from "@/orpc/routes/system/stats/routes/transaction-history";
import { statsValue } from "@/orpc/routes/system/stats/routes/value";

const routes = {
  assets: statsAssets,
  portfolio: statsPortfolio,
  transactionCount: statsTransactionCount,
  transactionHistory: statsTransactionHistory,
  value: statsValue,
};

export default routes;
