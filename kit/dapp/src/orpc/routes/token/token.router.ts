import { factoryCreate } from "@/orpc/routes/token/routes/factory/factory.create";
import { factoryList } from "@/orpc/routes/token/routes/factory/factory.list";
import { factoryRead } from "@/orpc/routes/token/routes/factory/factory.read";
import { create } from "@/orpc/routes/token/routes/mutations/create/token.create";
import { pause } from "@/orpc/routes/token/routes/mutations/pause/token.pause";
import { unpause } from "@/orpc/routes/token/routes/mutations/pause/token.unpause";
import { events } from "@/orpc/routes/token/routes/token.events";
import { holders } from "@/orpc/routes/token/routes/token.holders";
import { list } from "@/orpc/routes/token/routes/token.list";
import { read } from "@/orpc/routes/token/routes/token.read";
import { statsActivityByAsset } from "@/orpc/routes/token/routes/token.stats.activity-by-asset";
import { statsAssetCount } from "@/orpc/routes/token/routes/token.stats.asset-count";
import { statsAssets } from "@/orpc/routes/token/routes/token.stats.assets";
import { statsSupplyDistribution } from "@/orpc/routes/token/routes/token.stats.supply-distribution";
import { statsTotalValue } from "@/orpc/routes/token/routes/token.stats.total-value";
import { statsTransactionCount } from "@/orpc/routes/token/routes/token.stats.transaction-count";
import { statsTransactionHistory } from "@/orpc/routes/token/routes/token.stats.transaction-history";
import { statsTransactions } from "@/orpc/routes/token/routes/token.stats.transactions";
import { statsValue } from "@/orpc/routes/token/routes/token.stats.value";

const routes = {
  create,
  events,
  factoryCreate,
  factoryList,
  factoryRead,
  holders,
  list,
  read,
  pause,
  unpause,
  statsActivityByAsset,
  statsAssetCount,
  statsAssets,
  statsSupplyDistribution,
  statsTotalValue,
  statsTransactionCount,
  statsTransactionHistory,
  statsTransactions,
  statsValue,
};

export default routes;
