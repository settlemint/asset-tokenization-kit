import { Address, Bytes } from "@graphprotocol/graph-ts";
import { SystemAddonRegistry } from "../../../generated/schema";
import { SystemAddonRegistry as SystemAddonRegistryTemplate } from "../../../generated/templates";
import { fetchAccount } from "../../account/fetch/account";
import { setAccountContractName } from "../../account/utils/account-contract-name";

export function fetchSystemAddonRegistry(
  address: Address
): SystemAddonRegistry {
  let systemAddonRegistry = SystemAddonRegistry.load(address);

  if (!systemAddonRegistry) {
    systemAddonRegistry = new SystemAddonRegistry(address);
    systemAddonRegistry.account = fetchAccount(address).id;
    systemAddonRegistry.deployedInTransaction = Bytes.empty();
    systemAddonRegistry.save();
    SystemAddonRegistryTemplate.create(address);
    setAccountContractName(address, "System Addon Registry");
  }

  return systemAddonRegistry;
}
