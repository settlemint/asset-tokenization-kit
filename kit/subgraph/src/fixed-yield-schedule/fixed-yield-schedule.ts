import { Address, BigInt } from "@graphprotocol/graph-ts";
import {
  FixedYieldScheduleSet,
  UnderlyingAssetTopUp,
  UnderlyingAssetWithdrawn,
  YieldClaimed,
} from "../../generated/templates/FixedYieldSchedule/FixedYieldSchedule";
import { fetchAccount } from "../account/fetch/account";
import { DEFAULT_TOKEN_DECIMALS } from "../config/token";
import { fetchEvent } from "../event/fetch/event";
import { fetchTokenBalance } from "../token-balance/fetch/token-balance";
import { fetchToken } from "../token/fetch/token";
import { setBigNumber } from "../utils/bignumber";
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
  const tokenAddress = Address.fromBytes(fixedYieldSchedule.token);
  const tokenDecimals = getTokenDecimals(tokenAddress);
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
  fixedYieldSchedule.underlyingAsset = event.params.underlyingAsset;
  const underlyingAsset = fetchToken(event.params.underlyingAsset);
  const underlyingAssetBalance = fetchTokenBalance(
    underlyingAsset,
    fetchAccount(event.address)
  );
  setBigNumber(
    fixedYieldSchedule,
    "underlyingAssetBalanceAvailable",
    underlyingAssetBalance.availableExact,
    underlyingAsset.decimals
  );
  for (let i = 1; i <= event.params.periodEndTimestamps.length; i++) {
    const period = fetchFixedYieldSchedulePeriod(getPeriodId(event.address, i));
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

export function handleUnderlyingAssetTopUp(event: UnderlyingAssetTopUp): void {
  fetchEvent(event, "UnderlyingAssetTopUp");
  const fixedYieldSchedule = fetchFixedYieldSchedule(event.address);
  const underlyingAsset = fetchToken(
    Address.fromBytes(fixedYieldSchedule.underlyingAsset)
  );
  const tokenBalance = fetchTokenBalance(
    underlyingAsset,
    fetchAccount(event.address)
  );
  setBigNumber(
    fixedYieldSchedule,
    "underlyingAssetBalanceAvailable",
    tokenBalance.availableExact,
    underlyingAsset.decimals
  );
  fixedYieldSchedule.save();
}

export function handleUnderlyingAssetWithdrawn(
  event: UnderlyingAssetWithdrawn
): void {
  fetchEvent(event, "UnderlyingAssetWithdrawn");
  const fixedYieldSchedule = fetchFixedYieldSchedule(event.address);
  const underlyingAsset = fetchToken(
    Address.fromBytes(fixedYieldSchedule.underlyingAsset)
  );
  const tokenBalance = fetchTokenBalance(
    underlyingAsset,
    fetchAccount(event.address)
  );
  setBigNumber(
    fixedYieldSchedule,
    "underlyingAssetBalanceAvailable",
    tokenBalance.availableExact,
    underlyingAsset.decimals
  );
  fixedYieldSchedule.save();
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
  fixedYieldSchedule.nextPeriod = nextPeriod.id;

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

function getTokenDecimals(tokenAddress: Address): i32 {
  return tokenAddress.equals(Address.zero())
    ? DEFAULT_TOKEN_DECIMALS
    : fetchToken(tokenAddress).decimals;
}
