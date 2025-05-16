import { ExecutedForwardRequest } from "../../generated/Forwarder/Forwarder";
import { processEvent } from "../shared/event";

export function handleExecutedForwardRequest(
  event: ExecutedForwardRequest
): void {
  processEvent(event, "ExecutedForwardRequest");
}
