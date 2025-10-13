import type { Address, BigInt } from "@graphprotocol/graph-ts";
import type { Event, Token } from "../../../../generated/schema";
import { updateAccountStatsForBalanceChange } from "../../../stats/account-stats";
import {
  incrementSystemAssetActivity,
  SystemAssetActivity,
  updateSystemStatsForSupplyChange,
} from "../../../stats/system-stats";
import { trackTokenCollateralStats } from "../../../stats/token-collateral-stats";
import { trackTokenStats } from "../../../stats/token-stats";
import {
  incrementTokenTypeAssetActivity,
  updateTokenTypeStatsForSupplyChange,
} from "../../../stats/token-type-stats";
import { updateTotalDenominationAssetNeeded } from "../../../token-assets/bond/utils/bond-utils";
import { decreaseTokenBalanceValue } from "../../../token-balance/utils/token-balance-utils";
import { decreaseTokenSupply } from "../../../token/utils/token-utils";
import { toBigDecimal } from "../../../utils/token-decimals";
import { fetchCollateral } from "../../collateral/fetch/collateral";

export function handleBurn(
  eventEntry: Event,
  token: Token,
  from: Address,
  amount: BigInt,
  timestamp: BigInt
): void {
  // Execute the burn
  decreaseTokenSupply(token, amount);
  decreaseTokenBalanceValue(token, from, amount, timestamp);

  const amountDelta = toBigDecimal(amount, token.decimals).neg();
  const amountDeltaExact = amount.neg();

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
  updateAccountStatsForBalanceChange(from, token, amountDeltaExact);

  // Update token stats
  trackTokenStats(token, eventEntry);

  // Update token collateral stats
  if (token.collateral) {
    const collateral = fetchCollateral(token.id);
    trackTokenCollateralStats(token, collateral);
  }

  // Update total denomination asset needed on maturity if this is a bond token
  if (token.bond) {
    updateTotalDenominationAssetNeeded(token);
  }

  incrementSystemAssetActivity(token, SystemAssetActivity.BURN);
  incrementTokenTypeAssetActivity(token, SystemAssetActivity.BURN);
}
