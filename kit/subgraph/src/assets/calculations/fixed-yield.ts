import { Address, BigInt, log } from "@graphprotocol/graph-ts";
import { Bond } from "../../../generated/schema";
import { FixedYield as FixedYieldContract } from "../../../generated/templates/FixedYield/FixedYield";
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
