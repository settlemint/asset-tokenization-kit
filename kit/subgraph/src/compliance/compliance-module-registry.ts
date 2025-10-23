import { Address, Bytes } from "@graphprotocol/graph-ts";
import { ComplianceModuleRegistered as ComplianceModuleRegisteredEvent } from "../../generated/templates/ComplianceModuleRegistry/ComplianceModuleRegistry";
import { fetchAccount } from "../account/fetch/account";
import { fetchEvent } from "../event/fetch/event";
import { getDecodedTypeId } from "../type-identifier/type-identifier";
import { fetchComplianceModule } from "./fetch/compliance-module";
import { fetchComplianceModuleRegistry } from "./fetch/compliance-module-registry";

export function handleComplianceModuleRegistered(
  event: ComplianceModuleRegisteredEvent
): void {
  fetchEvent(event, "ComplianceModuleRegistered");

  const registry = fetchComplianceModuleRegistry(event.address);
  const complianceModule = fetchComplianceModule(
    Address.fromBytes(registry.system),
    event.params.moduleAddress
  );
  if (complianceModule.deployedInTransaction.equals(Bytes.empty())) {
    complianceModule.deployedInTransaction = event.transaction.hash;
  }
  complianceModule.name = event.params.name;
  complianceModule.typeId = getDecodedTypeId(event.params.typeId);

  complianceModule.complianceModuleRegistry = registry.id;

  complianceModule.save();

  // Persist a human-readable name on the underlying account
  const account = fetchAccount(event.params.moduleAddress);
  if (account.isContract) {
    account.contractName = complianceModule.name;
    account.save();
  }
}
