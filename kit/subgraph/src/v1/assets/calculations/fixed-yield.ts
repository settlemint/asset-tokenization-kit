import { Address, BigInt, log } from "@graphprotocol/graph-ts";
import { Bond, FixedYield } from "../../../../generated/schema";
import { FixedYield as FixedYieldContract } from "../../../../generated/templates/FixedYield/FixedYield";
import { toDecimals } from "../../utils/decimals";
import { fetchFixedYield, fetchFixedYieldPeriod } from "../fetch/fixed-yield";

export function updateFixedYield(bond: Bond): void {
  if (!bond.yieldSchedule) {
    return;
  }

  let fixedYield = fetchFixedYield(Address.fromBytes(bond.yieldSchedule!));

  let fixedYieldContract = FixedYieldContract.bind(
    Address.fromBytes(fixedYield.id)
  );
  let underlyingDecimals = fixedYield.underlyingAssetDecimals;

  let nextPeriodYieldResult = fixedYieldContract.try_totalYieldForNextPeriod();
  fixedYield.yieldForNextPeriodExact = nextPeriodYieldResult.reverted
    ? BigInt.zero()
    : nextPeriodYieldResult.value;
  fixedYield.yieldForNextPeriod = toDecimals(
    fixedYield.yieldForNextPeriodExact,
    underlyingDecimals
  );
  fixedYield.save();
  log.info("Updated FixedYield {} yieldForNextPeriod: {}", [
    fixedYield.id.toHexString(),
    fixedYield.yieldForNextPeriod.toString(),
  ]);

  let currentPeriodResult = fixedYieldContract.try_currentPeriod();
  let fixedYieldPeriodId = currentPeriodResult.reverted
    ? BigInt.zero()
    : currentPeriodResult.value;
  let fixedYieldPeriod = fetchFixedYieldPeriod(fixedYield, fixedYieldPeriodId);
  fixedYieldPeriod.totalYield = fixedYield.yieldForNextPeriod;
  fixedYieldPeriod.totalYieldExact = fixedYield.yieldForNextPeriodExact;
  fixedYieldPeriod.save();
  log.info("Updated FixedYieldPeriod {} totalYield: {}, totalYieldExact: {}", [
    fixedYieldPeriod.id.toHexString(),
    fixedYieldPeriod.totalYield.toString(),
    fixedYieldPeriod.totalYieldExact.toString(),
  ]);
}

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
  fixedYield.underlyingBalanceExact =
    fixedYield.underlyingBalanceExact.plus(amount);
  fixedYield.underlyingBalance = toDecimals(
    fixedYield.underlyingBalanceExact,
    decimals
  );
  fixedYield.save();

  return fixedYield;
}
