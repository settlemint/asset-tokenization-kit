import { statsAssets } from "../../system/stats/routes/assets";
import { statsTransactionCount } from "../../system/stats/routes/transaction-count";
import { statsTransactionHistory } from "../../system/stats/routes/transaction-history";
import { statsValue } from "../../system/stats/routes/value";

const routes = {
  statsAssets,
  statsTransactionCount,
  statsTransactionHistory,
  statsValue,
};

export default routes;
