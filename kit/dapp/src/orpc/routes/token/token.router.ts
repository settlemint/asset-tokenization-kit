import { factoryCreate } from "@/orpc/routes/token/routes/factory/factory.create";
import { factoryList } from "@/orpc/routes/token/routes/factory/factory.list";
import { factoryRead } from "@/orpc/routes/token/routes/factory/factory.read";
import { create } from "@/orpc/routes/token/routes/mutations/create/token.create";
import { pause } from "@/orpc/routes/token/routes/mutations/pause/token.pause";
import { unpause } from "@/orpc/routes/token/routes/mutations/pause/token.unpause";
import { mint } from "@/orpc/routes/token/routes/mutations/mint/token.mint";
import { burn } from "@/orpc/routes/token/routes/mutations/burn/token.burn";
import { transfer } from "@/orpc/routes/token/routes/mutations/transfer/token.transfer";
import { transferFrom } from "@/orpc/routes/token/routes/mutations/transfer/token.transfer-from";
import { forcedTransfer } from "@/orpc/routes/token/routes/mutations/transfer/token.forced-transfer";
import { tokenApprove } from "@/orpc/routes/token/routes/mutations/approve/token.approve";
import { tokenRedeem } from "@/orpc/routes/token/routes/mutations/redeem/token.redeem";
import { tokenRedeemAll } from "@/orpc/routes/token/routes/mutations/redeem/token.redeem-all";
import { tokenFreezeAddress } from "@/orpc/routes/token/routes/mutations/freeze/token.freeze-address";
import { events } from "@/orpc/routes/token/routes/token.events";
import { holders } from "@/orpc/routes/token/routes/token.holders";
import { list } from "@/orpc/routes/token/routes/token.list";
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
  pause,
  unpause,
  mint,
  burn,
  transfer,
  transferFrom,
  forcedTransfer,
  tokenApprove,
  tokenRedeem,
  tokenRedeemAll,
  tokenFreezeAddress,
  statsAssets,
  statsTransactions,
  statsValue,
};

export default routes;
