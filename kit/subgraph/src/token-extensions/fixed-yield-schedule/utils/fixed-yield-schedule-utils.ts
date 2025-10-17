import { Address, BigInt, Bytes, log } from "@graphprotocol/graph-ts";
import {
  Token,
  TokenFixedYieldSchedule,
  TokenFixedYieldSchedulePeriod,
} from "../../../../generated/schema";
import { FixedYieldSchedule as FixedYieldScheduleContract } from "../../../../generated/templates/FixedYieldSchedule/FixedYieldSchedule";
import { setBigNumber } from "../../../utils/bignumber";
import { getTokenDecimals } from "../../../utils/token-decimals";
import { fetchYield } from "../../yield/fetch/yield";
import { fetchFixedYieldSchedule } from "../fetch/fixed-yield-schedule";
import { fetchFixedYieldSchedulePeriod } from "../fetch/fixed-yield-schedule-period";

export function getPeriodId(address: Address, periodNumber: i32): Bytes {
  return address.concat(Bytes.fromUTF8(`-period-${periodNumber.toString()}`));
}

export function updateYield(token: Token): TokenFixedYieldSchedule | null {
  if (!token.yield_) {
    return null;
  }
  const yield_ = fetchYield(Address.fromBytes(token.id));
  if (yield_.schedule === null) {
    log.info("FixedYieldSchedule: no schedule set", []);
    return null;
  }
  const fixedYieldScheduleAddress = Address.fromBytes(yield_.schedule!);
  const fixedYieldSchedule = fetchFixedYieldSchedule(fixedYieldScheduleAddress);
  const denominationAssetAddress = Address.fromBytes(
    fixedYieldSchedule.denominationAsset
  );
  const denominationAssetDecimals = getTokenDecimals(denominationAssetAddress);
  if (!fixedYieldSchedule.nextPeriod) {
    // There is no next period, the schedule has ended
    return fixedYieldSchedule;
  }

  const fixedYieldScheduleContract = FixedYieldScheduleContract.bind(
    fixedYieldScheduleAddress
  );

  const currentPeriod = fixedYieldScheduleContract.try_currentPeriod();
  if (currentPeriod.reverted) {
    log.error("FixedYieldSchedule: currentPeriod reverted", []);
    return fixedYieldSchedule;
  }

  const currentPeriodValue = currentPeriod.value.toI32();
  const periods = fixedYieldSchedule.periods.load();
  const scheduleEnded = currentPeriodValue === periods.length;
  const scheduleNotStarted = currentPeriodValue === 0;
  if (scheduleEnded || scheduleNotStarted) {
    fixedYieldSchedule.currentPeriod = null;
    fixedYieldSchedule.nextPeriod = null;
    fixedYieldSchedule.save();

    if (scheduleEnded) {
      // Mark all periods as completed
      for (let i = 0; i < periods.length; i++) {
        const period = periods[i];
        period.completed = true;
        period.save();
      }
    }

    return fixedYieldSchedule;
  }

  const fixedYieldCurrentPeriod = fetchFixedYieldSchedulePeriod(
    getPeriodId(fixedYieldScheduleAddress, currentPeriodValue)
  );
  fixedYieldSchedule.currentPeriod = fixedYieldCurrentPeriod.id;

  // Mark all periods that are before the current period as completed
  for (let i = 0; i < periods.length; i++) {
    const period = fetchFixedYieldSchedulePeriod(periods[i].id);
    if (period.endDate.le(fixedYieldCurrentPeriod.startDate)) {
      period.completed = true;
      period.save();
    }
  }

  const nextPeriodId = getPeriodId(
    fixedYieldScheduleAddress,
    currentPeriodValue + 1
  );
  const fixedYieldNextPeriod = TokenFixedYieldSchedulePeriod.load(nextPeriodId);
  if (!fixedYieldNextPeriod) {
    // There is no next period, current period is the last period
    fixedYieldSchedule.nextPeriod = null;
  } else {
    fixedYieldSchedule.nextPeriod = fixedYieldNextPeriod.id;
    fixedYieldNextPeriod.save();
  }

  if (
    !scheduleNotStarted &&
    fixedYieldCurrentPeriod.totalYieldExact.gt(BigInt.zero())
  ) {
    // The current period has already a yield set and the schedule has started
    // At this point, the yield will not change anymore
    fixedYieldSchedule.save();
    return fixedYieldSchedule;
  }

  const totalYieldForCurrentPeriod =
    fixedYieldScheduleContract.try_estimateTotalYieldForCurrentPeriod();
  if (totalYieldForCurrentPeriod.reverted) {
    log.error(
      "FixedYieldSchedule: estimateTotalYieldForCurrentPeriod reverted",
      []
    );
    fixedYieldSchedule.save();
    return fixedYieldSchedule;
  }

  if (totalYieldForCurrentPeriod.value.equals(BigInt.zero())) {
    // There is no current period, the schedule has ended
    fixedYieldSchedule.currentPeriod = null;
    fixedYieldSchedule.nextPeriod = null;
    fixedYieldSchedule.save();
    return fixedYieldSchedule;
  }

  // Set the same total yield for all periods that are not completed
  for (let i = 0; i < periods.length; i++) {
    const period = periods[i];
    if (!period.completed) {
      setBigNumber(
        period,
        "totalYield",
        totalYieldForCurrentPeriod.value,
        denominationAssetDecimals
      );
      setBigNumber(
        period,
        "totalUnclaimedYield",
        totalYieldForCurrentPeriod.value.minus(
          fixedYieldCurrentPeriod.totalClaimedExact
        ),
        denominationAssetDecimals
      );
      period.save();
    }
  }

  const totalYield = calculateTotalYield(periods);
  setBigNumber(
    fixedYieldSchedule,
    "totalYield",
    totalYield,
    denominationAssetDecimals
  );
  const totalUnclaimedYield = calculateTotalUnclaimedYield(periods);
  setBigNumber(
    fixedYieldSchedule,
    "totalUnclaimedYield",
    totalUnclaimedYield,
    denominationAssetDecimals
  );
  fixedYieldSchedule.save();

  return fixedYieldSchedule;
}

export function calculateTotalYield(
  periods: TokenFixedYieldSchedulePeriod[]
): BigInt {
  let totalYield = BigInt.zero();
  for (let i = 0; i < periods.length; i++) {
    const period = periods[i];
    totalYield = totalYield.plus(period.totalYieldExact);
  }
  return totalYield;
}

export function calculateTotalUnclaimedYield(
  periods: TokenFixedYieldSchedulePeriod[]
): BigInt {
  let totalUnclaimedYield = BigInt.zero();
  for (let i = 0; i < periods.length; i++) {
    const period = periods[i];
    totalUnclaimedYield = totalUnclaimedYield.plus(
      period.totalYieldExact.minus(period.totalClaimedExact)
    );
  }
  return totalUnclaimedYield;
}
