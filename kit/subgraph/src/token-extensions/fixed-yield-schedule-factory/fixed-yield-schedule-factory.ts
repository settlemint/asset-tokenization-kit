import { ATKFixedYieldScheduleCreated } from "../../../generated/templates/FixedYieldScheduleFactory/FixedYieldScheduleFactory";
import { fetchAccount } from "../../account/fetch/account";
import { fetchEvent } from "../../event/fetch/event";
import { fetchFixedYieldSchedule } from "../fixed-yield-schedule/fetch/fixed-yield-schedule";

export function handleATKFixedYieldScheduleCreated(
  event: ATKFixedYieldScheduleCreated
): void {
  fetchEvent(event, "FixedYieldScheduleCreated");
  const fixedYieldSchedule = fetchFixedYieldSchedule(event.params.schedule);
  fixedYieldSchedule.createdAt = event.block.timestamp;
  fixedYieldSchedule.createdBy = fetchAccount(event.transaction.from).id;
  fixedYieldSchedule.save();
}
