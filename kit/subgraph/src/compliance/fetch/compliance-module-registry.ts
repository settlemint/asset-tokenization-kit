import { Address, Bytes } from "@graphprotocol/graph-ts";
import { ComplianceModuleRegistry } from "../../../generated/schema";
import { ComplianceModuleRegistry as ComplianceModuleRegistryTemplate } from "../../../generated/templates";
import { fetchAccount } from "../../account/fetch/account";
import { setAccountContractName } from "../../account/utils/account-contract-name";

export function fetchComplianceModuleRegistry(
  address: Address
): ComplianceModuleRegistry {
  let complianceModuleRegistry = ComplianceModuleRegistry.load(address);

  if (!complianceModuleRegistry) {
    complianceModuleRegistry = new ComplianceModuleRegistry(address);
    complianceModuleRegistry.account = fetchAccount(address).id;
    complianceModuleRegistry.deployedInTransaction = Bytes.empty();
    complianceModuleRegistry.system = Address.zero();
    complianceModuleRegistry.save();
    ComplianceModuleRegistryTemplate.create(address);
    setAccountContractName(address, "Compliance Module Registry");
  }

  return complianceModuleRegistry;
}
