import { Initialized } from "../../generated/templates/Compliance/Compliance";
import { processEvent } from "../shared/event/event";

export function handleInitialized(event: Initialized): void {
  processEvent(event, "Initialized");
}
