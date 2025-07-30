import { factoryCreate } from "@/orpc/routes/token/routes/factory/factory.create";
import { factoryList } from "@/orpc/routes/token/routes/factory/factory.list";
import { factoryPredictAddress } from "@/orpc/routes/token/routes/factory/factory.predict-address";
import { factoryRead } from "@/orpc/routes/token/routes/factory/factory.read";
import { approve } from "@/orpc/routes/token/routes/mutations/approve/token.approve";
import { burn } from "@/orpc/routes/token/routes/mutations/burn/token.burn";
import { setCap } from "@/orpc/routes/token/routes/mutations/cap/token.set-cap";
import { addComplianceModule } from "@/orpc/routes/token/routes/mutations/compliance/token.add-compliance-module";
import { removeComplianceModule } from "@/orpc/routes/token/routes/mutations/compliance/token.remove-compliance-module";
import { create } from "@/orpc/routes/token/routes/mutations/create/token.create";
import { freezeAddress } from "@/orpc/routes/token/routes/mutations/freeze/token.freeze-address";
import { mint } from "@/orpc/routes/token/routes/mutations/mint/token.mint";
import { pause } from "@/orpc/routes/token/routes/mutations/pause/token.pause";
import { unpause } from "@/orpc/routes/token/routes/mutations/pause/token.unpause";
import { forcedRecover } from "@/orpc/routes/token/routes/mutations/recovery/token.forced-recover";
import { recoverERC20 } from "@/orpc/routes/token/routes/mutations/recovery/token.recover-erc20";
import { recoverTokens } from "@/orpc/routes/token/routes/mutations/recovery/token.recover-tokens";
import { redeem } from "@/orpc/routes/token/routes/mutations/redeem/token.redeem";
import { transfer } from "@/orpc/routes/token/routes/mutations/transfer/token.transfer";
import { setYieldSchedule } from "@/orpc/routes/token/routes/mutations/yield/token.set-yield-schedule";
import { statsAssetSupplyChanges } from "@/orpc/routes/token/routes/stats/[tokenAddress]/supply-changes";
import { statsAssetTotalSupply } from "@/orpc/routes/token/routes/stats/[tokenAddress]/total-supply";
import { statsSystemAssets } from "@/orpc/routes/token/routes/stats/system/assets";
import { statsSystemTransactionCount } from "@/orpc/routes/token/routes/stats/system/transaction-count";
import { statsSystemTransactionHistory } from "@/orpc/routes/token/routes/stats/system/transaction-history";
import { statsSystemValue } from "@/orpc/routes/token/routes/stats/system/value";
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
  approve,
  redeem,
  freezeAddress,
  recoverTokens,
  forcedRecover,
  recoverERC20,
  setCap,
  setYieldSchedule,
  addComplianceModule,
  removeComplianceModule,
  statsSystemAssets,
  statsSystemValue,
  statsSystemTransactionCount,
  statsSystemTransactionHistory,
  statsAssetTotalSupply,
  statsAssetSupplyChanges,
};

export default routes;
