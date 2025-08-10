import { Address, Bytes } from "@graphprotocol/graph-ts";
import { SystemAccessManager } from "../../../generated/schema";
import { fetchAccessControl } from "../../access-control/fetch/accesscontrol";
import { setAccountContractName } from "../../account/utils/account-contract-name";

export function fetchSystemAccessManager(
  address: Address
): SystemAccessManager {
  let systemAccessManager = SystemAccessManager.load(address);

  if (!systemAccessManager) {
    systemAccessManager = new SystemAccessManager(address);
    systemAccessManager.deployedInTransaction = Bytes.empty();
    systemAccessManager.accessControl = fetchAccessControl(address).id;
    setAccountContractName(address, "System Access Manager");
  }

  return systemAccessManager;
}
