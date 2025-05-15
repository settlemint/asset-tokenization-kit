import { BigInt } from "@graphprotocol/graph-ts";
import { Bond } from "../../generated/schema";
import {
  UnderlyingAssetTopUp as UnderlyingAssetTopUpEvent,
  UnderlyingAssetWithdrawn as UnderlyingAssetWithdrawnEvent,
  YieldClaimed as YieldClaimedEvent,
} from "../../generated/templates/FixedYield/FixedYield";
import { createActivityLogEntry, EventType } from "../utils/activity-log";
import { setValueWithDecimals } from "../utils/decimals";
import { fetchFixedYield, fetchFixedYieldPeriod } from "./fetch/fixed-yield";

export function handleYieldClaimed(event: YieldClaimedEvent): void {
  const schedule = fetchFixedYield(event.address);
  const token = Bond.load(schedule.token);
  if (!token) {
    return;
  }

  createActivityLogEntry(
    event,
    EventType.YieldClaimed,
    event.transaction.from, // not perfect but the event does not have an ERC2771 sender parameter
    [event.params.holder]
  );

  setValueWithDecimals(
    schedule,
    "totalClaimed",
    event.params.totalAmount,
    token.decimals
  );

  setValueWithDecimals(
    schedule,
    "underlyingBalance",
    event.params.totalAmount,
    schedule.underlyingAssetDecimals
  );

  schedule.save();

  for (let i = 0; i < event.params.periodAmounts.length; i++) {
    const periodNumber = event.params.fromPeriod.plus(BigInt.fromI32(i));
    const period = fetchFixedYieldPeriod(schedule, periodNumber);

    // Update total claimed for the period if amount > 0
    const claimedAmount = event.params.periodAmounts[i];
    if (claimedAmount.gt(BigInt.zero())) {
      setValueWithDecimals(
        period,
        "totalClaimed",
        claimedAmount,
        schedule.underlyingAssetDecimals
      );

      period.save();
    }
  }
}

export function handleUnderlyingAssetTopUp(
  event: UnderlyingAssetTopUpEvent
): void {
  const schedule = fetchFixedYield(event.address);
  createActivityLogEntry(
    event,
    EventType.UnderlyingAssetTopUp,
    event.params.from, // not perfect but the event does not have an ERC2771 sender parameter
    [event.params.from]
  );
  setValueWithDecimals(
    schedule,
    "underlyingBalance",
    event.params.amount,
    schedule.underlyingAssetDecimals
  );

  schedule.save();
}

export function handleUnderlyingAssetWithdrawn(
  event: UnderlyingAssetWithdrawnEvent
): void {
  const schedule = fetchFixedYield(event.address);
  createActivityLogEntry(
    event,
    EventType.UnderlyingAssetWithdrawn,
    event.params.to, // not perfect but the event does not have an ERC2771 sender parameter
    [event.params.to]
  );
  setValueWithDecimals(
    schedule,
    "underlyingBalance",
    event.params.amount,
    schedule.underlyingAssetDecimals
  );

  schedule.save();
}
