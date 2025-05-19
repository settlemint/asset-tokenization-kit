import { ethereum } from "@graphprotocol/graph-ts";
import { processEvent } from "../event/event";

export function roleAdminChangedHandler(event: ethereum.Event): void {
  processEvent(event, "RoleAdminChanged");
}
