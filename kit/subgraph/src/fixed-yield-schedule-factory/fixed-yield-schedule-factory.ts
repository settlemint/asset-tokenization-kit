import { SMARTFixedYieldScheduleCreated } from "../../generated/templates/FixedYieldScheduleFactory/FixedYieldScheduleFactory";
import { fetchEvent } from "../event/fetch/event";

export function handleSMARTFixedYieldScheduleCreated(
  event: SMARTFixedYieldScheduleCreated
): void {
  fetchEvent(event, "FixedYieldScheduleCreated");
}
