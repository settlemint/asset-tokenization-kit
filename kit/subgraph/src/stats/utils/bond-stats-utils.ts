import { Address } from "@graphprotocol/graph-ts";
import { Token, TokenBond } from "../../../generated/schema";
import { fetchToken } from "../../token/fetch/token";
import { updateTokenBondStats } from "../token-bond-stats";

/**
 * Update stats for bond when underlying asset balance changes.
 */
export function updateBondStatsForUnderlyingAssetBalanceChange(
  underlyingAsset: Token,
  bond: Address
): void {
  // Check if the bond whose balance changed is a bond contract
  const potentialBondToken = TokenBond.load(bond);
  if (potentialBondToken != null) {
    // Check if this bond uses the transferred token as underlying asset
    if (potentialBondToken.denominationAsset == underlyingAsset.id) {
      const token = fetchToken(Address.fromBytes(potentialBondToken.id));
      updateTokenBondStats(token);
    }
  }
}
