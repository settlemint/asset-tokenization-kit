import { Address, BigInt } from "@graphprotocol/graph-ts";
import { Event, Token } from "../../../generated/schema";
import { updateAccountStatsForBalanceChange } from "../../stats/account-stats";
import {
  incrementSystemAssetActivity,
  SystemAssetActivity,
  updateSystemStatsForSupplyChange,
} from "../../stats/system-stats";
import { trackTokenCollateralStats } from "../../stats/token-collateral-stats";
import { trackTokenStats } from "../../stats/token-stats";
import {
  incrementTokenTypeAssetActivity,
  updateTokenTypeStatsForSupplyChange,
} from "../../stats/token-type-stats";
import { updateTotalDenominationAssetNeeded } from "../../token-assets/bond/utils/bond-utils";
import { increaseTokenBalanceValue } from "../../token-balance/utils/token-balance-utils";
import { fetchCollateral } from "../../token-extensions/collateral/fetch/collateral";
import { toBigDecimal } from "../../utils/token-decimals";
import { increaseTokenSupply } from "./token-utils";

export function handleMint(
  eventEntry: Event,
  token: Token,
  to: Address,
  amount: BigInt,
  timestamp: BigInt
): void {
  increaseTokenSupply(token, amount);

  // Update token balance
  increaseTokenBalanceValue(token, to, amount, timestamp);

  const amountDeltaExact = amount;
  const amountDelta = toBigDecimal(amount, token.decimals);

  // Update system stats
  const totalSystemValueInBaseCurrency = updateSystemStatsForSupplyChange(
    token,
    amountDelta
  );

  // Update token type stats
  updateTokenTypeStatsForSupplyChange(
    totalSystemValueInBaseCurrency,
    token,
    amountDelta
  );

  // Update account stats
  updateAccountStatsForBalanceChange(to, token, amountDeltaExact);

  // Update token stats
  trackTokenStats(token, eventEntry);

  // Update token collateral stats
  if (token.collateral) {
    const collateral = fetchCollateral(Address.fromBytes(token.id));
    trackTokenCollateralStats(token, collateral);
  }

  // Update total denomination asset needed on maturity if this is a bond token
  if (token.bond) {
    updateTotalDenominationAssetNeeded(token);
  }

  incrementSystemAssetActivity(token, SystemAssetActivity.MINT);
  incrementTokenTypeAssetActivity(token, SystemAssetActivity.MINT);
}
