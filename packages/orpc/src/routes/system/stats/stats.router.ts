import { statsAssets } from "@/routes/system/stats/routes/assets";
import { statsTransactionCount } from "@/routes/system/stats/routes/transaction-count";
import { statsTransactionHistory } from "@/routes/system/stats/routes/transaction-history";
import { statsValue } from "@/routes/system/stats/routes/value";

const routes = {
  statsAssets,
  statsTransactionCount,
  statsTransactionHistory,
  statsValue,
};

export default routes;
