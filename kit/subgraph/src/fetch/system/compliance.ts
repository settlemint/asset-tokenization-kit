import { Address } from "@graphprotocol/graph-ts";
import { System_Compliance } from "../../../generated/schema";
import { Compliance } from "../../../generated/templates/Compliance/Compliance";
import { fetchAccessControl } from "../accesscontrol";
import { fetchAccount } from "../account";

export function fetchCompliance(address: Address): System_Compliance {
  let compliance = System_Compliance.load(address);

  if (!compliance) {
    compliance = new System_Compliance(address);

    const account = fetchAccount(address);
    compliance.account = account.id;

    const accessControl = fetchAccessControl(address, Compliance.bind(address));
    compliance.accessControl = accessControl.id;

    compliance.save();
  }

  return compliance;
}
