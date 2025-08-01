import { Address, Bytes } from "@graphprotocol/graph-ts";
import { ComplianceModule } from "../../../generated/schema";
import { fetchAccount } from "../../account/fetch/account";

export function fetchComplianceModule(address: Address): ComplianceModule {
  let complianceModule = ComplianceModule.load(address);

  if (!complianceModule) {
    complianceModule = new ComplianceModule(address);
    complianceModule.account = fetchAccount(address).id;
    complianceModule.name = "unknown";
    complianceModule.typeId = "unknown";
    complianceModule.deployedInTransaction = Bytes.empty();
    complianceModule.save();
  }

  return complianceModule;
}
