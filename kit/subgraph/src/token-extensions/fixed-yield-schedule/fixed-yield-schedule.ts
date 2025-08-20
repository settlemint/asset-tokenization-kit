import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { TokenFixedYieldSchedulePeriod } from "../../../generated/schema";
import {
  DenominationAssetTopUp,
  DenominationAssetWithdrawn,
  FixedYieldScheduleSet,
  YieldClaimed,
} from "../../../generated/templates/FixedYieldSchedule/FixedYieldSchedule";
import { fetchEvent } from "../../event/fetch/event";
import { setBigNumber } from "../../utils/bignumber";
import { getTokenDecimals } from "../../utils/token-decimals";
import { fetchFixedYieldSchedule } from "./fetch/fixed-yield-schedule";
import { fetchFixedYieldSchedulePeriod } from "./fetch/fixed-yield-schedule-period";
import {
  calculateTotalYield,
  getPeriodId,
} from "./utils/fixed-yield-schedule-utils";

export function handleFixedYieldScheduleSet(
  event: FixedYieldScheduleSet
): void {
  fetchEvent(event, "FixedYieldScheduleSet");
  const fixedYieldSchedule = fetchFixedYieldSchedule(event.address);
  if (fixedYieldSchedule.deployedInTransaction.equals(Bytes.empty())) {
    fixedYieldSchedule.deployedInTransaction = event.transaction.hash;
  }
  const tokenAddress = Address.fromBytes(fixedYieldSchedule.token);
  const tokenDecimals = getTokenDecimals(tokenAddress);
  fixedYieldSchedule.startDate = event.params.startDate;
  fixedYieldSchedule.endDate = event.params.endDate;
  fixedYieldSchedule.rate = event.params.rate;
  fixedYieldSchedule.interval = event.params.interval;
  fixedYieldSchedule.createdAt = event.block.timestamp;
  fixedYieldSchedule.createdBy = event.transaction.from;
  setBigNumber(
    fixedYieldSchedule,
    "totalClaimed",
    BigInt.zero(),
    tokenDecimals
  );
  setBigNumber(
    fixedYieldSchedule,
    "totalUnclaimedYield",
    BigInt.zero(),
    tokenDecimals
  );
  setBigNumber(
    fixedYieldSchedule,
    "totalYield",
    event.params.yieldForNextPeriod,
    tokenDecimals
  );
  fixedYieldSchedule.denominationAsset = event.params.denominationAsset;
  for (let i = 1; i <= event.params.periodEndTimestamps.length; i++) {
    const period = fetchFixedYieldSchedulePeriod(getPeriodId(event.address, i));
    if (period.deployedInTransaction.equals(Bytes.empty())) {
      period.deployedInTransaction = event.transaction.hash;
    }
    period.schedule = fixedYieldSchedule.id;
    const isFirstPeriod = i == 1;
    period.startDate = isFirstPeriod
      ? event.params.startDate
      : event.params.periodEndTimestamps[i - 1];
    period.endDate = event.params.periodEndTimestamps[i - 1];
    setBigNumber(period, "totalClaimed", BigInt.zero(), tokenDecimals);
    setBigNumber(
      period,
      "totalYield",
      isFirstPeriod ? event.params.yieldForNextPeriod : BigInt.zero(),
      tokenDecimals
    );
    setBigNumber(period, "totalUnclaimedYield", BigInt.zero(), tokenDecimals);
    period.save();
    if (isFirstPeriod) {
      fixedYieldSchedule.nextPeriod = period.id;
    }
  }
  fixedYieldSchedule.save();
}

export function handleDenominationAssetTopUp(
  event: DenominationAssetTopUp
): void {
  fetchEvent(event, "DenominationAssetTopUp");
}

export function handleDenominationAssetWithdrawn(
  event: DenominationAssetWithdrawn
): void {
  fetchEvent(event, "DenominationAssetWithdrawn");
}

export function handleYieldClaimed(event: YieldClaimed): void {
  fetchEvent(event, "YieldClaimed");
  const fixedYieldSchedule = fetchFixedYieldSchedule(event.address);
  const tokenAddress = Address.fromBytes(fixedYieldSchedule.token);
  const tokenDecimals = getTokenDecimals(tokenAddress);
  for (
    let i = event.params.fromPeriod.toI32();
    i <= event.params.toPeriod.toI32();
    i++
  ) {
    const period = fetchFixedYieldSchedulePeriod(getPeriodId(event.address, i));
    const claimedForPeriod =
      event.params.periodAmounts[i - event.params.fromPeriod.toI32()];
    const totalYieldForPeriod =
      event.params.periodYields[i - event.params.fromPeriod.toI32()];
    const totalClaimedForPeriod =
      period.totalClaimedExact.plus(claimedForPeriod);
    const totalUnclaimedYieldForPeriod = totalYieldForPeriod.minus(
      totalClaimedForPeriod
    );
    setBigNumber(period, "totalClaimed", totalClaimedForPeriod, tokenDecimals);
    setBigNumber(period, "totalYield", totalYieldForPeriod, tokenDecimals);
    setBigNumber(
      period,
      "totalUnclaimedYield",
      totalUnclaimedYieldForPeriod,
      tokenDecimals
    );
    period.save();
  }

  const currentPeriod = fetchFixedYieldSchedulePeriod(
    getPeriodId(event.address, event.params.toPeriod.toI32())
  );
  fixedYieldSchedule.currentPeriod = currentPeriod.id;

  const nextPeriodId = getPeriodId(
    event.address,
    event.params.toPeriod.toI32() + 1
  );
  const nextPeriod = TokenFixedYieldSchedulePeriod.load(nextPeriodId);
  if (nextPeriod) {
    setBigNumber(
      nextPeriod,
      "totalYield",
      event.params.yieldForNextPeriod,
      tokenDecimals
    );
    nextPeriod.save();
    fixedYieldSchedule.nextPeriod = nextPeriod.id;
  } else {
    // There is no next period, the schedule has ended
    fixedYieldSchedule.nextPeriod = null;
    fixedYieldSchedule.save();
  }

  const totalClaimed = fixedYieldSchedule.totalClaimedExact.plus(
    event.params.claimedAmount
  );
  const totalYield = calculateTotalYield(fixedYieldSchedule);
  setBigNumber(fixedYieldSchedule, "totalClaimed", totalClaimed, tokenDecimals);
  setBigNumber(
    fixedYieldSchedule,
    "totalUnclaimedYield",
    event.params.totalUnclaimedYield,
    tokenDecimals
  );
  setBigNumber(fixedYieldSchedule, "totalYield", totalYield, tokenDecimals);
  fixedYieldSchedule.save();
}
