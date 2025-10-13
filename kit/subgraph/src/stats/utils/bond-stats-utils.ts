import { Address } from "@graphprotocol/graph-ts";
import { Token, TokenBond } from "../../../generated/schema";
import { fetchToken } from "../../token/fetch/token";
import { updateTokenBondStats } from "../token-bond-stats";

/**
 * Update stats for bond when asset balance changes (bond or denomination asset).
 */
export function updateBondStatsForAssetBalanceChange(
  token: Token,
  bond: Address
): void {
  // Check if the bond whose balance changed is a bond contract
  const potentialBondToken = TokenBond.load(bond);
  if (potentialBondToken != null) {
    // Check if this bond uses the transferred token as denomination asset
    if (potentialBondToken.denominationAsset == token.id) {
      const bondToken = fetchToken(Address.fromBytes(potentialBondToken.id));
      updateTokenBondStats(bondToken);
    }
  } else if (token.bond) {
    updateTokenBondStats(token);
  }
}
