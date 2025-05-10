import { Address } from "@graphprotocol/graph-ts";
import { System_Compliance } from "../../../generated/schema";
import { fetchAccount } from "../account";

export function fetchCompliance(address: Address): System_Compliance {
  let compliance = System_Compliance.load(address);

  if (!compliance) {
    compliance = new System_Compliance(address);

    const account = fetchAccount(address);
    compliance.asAccount = account.id;

    compliance.save();
  }

  return compliance;
}
