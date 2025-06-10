import { ATKSystemCreated } from "../../generated/SystemFactory/SystemFactory";
import { fetchEvent } from "../event/fetch/event";
import { fetchSystem } from "../system/fetch/system";

export function handleATKSystemCreated(event: ATKSystemCreated): void {
  fetchEvent(event, "SystemCreated");
  fetchSystem(event.params.systemAddress);
}
