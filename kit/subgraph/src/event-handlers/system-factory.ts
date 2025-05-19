import { SMARTSystemCreated } from "../../generated/SystemFactory/SystemFactory";
import { processEvent } from "../shared/event/event";

export function handleSMARTSystemCreated(event: SMARTSystemCreated): void {
  processEvent(event, "SystemCreated");
}
