import { SMARTFixedYieldScheduleCreated } from "../../generated/FixedYieldScheduleFactory/FixedYieldScheduleFactory";
import { fetchEvent } from "../event/fetch/event";
import { fetchFixedYieldSchedule } from "../fixed-yield-schedule/fetch/fixed-yield-schedule";

export function handleSMARTFixedYieldScheduleCreated(
  event: SMARTFixedYieldScheduleCreated
): void {
  fetchEvent(event, "FixedYieldScheduleCreated");
  const fixedYieldSchedule = fetchFixedYieldSchedule(event.params.schedule);
  fixedYieldSchedule.save();
}
