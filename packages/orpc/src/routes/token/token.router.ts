import { grantRole } from "./routes/mutations/access/token.grant-role";
import { revokeRole } from "./routes/mutations/access/token.revoke-role";
import { approve } from "./routes/mutations/approve/token.approve";
import { burn } from "./routes/mutations/burn/token.burn";
import { setCap } from "./routes/mutations/cap/token.set-cap";
import { addComplianceModule } from "./routes/mutations/compliance/token.add-compliance-module";
import { removeComplianceModule } from "./routes/mutations/compliance/token.remove-compliance-module";
import { create } from "./routes/mutations/create/token.create";
import { freezeAddress } from "./routes/mutations/freeze/token.freeze-address";
import { mint } from "./routes/mutations/mint/token.mint";
import { pause } from "./routes/mutations/pause/token.pause";
import { unpause } from "./routes/mutations/pause/token.unpause";
import { forcedRecover } from "./routes/mutations/recovery/token.forced-recover";
import { recoverERC20 } from "./routes/mutations/recovery/token.recover-erc20";
import { recoverTokens } from "./routes/mutations/recovery/token.recover-tokens";
import { redeem } from "./routes/mutations/redeem/token.redeem";
import { transfer } from "./routes/mutations/transfer/token.transfer";
import { setYieldSchedule } from "./routes/mutations/yield/token.set-yield-schedule";
import { statsBondStatus } from "./routes/stats/bond-status";
import { statsCollateralRatio } from "./routes/stats/collateral-ratio";
import { statsSupplyChanges } from "./routes/stats/supply-changes";
import { statsTotalSupply } from "./routes/stats/total-supply";
import { statsVolume } from "./routes/stats/volume";
import { statsWalletDistribution } from "./routes/stats/wallet-distribution";
import { actions } from "./routes/token.actions";
import { events } from "./routes/token.events";
import { holders } from "./routes/token.holders";
import { list } from "./routes/token.list";
import { read } from "./routes/token.read";
import { search } from "./routes/token.search";

const routes = {
  actions,
  create,
  events,
  grantRole,
  revokeRole,
  holders,
  list,
  read,
  search,
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
  statsBondStatus,
  statsCollateralRatio,
  statsTotalSupply,
  statsSupplyChanges,
  statsVolume,
  statsWalletDistribution,
};

export default routes;
