import { SMARTFixedYieldScheduleCreated } from "../../generated/FixedYieldScheduleFactory/FixedYieldScheduleFactory";
import { fetchEvent } from "../event/fetch/event";
import { fetchFixedYieldSchedule } from "../fixed-yield-schedule/fetch/fixed-yield-schedule";

export function handleATKFixedYieldScheduleCreated(
  event: SMARTFixedYieldScheduleCreated
): void {
  fetchEvent(event, "FixedYieldScheduleCreated");
  fetchFixedYieldSchedule(event.params.schedule);
}
