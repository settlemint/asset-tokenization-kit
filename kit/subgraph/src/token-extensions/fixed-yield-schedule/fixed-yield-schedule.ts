import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { TokenFixedYieldSchedulePeriod } from "../../../generated/schema";
import {
  DenominationAssetTopUp,
  DenominationAssetWithdrawn,
  FixedYieldScheduleSet,
  YieldClaimed,
} from "../../../generated/templates/FixedYieldSchedule/FixedYieldSchedule";
import { fetchAccount } from "../../account/fetch/account";
import {
  actionExecuted,
  ActionName,
  createActionIdentifier,
} from "../../actions/actions";
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
  fixedYieldSchedule.denominationAsset = event.params.denominationAsset;
  const denominationAssetDecimals = getTokenDecimals(
    event.params.denominationAsset
  );
  fixedYieldSchedule.startDate = event.params.startDate;
  fixedYieldSchedule.endDate = event.params.endDate;
  fixedYieldSchedule.rate = event.params.rate;
  fixedYieldSchedule.interval = event.params.interval;
  fixedYieldSchedule.createdAt = event.block.timestamp;
  fixedYieldSchedule.createdBy = fetchAccount(event.transaction.from).id;
  setBigNumber(
    fixedYieldSchedule,
    "totalClaimed",
    BigInt.zero(),
    denominationAssetDecimals
  );
  setBigNumber(
    fixedYieldSchedule,
    "totalUnclaimedYield",
    BigInt.zero(),
    denominationAssetDecimals
  );
  setBigNumber(
    fixedYieldSchedule,
    "totalYield",
    event.params.yieldForNextPeriod,
    denominationAssetDecimals
  );

  for (let i = 1; i <= event.params.periodEndTimestamps.length; i++) {
    const period = fetchFixedYieldSchedulePeriod(getPeriodId(event.address, i));
    if (period.deployedInTransaction.equals(Bytes.empty())) {
      period.deployedInTransaction = event.transaction.hash;
    }
    period.schedule = fixedYieldSchedule.id;
    const isFirstPeriod = i == 1;
    period.startDate = isFirstPeriod
      ? event.params.startDate
      : event.params.periodEndTimestamps[i - 2];
    period.endDate = event.params.periodEndTimestamps[i - 1];
    setBigNumber(
      period,
      "totalClaimed",
      BigInt.zero(),
      denominationAssetDecimals
    );
    setBigNumber(
      period,
      "totalYield",
      isFirstPeriod ? event.params.yieldForNextPeriod : BigInt.zero(),
      denominationAssetDecimals
    );
    setBigNumber(
      period,
      "totalUnclaimedYield",
      BigInt.zero(),
      denominationAssetDecimals
    );
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
  const denominationAssetAddress = Address.fromBytes(
    fixedYieldSchedule.denominationAsset
  );
  const denominationAssetDecimals = getTokenDecimals(denominationAssetAddress);
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
    setBigNumber(
      period,
      "totalClaimed",
      totalClaimedForPeriod,
      denominationAssetDecimals
    );
    setBigNumber(
      period,
      "totalYield",
      totalYieldForPeriod,
      denominationAssetDecimals
    );
    setBigNumber(
      period,
      "totalUnclaimedYield",
      totalUnclaimedYieldForPeriod,
      denominationAssetDecimals
    );
    period.save();

    actionExecuted(
      event,
      ActionName.ClaimYield,
      event.address,
      createActionIdentifier(ActionName.ClaimYield, [
        event.address,
        event.params.holder,
        period.id,
      ])
    );
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
      denominationAssetDecimals
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
  setBigNumber(
    fixedYieldSchedule,
    "totalClaimed",
    totalClaimed,
    denominationAssetDecimals
  );
  setBigNumber(
    fixedYieldSchedule,
    "totalUnclaimedYield",
    event.params.totalUnclaimedYield,
    denominationAssetDecimals
  );
  setBigNumber(
    fixedYieldSchedule,
    "totalYield",
    totalYield,
    denominationAssetDecimals
  );
  fixedYieldSchedule.save();
}
