import { Address } from "@graphprotocol/graph-ts";
import { Compliance } from "../../../generated/schema";
import { fetchAccount } from "../../account/fetch/account";

export function fetchCompliance(address: Address): Compliance {
  let compliance = Compliance.load(address);

  if (!compliance) {
    compliance = new Compliance(address);
    compliance.account = fetchAccount(address).id;
    compliance.save();
  }

  return compliance;
}
