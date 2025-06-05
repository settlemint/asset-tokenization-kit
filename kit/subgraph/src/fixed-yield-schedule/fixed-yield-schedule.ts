import { Address, BigInt } from "@graphprotocol/graph-ts";
import {
  FixedYieldScheduleSet,
  UnderlyingAssetTopUp,
  UnderlyingAssetWithdrawn,
  YieldClaimed,
} from "../../generated/templates/FixedYieldSchedule/FixedYieldSchedule";
import { fetchEvent } from "../event/fetch/event";
import { fetchToken } from "../token/fetch/token";
import { setBigNumber } from "../utils/bignumber";
import { fetchFixedYieldSchedule } from "./fetch/fixed-yield-schedule";
import { fetchFixedYieldSchedulePeriod } from "./fetch/fixed-yield-schedule-period";
import { getPeriodId } from "./utils/fixed-yield-schedule-utils";

export function handleFixedYieldScheduleSet(
  event: FixedYieldScheduleSet
): void {
  fetchEvent(event, "FixedYieldScheduleSet");
  const fixedYieldSchedule = fetchFixedYieldSchedule(event.address);
  const token = fetchToken(Address.fromBytes(fixedYieldSchedule.token));
  fixedYieldSchedule.underlyingAsset = event.params.underlyingAsset;
  fixedYieldSchedule.startDate = event.params.startDate;
  fixedYieldSchedule.endDate = event.params.endDate;
  fixedYieldSchedule.rate = event.params.rate;
  fixedYieldSchedule.interval = event.params.interval;
  setBigNumber(
    fixedYieldSchedule,
    "totalClaimed",
    BigInt.zero(),
    token.decimals
  );
  setBigNumber(
    fixedYieldSchedule,
    "totalUnclaimedYield",
    BigInt.zero(),
    token.decimals
  );
  setBigNumber(
    fixedYieldSchedule,
    "totalYield",
    event.params.yieldForNextPeriod,
    token.decimals
  );
  for (let i = 1; i <= event.params.periodEndTimestamps.length; i++) {
    const period = fetchFixedYieldSchedulePeriod(getPeriodId(event.address, i));
    period.schedule = fixedYieldSchedule.id;
    period.startDate =
      i == 0 ? event.params.startDate : event.params.periodEndTimestamps[i - 1];
    period.endDate = event.params.periodEndTimestamps[i];
    setBigNumber(period, "claimed", BigInt.zero(), token.decimals);
    setBigNumber(
      period,
      "yield",
      i == 0 ? event.params.yieldForNextPeriod : BigInt.zero(),
      token.decimals
    );
    setBigNumber(period, "unclaimedYield", BigInt.zero(), token.decimals);
    period.save();
  }
  fixedYieldSchedule.save();
}

export function handleUnderlyingAssetTopUp(event: UnderlyingAssetTopUp): void {
  fetchEvent(event, "UnderlyingAssetTopUp");
  // The transfer/burn/mint event handler of the token will update the balance
}

export function handleUnderlyingAssetWithdrawn(
  event: UnderlyingAssetWithdrawn
): void {
  fetchEvent(event, "UnderlyingAssetWithdrawn");
  // The transfer/burn/mint event handler of the token will update the balance
}

export function handleYieldClaimed(event: YieldClaimed): void {
  fetchEvent(event, "YieldClaimed");
  const fixedYieldSchedule = fetchFixedYieldSchedule(event.address);
  const token = fetchToken(Address.fromBytes(fixedYieldSchedule.token));

  for (
    let i = event.params.fromPeriod.toI32();
    i <= event.params.toPeriod.toI32();
    i++
  ) {
    const period = fetchFixedYieldSchedulePeriod(getPeriodId(event.address, i));
    setBigNumber(
      period,
      "totalClaimed",
      event.params.periodAmounts[i - event.params.fromPeriod.toI32()],
      token.decimals
    );
    setBigNumber(
      period,
      "totalYield",
      event.params.periodAmounts[i - event.params.fromPeriod.toI32()],
      token.decimals
    );
    setBigNumber(period, "totalUnclaimedYield", BigInt.zero(), token.decimals);
    period.save();
  }
  const nextPeriod = fetchFixedYieldSchedulePeriod(
    getPeriodId(event.address, event.params.toPeriod.toI32() + 1)
  );
  setBigNumber(
    nextPeriod,
    "yield",
    event.params.yieldForNextPeriod,
    token.decimals
  );
  nextPeriod.save();

  const totalClaimed = fixedYieldSchedule.totalClaimedExact.plus(
    event.params.claimedAmount
  );
  const totalYield = totalClaimed.plus(event.params.totalUnclaimedYield);
  setBigNumber(
    fixedYieldSchedule,
    "totalClaimed",
    totalClaimed,
    token.decimals
  );
  setBigNumber(
    fixedYieldSchedule,
    "totalUnclaimedYield",
    event.params.totalUnclaimedYield,
    token.decimals
  );
  setBigNumber(fixedYieldSchedule, "totalYield", totalYield, token.decimals);
  fixedYieldSchedule.save();
}
