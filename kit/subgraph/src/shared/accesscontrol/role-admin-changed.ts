import { ethereum } from "@graphprotocol/graph-ts";
import { processEvent } from "../event";

export function roleAdminChangedHandler(event: ethereum.Event): void {
  processEvent(event, "RoleAdminChanged");
}
