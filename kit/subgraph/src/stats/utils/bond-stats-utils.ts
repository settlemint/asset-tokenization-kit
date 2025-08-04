import { Address } from "@graphprotocol/graph-ts";
import { Token, TokenBond } from "../../../generated/schema";
import { fetchToken } from "../../token/fetch/token";
import { updateTokenBondStats } from "../token-bond-stats";

/**
 * Updates bond stats for all bonds that use the given token as underlying asset
 * when the underlying asset balance changes for a specific account
 */
export function updateBondStatsForUnderlyingAssetBalanceChange(
  underlyingAsset: Token,
  account: Address
): void {
  // Load all bonds that use this token as underlying asset
  // We need to check if the account is a bond token that uses this underlying asset
  const potentialBondToken = TokenBond.load(account);
  if (potentialBondToken != null) {
    // Check if this bond uses the transferred token as underlying asset
    if (potentialBondToken.underlyingAsset == underlyingAsset.id) {
      const token = fetchToken(Address.fromBytes(potentialBondToken.id));
      updateTokenBondStats(token);
    }
  }
}
