import { Address, Bytes } from "@graphprotocol/graph-ts";
import { SystemAddon } from "../../../generated/schema";
import { fetchAccessControl } from "../../access-control/fetch/accesscontrol";
import { fetchAccount } from "../../account/fetch/account";

export function fetchSystemAddon(address: Address): SystemAddon {
  let systemAddon = SystemAddon.load(address);

  if (!systemAddon) {
    systemAddon = new SystemAddon(address);
    systemAddon.accessControl = fetchAccessControl(address).id;
    systemAddon.account = fetchAccount(address).id;
    systemAddon.name = "unknown";
    systemAddon.typeId = "unknown";
    systemAddon.deployedInTransaction = Bytes.empty();
    systemAddon.systemAddonRegistry = Address.zero();
    systemAddon.save();
    // FixedYieldScheduleFactoryTemplate.create(address);
  }

  return systemAddon;
}
