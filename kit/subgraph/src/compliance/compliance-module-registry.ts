import { Bytes } from "@graphprotocol/graph-ts";
import { ComplianceModuleRegistered as ComplianceModuleRegisteredEvent } from "../../generated/templates/ComplianceModuleRegistry/ComplianceModuleRegistry";
import { fetchEvent } from "../event/fetch/event";
import { getDecodedTypeId } from "../type-identifier/type-identifier";
import { fetchComplianceModule } from "./fetch/compliance-module";
import { fetchComplianceModuleRegistry } from "./fetch/compliance-module-registry";

export function handleComplianceModuleRegistered(
  event: ComplianceModuleRegisteredEvent
): void {
  fetchEvent(event, "ComplianceModuleRegistered");

  const complianceModule = fetchComplianceModule(event.params.moduleAddress);
  if (complianceModule.deployedInTransaction.equals(Bytes.empty())) {
    complianceModule.deployedInTransaction = event.transaction.hash;
  }
  complianceModule.name = event.params.name;
  complianceModule.typeId = getDecodedTypeId(event.params.typeId);

  complianceModule.complianceModuleRegistry = fetchComplianceModuleRegistry(
    event.address
  ).id;

  complianceModule.save();
}
