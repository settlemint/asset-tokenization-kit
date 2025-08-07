import { AccessManagerSet as AccessManagerSetEvent } from "../../generated/templates/SystemAccessManaged/SystemAccessManaged";
import { fetchEvent } from "../event/fetch/event";

export function handleAccessManagerSet(event: AccessManagerSetEvent): void {
  fetchEvent(event, "AccessManagerSet");
}
