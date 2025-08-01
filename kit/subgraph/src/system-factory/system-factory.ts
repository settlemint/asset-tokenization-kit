import { Bytes } from "@graphprotocol/graph-ts";
import { ATKSystemCreated } from "../../generated/SystemFactory/SystemFactory";
import { fetchEvent } from "../event/fetch/event";
import { fetchSystem } from "../system/fetch/system";
import { fetchSystemAccessManager } from "../system/fetch/system-access-manager";

export function handleATKSystemCreated(event: ATKSystemCreated): void {
  fetchEvent(event, "SystemCreated");
  const system = fetchSystem(event.params.systemAddress);
  if (system.deployedInTransaction.equals(Bytes.empty())) {
    system.deployedInTransaction = event.transaction.hash;
  }

  const systemAccessManager = fetchSystemAccessManager(
    event.params.accessManager
  );
  if (systemAccessManager.deployedInTransaction.equals(Bytes.empty())) {
    systemAccessManager.deployedInTransaction = event.transaction.hash;
  }
  systemAccessManager.system = system.id;
  systemAccessManager.save();

  system.save();
}
