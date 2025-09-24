import { Address, Bytes } from "@graphprotocol/graph-ts";
import { System } from "../../../generated/schema";
import { System as SystemTemplate } from "../../../generated/templates";
import { fetchAccount } from "../../account/fetch/account";
import { setAccountContractName } from "../../account/utils/account-contract-name";

export function fetchSystem(address: Address): System {
  let system = System.load(address);

  if (!system) {
    system = new System(address);
    system.account = fetchAccount(address).id;
    system.deployedInTransaction = Bytes.empty();
    system.save();
    SystemTemplate.create(address);
    setAccountContractName(address, "System");
  }

  return system;
}
