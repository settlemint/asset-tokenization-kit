import { Address } from "@graphprotocol/graph-ts";
import { System_Compliance } from "../../generated/schema";
import { Compliance as ComplianceTemplate } from "../../generated/templates";
import { fetchAccount } from "../shared/account/fetch-account";
export function fetchCompliance(address: Address): System_Compliance {
  let compliance = System_Compliance.load(address);

  if (!compliance) {
    compliance = new System_Compliance(address);
    compliance.account = fetchAccount(address).id;
    compliance.save();
    ComplianceTemplate.create(address);
  }

  return compliance;
}
