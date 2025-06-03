import {
  CheckpointUpdated,
  YieldScheduleSet,
} from "../../generated/templates/Yield/Yield";
import { fetchEvent } from "../event/fetch/event";
import { fetchYield } from "./fetch/yield";

export function handleCheckpointUpdated(event: CheckpointUpdated): void {
  fetchEvent(event, "CheckpointUpdated");
}

export function handleYieldScheduleSet(event: YieldScheduleSet): void {
  fetchEvent(event, "YieldScheduleSet");
  const tokenYield = fetchYield(event.address);
  tokenYield.schedule = event.params.schedule;
  tokenYield.save();
}
