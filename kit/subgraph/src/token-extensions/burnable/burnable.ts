import { BurnCompleted } from "../../../generated/templates/Burnable/Burnable";
import { fetchEvent } from "../../event/fetch/event";
import { updateAccountStatsForBalanceChange } from "../../stats/account-stats";
import { updateSystemStatsForSupplyChange } from "../../stats/system-stats";
import { trackTokenCollateralStats } from "../../stats/token-collateral-stats";
import { trackTokenStats } from "../../stats/token-stats";
import { updateTokenTypeStatsForSupplyChange } from "../../stats/token-type-stats";
import { updateTotalDenominationAssetNeeded } from "../../token-assets/bond/utils/bond-utils";
import { decreaseTokenBalanceValue } from "../../token-balance/utils/token-balance-utils";
import { fetchToken } from "../../token/fetch/token";
import { decreaseTokenSupply } from "../../token/utils/token-utils";
import { toBigDecimal } from "../../utils/token-decimals";
import { fetchCollateral } from "../collateral/fetch/collateral";

export function handleBurnCompleted(event: BurnCompleted): void {
  const eventEntry = fetchEvent(event, "BurnCompleted");
  const token = fetchToken(event.address);

  // Execute the burn
  decreaseTokenSupply(token, event.params.amount);
  decreaseTokenBalanceValue(
    token,
    event.params.from,
    event.params.amount,
    event.block.timestamp
  );

  const amountDelta = toBigDecimal(event.params.amount, token.decimals).neg();
  const amountDeltaExact = event.params.amount.neg();

  // Update system stats (negative delta for burn)
  const totalSystemValueInBaseCurrency = updateSystemStatsForSupplyChange(
    token,
    amountDelta
  );

  // Update token type stats (negative delta for burn)
  updateTokenTypeStatsForSupplyChange(
    totalSystemValueInBaseCurrency,
    token,
    amountDelta
  );

  // Update account stats (negative delta for burn)
  updateAccountStatsForBalanceChange(
    event.params.from,
    token,
    amountDeltaExact
  );

  // Update token stats
  trackTokenStats(token, eventEntry);

  // Update token collateral stats
  if (token.collateral) {
    const collateral = fetchCollateral(event.address);
    trackTokenCollateralStats(token, collateral);
  }

  // Update total denomination asset needed on maturity if this is a bond token
  if (token.bond) {
    updateTotalDenominationAssetNeeded(token);
  }
}
