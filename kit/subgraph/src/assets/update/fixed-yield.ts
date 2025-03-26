import { Address, BigInt } from "@graphprotocol/graph-ts";
import { FixedYield } from "../../../generated/schema";
import { toDecimals } from "../../utils/decimals";

/**
 * Updates the underlying balance of a FixedYield contract
 *
 * @param address - Address of the FixedYield contract
 * @param amount - Amount to add to the underlying balance
 * @param decimals - Decimals of the underlying asset
 * @returns The updated FixedYield entity or null if not found
 */
export function updateFixedYieldBalance(
  address: Address,
  amount: BigInt,
  decimals: i32
): FixedYield | null {
  const fixedYield = FixedYield.load(address);

  if (!fixedYield) {
    return null;
  }

  // Update the balances
  fixedYield.underlyingBalanceExact = fixedYield.underlyingBalanceExact.plus(amount);
  fixedYield.underlyingBalance = toDecimals(fixedYield.underlyingBalanceExact, decimals);
  fixedYield.save();

  return fixedYield;
}