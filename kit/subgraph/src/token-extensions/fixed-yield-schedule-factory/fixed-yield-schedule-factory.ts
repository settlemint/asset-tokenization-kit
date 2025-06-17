import { Bytes } from "@graphprotocol/graph-ts";
import { ATKFixedYieldScheduleCreated } from "../../../generated/templates/FixedYieldScheduleFactory/FixedYieldScheduleFactory";
import { fetchAccount } from "../../account/fetch/account";
import { fetchEvent } from "../../event/fetch/event";
import { fetchFixedYieldSchedule } from "../fixed-yield-schedule/fetch/fixed-yield-schedule";

export function handleATKFixedYieldScheduleCreated(
  event: ATKFixedYieldScheduleCreated
): void {
  fetchEvent(event, "FixedYieldScheduleCreated");
  const fixedYieldSchedule = fetchFixedYieldSchedule(event.params.schedule);
  if (fixedYieldSchedule.deployedInTransaction.equals(Bytes.empty())) {
    fixedYieldSchedule.deployedInTransaction = event.transaction.hash;
  }
  fixedYieldSchedule.createdAt = event.block.timestamp;
  fixedYieldSchedule.createdBy = fetchAccount(event.transaction.from).id;
  fixedYieldSchedule.save();
}
