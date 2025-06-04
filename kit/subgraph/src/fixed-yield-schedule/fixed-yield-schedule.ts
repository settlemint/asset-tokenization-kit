import { BigInt, Bytes } from "@graphprotocol/graph-ts";
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

export function handleFixedYieldScheduleSet(
  event: FixedYieldScheduleSet
): void {
  fetchEvent(event, "FixedYieldScheduleSet");
  const fixedYieldSchedule = fetchFixedYieldSchedule(event.address);
  const token = fetchToken(fixedYieldSchedule.underlyingAsset);
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
  for (let i = 0; i < event.params.periodEndTimestamps.length; i++) {
    const period = fetchFixedYieldSchedulePeriod(
      event.address.concat(Bytes.fromUTF8(`-period-${i}`))
    );
    period.schedule = fixedYieldSchedule.id;
    period.startDate =
      i == 0 ? event.params.startDate : event.params.periodEndTimestamps[i - 1];
    period.endDate = event.params.periodEndTimestamps[i];
    setBigNumber(period, "totalClaimed", BigInt.zero(), token.decimals);
    setBigNumber(period, "totalYield", BigInt.zero(), token.decimals);
    period.save();
  }
  fixedYieldSchedule.save();
}

export function handleUnderlyingAssetTopUp(event: UnderlyingAssetTopUp): void {
  fetchEvent(event, "UnderlyingAssetTopUp");
}

export function handleUnderlyingAssetWithdrawn(
  event: UnderlyingAssetWithdrawn
): void {
  fetchEvent(event, "UnderlyingAssetTopUp");
}

export function handleYieldClaimed(event: YieldClaimed): void {
  fetchEvent(event, "YieldClaimed");
}
