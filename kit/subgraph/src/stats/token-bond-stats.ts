import { Address } from "@graphprotocol/graph-ts";
import { Token, TokenBondStatsData } from "../../generated/schema";
import { fetchAccount } from "../account/fetch/account";
import { fetchBond } from "../token-assets/bond/fetch/bond";
import { fetchTokenBalance } from "../token-balance/fetch/token-balance";
import { fetchToken } from "../token/fetch/token";
import { setBigNumber } from "../utils/bignumber";

export function trackTokenBondStats(token: Token): void {
  // Only track stats for bond tokens
  if (!token.bond) {
    return;
  }

  const bond = fetchBond(Address.fromBytes(token.bond!));

  // Create stats data entry
  const statsData = new TokenBondStatsData(1);
  statsData.token = token.id;

  // Get underlying asset balance of the bond
  const underlyingAsset = fetchToken(Address.fromBytes(bond.underlyingAsset));
  const bondAccount = fetchAccount(Address.fromBytes(token.account));
  const underlyingBalance = fetchTokenBalance(underlyingAsset, bondAccount);
  const underlyingBalanceExact = underlyingBalance.valueExact;

  // Calculate required underlying asset balance
  // Required = totalSupply * faceValue
  const requiredBalanceExact = token.totalSupplyExact.times(
    bond.faceValueExact
  );
  // Set the values
  setBigNumber(
    statsData,
    "underlyingAssetBalanceAvailable",
    underlyingBalanceExact,
    underlyingAsset.decimals
  );

  setBigNumber(
    statsData,
    "underlyingAssetBalanceRequired",
    requiredBalanceExact,
    underlyingAsset.decimals
  );

  statsData.save();
}
