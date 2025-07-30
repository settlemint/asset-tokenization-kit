import { Address, Bytes } from "@graphprotocol/graph-ts";
import { ComplianceModule } from "../../../generated/schema";
import { fetchAccessControl } from "../../access-control/fetch/accesscontrol";
import { fetchAccount } from "../../account/fetch/account";

export function fetchComplianceModule(address: Address): ComplianceModule {
  let complianceModule = ComplianceModule.load(address);

  if (!complianceModule) {
    complianceModule = new ComplianceModule(address);
    complianceModule.accessControl = fetchAccessControl(address).id;
    complianceModule.account = fetchAccount(address).id;
    complianceModule.name = "unknown";
    complianceModule.typeId = "unknown";
    complianceModule.deployedInTransaction = Bytes.empty();
    complianceModule.save();
  }

  return complianceModule;
}
