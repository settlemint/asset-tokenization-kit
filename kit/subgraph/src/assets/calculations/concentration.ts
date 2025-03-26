import { BigDecimal, BigInt } from "@graphprotocol/graph-ts";
import { AssetBalance } from "../../../generated/schema";

/**
 * Calculates ownership concentration percentage for an asset's top holders.
 * This function computes what percentage of the total supply is held by the top 5 holders.
 *
 * @param holders - Array of asset balances
 * @param totalSupplyExact - Total supply in exact units
 * @returns The concentration percentage (0-100)
 */
export function calculateConcentration(
  holders: AssetBalance[],
  totalSupplyExact: BigInt
): BigDecimal {
  // Skip calculation if there's no supply
  if (totalSupplyExact.equals(BigInt.zero())) {
    return BigDecimal.zero();
  }

  // Prepare to find the top N holders
  const maxHolders = 5; // Consider top 5 holders
  let topHoldersSum = BigInt.zero();

  // Create a copy of holder balances to avoid modifying the originals
  const balances = new Array<BigInt>(holders.length);
  for (let i = 0; i < holders.length; i++) {
    balances[i] = holders[i].valueExact;
  }

  // Find top holders using a simple algorithm
  for (let i = 0; i < maxHolders && i < holders.length; i++) {
    let maxIndex = -1;
    let maxValue = BigInt.zero();

    // Find the largest value among remaining holders
    for (let j = 0; j < balances.length; j++) {
      if (balances[j].gt(maxValue)) {
        maxValue = balances[j];
        maxIndex = j;
      }
    }

    // If we found a valid holder, add their value to the sum and mark as counted
    if (maxIndex >= 0) {
      topHoldersSum = topHoldersSum.plus(balances[maxIndex]);
      balances[maxIndex] = BigInt.zero(); // Mark as counted
    }
  }

  // Calculate concentration percentage
  // concentration = (topHoldersSum / totalSupply) * 100
  return topHoldersSum
    .toBigDecimal()
    .times(BigDecimal.fromString("100"))
    .div(totalSupplyExact.toBigDecimal());
}
