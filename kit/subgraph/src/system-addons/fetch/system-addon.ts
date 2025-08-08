import { Address, Bytes } from "@graphprotocol/graph-ts";
import { SystemAddon } from "../../../generated/schema";
import { fetchAccount } from "../../account/fetch/account";

export function fetchSystemAddon(address: Address): SystemAddon {
  let systemAddon = SystemAddon.load(address);

  if (!systemAddon) {
    systemAddon = new SystemAddon(address);
    systemAddon.account = fetchAccount(address).id;
    systemAddon.name = "unknown";
    systemAddon.typeId = "unknown";
    systemAddon.deployedInTransaction = Bytes.empty();
    systemAddon.systemAddonRegistry = Address.zero();
    systemAddon.save();
  }

  return systemAddon;
}
