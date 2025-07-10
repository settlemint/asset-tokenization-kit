import { factoryCreate } from "@/orpc/routes/token/routes/factory.create";
import { factoryList } from "@/orpc/routes/token/routes/factory.list";
import { factoryRead } from "@/orpc/routes/token/routes/factory.read";
import { create } from "@/orpc/routes/token/routes/token.create";
import { events } from "@/orpc/routes/token/routes/token.events";
import { holders } from "@/orpc/routes/token/routes/token.holders";
import { list } from "@/orpc/routes/token/routes/token.list";
import { mint } from "@/orpc/routes/token/routes/token.mint";
import { read } from "@/orpc/routes/token/routes/token.read";
import { statsAssets } from "@/orpc/routes/token/routes/token.stats.assets";
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
  mint,
  statsAssets,
  statsTransactions,
  statsValue,
};

export default routes;
