import { Address, BigInt, Bytes, log } from "@graphprotocol/graph-ts";
import {
  Token,
  TokenFixedYieldSchedule,
  TokenFixedYieldSchedulePeriod,
} from "../../../../generated/schema";
import { FixedYieldSchedule as FixedYieldScheduleContract } from "../../../../generated/templates/FixedYieldSchedule/FixedYieldSchedule";
import { setBigNumber } from "../../../utils/bignumber";
import { fetchYield } from "../../yield/fetch/yield";
import { fetchFixedYieldSchedule } from "../fetch/fixed-yield-schedule";
import { fetchFixedYieldSchedulePeriod } from "../fetch/fixed-yield-schedule-period";

export function getPeriodId(address: Address, periodNumber: i32): Bytes {
  return address.concat(Bytes.fromUTF8(`-period-${periodNumber.toString()}`));
}

export function updateYield(token: Token): void {
  const yield_ = fetchYield(Address.fromBytes(token.id));
  if (yield_.schedule === null) {
    log.error("FixedYieldSchedule: no schedule set", []);
    return;
  }
  const fixedYieldScheduleAddress = Address.fromBytes(yield_.schedule!);
  if (fixedYieldScheduleAddress.equals(Address.zero())) {
    // No schedule set
    return;
  }

  const fixedYieldSchedule = fetchFixedYieldSchedule(fixedYieldScheduleAddress);
  if (!fixedYieldSchedule.nextPeriod) {
    // There is no next period, the schedule has ended
    return;
  }

  const fixedYieldScheduleContract = FixedYieldScheduleContract.bind(
    fixedYieldScheduleAddress
  );

  const currentPeriod = fixedYieldScheduleContract.try_currentPeriod();
  if (currentPeriod.reverted) {
    log.error("FixedYieldSchedule: currentPeriod reverted", []);
    return;
  }

  const currentPeriodValue = currentPeriod.value.toI32();
  const fixedYieldCurrentPeriod = fetchFixedYieldSchedulePeriod(
    getPeriodId(fixedYieldScheduleAddress, currentPeriodValue)
  );
  fixedYieldSchedule.currentPeriod = fixedYieldCurrentPeriod.id;
  fixedYieldSchedule.save();

  const nextPeriodId = getPeriodId(
    fixedYieldScheduleAddress,
    currentPeriodValue + 1
  );
  const fixedYieldNextPeriod = TokenFixedYieldSchedulePeriod.load(nextPeriodId);
  if (!fixedYieldNextPeriod) {
    // There is no next period, the schedule has ended
    fixedYieldSchedule.nextPeriod = null;
    fixedYieldSchedule.save();
    return;
  }

  if (
    fixedYieldSchedule.currentPeriod &&
    fixedYieldNextPeriod.totalYieldExact.gt(BigInt.zero())
  ) {
    // The next period has already a yield set and we are after the start date as there is a current period set
    // At this point, the yield will not change anymore
    return;
  }

  const nextPeriodYield =
    fixedYieldScheduleContract.try_totalYieldForNextPeriod();
  if (nextPeriodYield.reverted) {
    log.error("FixedYieldSchedule: totalYieldForNextPeriod reverted", []);
    return;
  }

  if (nextPeriodYield.value.equals(BigInt.zero())) {
    // There is no next period, the schedule has ended
    fixedYieldSchedule.nextPeriod = null;
    fixedYieldSchedule.save();
    return;
  }

  setBigNumber(
    fixedYieldNextPeriod,
    "totalYield",
    nextPeriodYield.value,
    token.decimals
  );
  fixedYieldSchedule.nextPeriod = fixedYieldNextPeriod.id;
  fixedYieldNextPeriod.save();

  const unclaimedYield = fixedYieldScheduleContract.try_totalUnclaimedYield();
  if (unclaimedYield.reverted) {
    log.error("FixedYieldSchedule: totalUnclaimedYield reverted", []);
    return;
  }

  setBigNumber(
    fixedYieldSchedule,
    "totalUnclaimedYield",
    unclaimedYield.value,
    token.decimals
  );
  setBigNumber(
    fixedYieldSchedule,
    "totalYield",
    fixedYieldSchedule.totalYieldExact.plus(nextPeriodYield.value),
    token.decimals
  );

  fixedYieldSchedule.save();
}

export function calculateTotalYield(
  fixedYieldSchedule: TokenFixedYieldSchedule
): BigInt {
  const periods = fixedYieldSchedule.periods.load();
  let totalYield = BigInt.zero();
  for (let i = 0; i < periods.length; i++) {
    const period = periods[i];
    totalYield = totalYield.plus(period.totalYieldExact);
  }
  return totalYield;
}
