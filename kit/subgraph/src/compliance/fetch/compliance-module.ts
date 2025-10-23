import { Address, Bytes } from "@graphprotocol/graph-ts";
import { ComplianceModule } from "../../../generated/schema";
import { fetchAccount } from "../../account/fetch/account";
import { setAccountContractName } from "../../account/utils/account-contract-name";

export function fetchComplianceModule(
  systemAddress: Address,
  complianceModuleAddress: Address
): ComplianceModule {
  const id = systemAddress.concat(complianceModuleAddress);
  let complianceModule = ComplianceModule.load(id);

  if (!complianceModule) {
    complianceModule = new ComplianceModule(id);
    complianceModule.address = complianceModuleAddress;
    complianceModule.account = fetchAccount(complianceModuleAddress).id;
    complianceModule.name = "unknown";
    complianceModule.typeId = "unknown";
    complianceModule.deployedInTransaction = Bytes.empty();
    complianceModule.complianceModuleRegistry = Address.zero();
    complianceModule.save();
    setAccountContractName(complianceModuleAddress, "Compliance Module");
  }

  return complianceModule;
}
