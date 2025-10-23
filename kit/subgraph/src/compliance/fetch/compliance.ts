import { Address } from "@graphprotocol/graph-ts";
import { Compliance } from "../../../generated/schema";
import { Compliance as ComplianceTemplate } from "../../../generated/templates";
import { fetchAccount } from "../../account/fetch/account";
import { setAccountContractName } from "../../account/utils/account-contract-name";

export function fetchCompliance(address: Address): Compliance {
  let compliance = Compliance.load(address);

  if (!compliance) {
    compliance = new Compliance(address);
    compliance.system = Address.zero();
    compliance.account = fetchAccount(address).id;
    compliance.bypassList = [];
    compliance.save();
    ComplianceTemplate.create(address);
    setAccountContractName(address, "Compliance");
  }

  return compliance;
}
