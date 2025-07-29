import { factoryCreate } from "@/orpc/routes/token/routes/factory/factory.create";
import { factoryList } from "@/orpc/routes/token/routes/factory/factory.list";
import { factoryPredictAddress } from "@/orpc/routes/token/routes/factory/factory.predict-address";
import { factoryRead } from "@/orpc/routes/token/routes/factory/factory.read";
import { tokenApprove } from "@/orpc/routes/token/routes/mutations/approve/token.approve";
import { burn } from "@/orpc/routes/token/routes/mutations/burn/token.burn";
import { tokenSetCap } from "@/orpc/routes/token/routes/mutations/cap/token.set-cap";
import { tokenAddComplianceModule } from "@/orpc/routes/token/routes/mutations/compliance/token.add-compliance-module";
import { tokenRemoveComplianceModule } from "@/orpc/routes/token/routes/mutations/compliance/token.remove-compliance-module";
import { create } from "@/orpc/routes/token/routes/mutations/create/token.create";
import { tokenFreezeAddress } from "@/orpc/routes/token/routes/mutations/freeze/token.freeze-address";
import { mint } from "@/orpc/routes/token/routes/mutations/mint/token.mint";
import { pause } from "@/orpc/routes/token/routes/mutations/pause/token.pause";
import { unpause } from "@/orpc/routes/token/routes/mutations/pause/token.unpause";
import { tokenForcedRecover } from "@/orpc/routes/token/routes/mutations/recovery/token.forced-recover";
import { tokenRecoverERC20 } from "@/orpc/routes/token/routes/mutations/recovery/token.recover-erc20";
import { tokenRecoverTokens } from "@/orpc/routes/token/routes/mutations/recovery/token.recover-tokens";
import { tokenRedeem } from "@/orpc/routes/token/routes/mutations/redeem/token.redeem";
import { transfer } from "@/orpc/routes/token/routes/mutations/transfer/token.transfer";
import { tokenSetYieldSchedule } from "@/orpc/routes/token/routes/mutations/yield/token.set-yield-schedule";
import {
  activity as statsActivity,
  assetActivity as statsAssetActivity,
} from "@/orpc/routes/token/routes/stats/activity";
import { assets } from "@/orpc/routes/token/routes/stats/assets";
import { statsSupplyDistribution } from "@/orpc/routes/token/routes/stats/supply-distribution";
import {
  assetTransactions as statsAssetTransactions,
  systemTransactions as statsTransactions,
} from "@/orpc/routes/token/routes/stats/transactions";
import {
  totalValue as statsTotalValue,
  value as statsValue,
} from "@/orpc/routes/token/routes/stats/value";
import { assetVolume as statsAssetVolume } from "@/orpc/routes/token/routes/stats/volume";
import { actions } from "@/orpc/routes/token/routes/token.actions";
import { events } from "@/orpc/routes/token/routes/token.events";
import { holders } from "@/orpc/routes/token/routes/token.holders";
import { list } from "@/orpc/routes/token/routes/token.list";
import { read } from "@/orpc/routes/token/routes/token.read";

const routes = {
  actions,
  create,
  events,
  factoryCreate,
  factoryList,
  factoryPredictAddress,
  factoryRead,
  holders,
  list,
  read,
  pause,
  unpause,
  mint,
  burn,
  transfer,
  tokenApprove,
  tokenRedeem,
  tokenFreezeAddress,
  tokenRecoverTokens,
  tokenForcedRecover,
  tokenRecoverERC20,
  tokenSetCap,
  tokenSetYieldSchedule,
  tokenAddComplianceModule,
  tokenRemoveComplianceModule,
  statsActivity,
  statsTransactions,
  statsValue,
  statsTotalValue,
  assets,
  statsSupplyDistribution,
  statsAssetActivity,
  statsAssetTransactions,
  statsAssetVolume,
};

export default routes;
