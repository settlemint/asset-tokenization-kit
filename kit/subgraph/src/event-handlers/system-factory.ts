import { SMARTSystemCreated } from "../../generated/SystemFactory/SystemFactory";
import { fetchSystem } from "../fetch/system";
import { processEvent } from "../shared/event/event";

export function handleSMARTSystemCreated(event: SMARTSystemCreated): void {
  processEvent(event, "SystemCreated");
  fetchSystem(event.params.systemAddress);
}
