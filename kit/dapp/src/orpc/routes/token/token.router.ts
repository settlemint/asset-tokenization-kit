import { factoryCreate } from "@/orpc/routes/token/routes/factory/factory.create";
import { factoryList } from "@/orpc/routes/token/routes/factory/factory.list";
import { factoryRead } from "@/orpc/routes/token/routes/factory/factory.read";
import { create } from "@/orpc/routes/token/routes/mutations/create/token.create";
import { pause } from "@/orpc/routes/token/routes/mutations/pause/token.pause";
import { unpause } from "@/orpc/routes/token/routes/mutations/pause/token.unpause";
import { mint } from "@/orpc/routes/token/routes/mutations/mint/token.mint";
import { burn } from "@/orpc/routes/token/routes/mutations/burn/token.burn";
import { transfer } from "@/orpc/routes/token/routes/mutations/transfer/token.transfer";
import { tokenApprove } from "@/orpc/routes/token/routes/mutations/approve/token.approve";
import { tokenRedeem } from "@/orpc/routes/token/routes/mutations/redeem/token.redeem";
import { tokenFreezeAddress } from "@/orpc/routes/token/routes/mutations/freeze/token.freeze-address";
import { tokenRecoverTokens } from "@/orpc/routes/token/routes/mutations/recovery/token.recover-tokens";
import { tokenForcedRecover } from "@/orpc/routes/token/routes/mutations/recovery/token.forced-recover";
import { tokenRecoverERC20 } from "@/orpc/routes/token/routes/mutations/recovery/token.recover-erc20";
import { tokenSetCap } from "@/orpc/routes/token/routes/mutations/cap/token.set-cap";
import { tokenSetYieldSchedule } from "@/orpc/routes/token/routes/mutations/yield/token.set-yield-schedule";
import { tokenAddComplianceModule } from "@/orpc/routes/token/routes/mutations/compliance/token.add-compliance-module";
import { tokenRemoveComplianceModule } from "@/orpc/routes/token/routes/mutations/compliance/token.remove-compliance-module";
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
  statsAssets,
  statsTransactions,
  statsValue,
};

export default routes;
