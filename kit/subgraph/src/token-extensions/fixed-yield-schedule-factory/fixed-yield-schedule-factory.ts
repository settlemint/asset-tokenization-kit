import { ATKFixedYieldScheduleCreated } from "../../../generated/FixedYieldScheduleFactory/FixedYieldScheduleFactory";
import { fetchEvent } from "../../event/fetch/event";
import { fetchFixedYieldSchedule } from "../fixed-yield-schedule/fetch/fixed-yield-schedule";

export function handleATKFixedYieldScheduleCreated(
  event: ATKFixedYieldScheduleCreated
): void {
  fetchEvent(event, "FixedYieldScheduleCreated");
  fetchFixedYieldSchedule(event.params.schedule);
}
