import { BigInt } from "@graphprotocol/graph-ts";
import { Bond } from "../../../generated/schema";
import { toDecimals } from "../../utils/decimals";

export function calculateTotalUnderlyingNeeded(bond: Bond): void {
  // Get underlying asset decimals
  const underlyingDecimals = bond.underlyingAssetDecimals;

  // Calculate exact value in underlying asset's decimals
  bond.totalUnderlyingNeededExact = bond.totalSupplyExact
    .times(bond.faceValue)
    .div(BigInt.fromI32(10).pow(bond.decimals as u8))
    .times(BigInt.fromI32(10).pow(underlyingDecimals as u8));

  // Convert to decimal for display
  bond.totalUnderlyingNeeded = toDecimals(
    bond.totalUnderlyingNeededExact,
    underlyingDecimals
  );

  bond.hasSufficientUnderlying = bond.underlyingBalanceExact.ge(
    bond.totalUnderlyingNeededExact
  );
}
