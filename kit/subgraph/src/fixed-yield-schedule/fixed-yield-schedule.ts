import { Address, BigInt } from "@graphprotocol/graph-ts";
import {
  FixedYieldScheduleSet,
  UnderlyingAssetTopUp,
  UnderlyingAssetWithdrawn,
  YieldClaimed,
} from "../../generated/templates/FixedYieldSchedule/FixedYieldSchedule";
import { DEFAULT_TOKEN_DECIMALS } from "../config/token";
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
  const tokenAddress = Address.fromBytes(fixedYieldSchedule.token);
  const tokenDecimals =
    tokenAddress == Address.zero()
      ? DEFAULT_TOKEN_DECIMALS
      : fetchToken(tokenAddress).decimals;
  fixedYieldSchedule.underlyingAsset = event.params.underlyingAsset;
  fixedYieldSchedule.startDate = event.params.startDate;
  fixedYieldSchedule.endDate = event.params.endDate;
  fixedYieldSchedule.rate = event.params.rate;
  fixedYieldSchedule.interval = event.params.interval;
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
  for (let i = 1; i <= event.params.periodEndTimestamps.length; i++) {
    const period = fetchFixedYieldSchedulePeriod(getPeriodId(event.address, i));
    period.schedule = fixedYieldSchedule.id;
    period.startDate =
      i == 0 ? event.params.startDate : event.params.periodEndTimestamps[i - 1];
    period.endDate = event.params.periodEndTimestamps[i - 1];
    setBigNumber(period, "totalClaimed", BigInt.zero(), tokenDecimals);
    setBigNumber(
      period,
      "totalYield",
      i == 0 ? event.params.yieldForNextPeriod : BigInt.zero(),
      tokenDecimals
    );
    setBigNumber(period, "totalUnclaimedYield", BigInt.zero(), tokenDecimals);
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
  const tokenAddress = Address.fromBytes(fixedYieldSchedule.token);
  const tokenDecimals =
    tokenAddress == Address.zero()
      ? DEFAULT_TOKEN_DECIMALS
      : fetchToken(tokenAddress).decimals;

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
      tokenDecimals
    );
    setBigNumber(
      period,
      "totalYield",
      event.params.periodAmounts[i - event.params.fromPeriod.toI32()],
      tokenDecimals
    );
    setBigNumber(period, "totalUnclaimedYield", BigInt.zero(), tokenDecimals);
    period.save();
  }
  const nextPeriod = fetchFixedYieldSchedulePeriod(
    getPeriodId(event.address, event.params.toPeriod.toI32() + 1)
  );
  setBigNumber(
    nextPeriod,
    "totalYield",
    event.params.yieldForNextPeriod,
    tokenDecimals
  );
  nextPeriod.save();

  const totalClaimed = fixedYieldSchedule.totalClaimedExact.plus(
    event.params.claimedAmount
  );
  const totalYield = totalClaimed.plus(event.params.totalUnclaimedYield);
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
