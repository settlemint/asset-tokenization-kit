import { grantRole } from "@/orpc/routes/token/routes/mutations/access/token.grant-role";
import { revokeRole } from "@/orpc/routes/token/routes/mutations/access/token.revoke-role";
import { approve } from "@/orpc/routes/token/routes/mutations/approve/token.approve";
import { burn } from "@/orpc/routes/token/routes/mutations/burn/token.burn";
import { setCap } from "@/orpc/routes/token/routes/mutations/cap/token.set-cap";
import { updateCollateral } from "@/orpc/routes/token/routes/mutations/collateral/token.update-collateral";
import { addComplianceModule } from "@/orpc/routes/token/routes/mutations/compliance/token.add-compliance-module";
import { removeComplianceModule } from "@/orpc/routes/token/routes/mutations/compliance/token.remove-compliance-module";
import { create } from "@/orpc/routes/token/routes/mutations/create/token.create";
import { freezeAddress } from "@/orpc/routes/token/routes/mutations/freeze/token.freeze-address";
import { freezePartial } from "@/orpc/routes/token/routes/mutations/freeze/token.freeze-partial";
import { unfreezePartial } from "@/orpc/routes/token/routes/mutations/freeze/token.unfreeze-partial";
import { mint } from "@/orpc/routes/token/routes/mutations/mint/token.mint";
import { pause } from "@/orpc/routes/token/routes/mutations/pause/token.pause";
import { unpause } from "@/orpc/routes/token/routes/mutations/pause/token.unpause";
import { forcedRecover } from "@/orpc/routes/token/routes/mutations/recovery/token.forced-recover";
import { recoverERC20 } from "@/orpc/routes/token/routes/mutations/recovery/token.recover-erc20";
import { recoverTokens } from "@/orpc/routes/token/routes/mutations/recovery/token.recover-tokens";
import { redeem } from "@/orpc/routes/token/routes/mutations/redeem/token.redeem";
import { mature } from "@/orpc/routes/token/routes/mutations/mature/token.mature";
import { transfer } from "@/orpc/routes/token/routes/mutations/transfer/token.transfer";
import { forcedTransfer } from "@/orpc/routes/token/routes/mutations/transfer/token.forced-transfer";
import { setYieldSchedule } from "@/orpc/routes/token/routes/mutations/yield/token.set-yield-schedule";
import { statsBondStatus } from "@/orpc/routes/token/routes/stats/bond-status";
import { statsCollateralRatio } from "@/orpc/routes/token/routes/stats/collateral-ratio";
import { statsSupplyChanges } from "@/orpc/routes/token/routes/stats/supply-changes";
import { statsTotalSupply } from "@/orpc/routes/token/routes/stats/total-supply";
import { statsVolume } from "@/orpc/routes/token/routes/stats/volume";
import { statsWalletDistribution } from "@/orpc/routes/token/routes/stats/wallet-distribution";
import { actions } from "@/orpc/routes/token/routes/token.actions";
import { events } from "@/orpc/routes/token/routes/token.events";
import { holder } from "@/orpc/routes/token/routes/token.holder";
import { holders } from "@/orpc/routes/token/routes/token.holders";
import { list } from "@/orpc/routes/token/routes/token.list";
import { read } from "@/orpc/routes/token/routes/token.read";
import { search } from "@/orpc/routes/token/routes/token.search";

const routes = {
  actions,
  create,
  events,
  grantRole,
  revokeRole,
  holder,
  holders,
  list,
  read,
  search,
  pause,
  unpause,
  mint,
  burn,
  transfer,
  forcedTransfer,
  approve,
  redeem,
  mature,
  freezeAddress,
  freezePartial,
  unfreezePartial,
  recoverTokens,
  forcedRecover,
  recoverERC20,
  setCap,
  updateCollateral,
  setYieldSchedule,
  addComplianceModule,
  removeComplianceModule,
  statsBondStatus,
  statsCollateralRatio,
  statsTotalSupply,
  statsSupplyChanges,
  statsVolume,
  statsWalletDistribution,
};

export default routes;
