import { Bytes } from "@graphprotocol/graph-ts";
import { ATKSystemCreated } from "../../generated/SystemFactory/SystemFactory";
import { fetchAccessControl } from "../access-control/fetch/accesscontrol";
import { fetchEvent } from "../event/fetch/event";
import { fetchSystem } from "../system/fetch/system";
import { fetchSystemAccessManager } from "../system/fetch/system-access-manager";

export function handleATKSystemCreated(event: ATKSystemCreated): void {
  fetchEvent(event, "SystemCreated");
  const system = fetchSystem(event.params.systemAddress);
  if (system.deployedInTransaction.equals(Bytes.empty())) {
    system.deployedInTransaction = event.transaction.hash;
  }
  system.save();

  const systemAccessManager = fetchSystemAccessManager(
    event.params.accessManager
  );
  if (systemAccessManager.deployedInTransaction.equals(Bytes.empty())) {
    systemAccessManager.deployedInTransaction = event.transaction.hash;
  }
  systemAccessManager.system = system.id;
  systemAccessManager.save();

  const accessControl = fetchAccessControl(event.params.accessManager);
  accessControl.system = system.id;
  accessControl.save();

  system.systemAccessManager = systemAccessManager.id;
  system.save();
}
