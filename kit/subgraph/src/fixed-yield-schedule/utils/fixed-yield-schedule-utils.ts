import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { Token } from "../../../generated/schema";
import { FixedYieldSchedule as FixedYieldScheduleContract } from "../../../generated/templates/FixedYieldSchedule/FixedYieldSchedule";
import { setBigNumber } from "../../utils/bignumber";
import { fetchYield } from "../../yield/fetch/yield";
import { fetchFixedYieldSchedulePeriod } from "../fetch/fixed-yield-schedule-period";

export function getPeriodId(address: Address, periodNumber: i32): Bytes {
  return address.concat(Bytes.fromUTF8(`-period-${periodNumber.toString()}`));
}

export function updateYield(token: Token): void {
  const yield_ = fetchYield(Address.fromBytes(token.id));
  const scheduleContract = FixedYieldScheduleContract.bind(
    Address.fromBytes(yield_.schedule)
  );

  const currentPeriod = scheduleContract.try_currentPeriod();
  if (currentPeriod.reverted) {
    return;
  }
  const nextPeriodYield = scheduleContract.try_totalYieldForNextPeriod();
  // Zero yield means the schedule has ended and there is no next period
  if (nextPeriodYield.reverted || nextPeriodYield.value == BigInt.zero()) {
    return;
  }
  const currentPeriodValue = currentPeriod.value.toI32();
  const nextPeriodId = getPeriodId(
    Address.fromBytes(yield_.id),
    currentPeriodValue + 1
  );
  const fixedYieldPeriod = fetchFixedYieldSchedulePeriod(nextPeriodId);
  setBigNumber(
    fixedYieldPeriod,
    "totalYield",
    nextPeriodYield.value,
    token.decimals
  );
  fixedYieldPeriod.save();
}
