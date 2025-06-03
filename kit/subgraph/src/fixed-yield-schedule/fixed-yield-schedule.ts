import {
  FixedYieldScheduleSet,
  UnderlyingAssetTopUp,
  UnderlyingAssetWithdrawn,
  YieldClaimed,
} from "../../generated/templates/FixedYieldSchedule/FixedYieldSchedule";
import { fetchEvent } from "../event/fetch/event";

export function handleFixedYieldScheduleSet(
  event: FixedYieldScheduleSet
): void {
  fetchEvent(event, "FixedYieldScheduleSet");
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
