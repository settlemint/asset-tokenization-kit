import { ByteArray, Bytes, crypto } from "@graphprotocol/graph-ts";
import { ComplianceModuleRegistered as ComplianceModuleRegisteredEvent } from "../../generated/templates/ComplianceModuleRegistry/ComplianceModuleRegistry";
import { fetchEvent } from "../event/fetch/event";
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
  complianceModule.typeId = event.params.typeId;

  if (
    event.params.typeId ==
      crypto.keccak256(
        ByteArray.fromUTF8("AddressBlockListComplianceModule")
      ) ||
    event.params.typeId ==
      crypto.keccak256(
        ByteArray.fromUTF8("IdentityAllowListComplianceModule")
      ) ||
    event.params.typeId ==
      crypto.keccak256(ByteArray.fromUTF8("IdentityBlockListComplianceModule"))
  ) {
    // TODO
  }
  if (
    event.params.typeId ==
      crypto.keccak256(
        ByteArray.fromUTF8("CountryAllowListComplianceModule")
      ) ||
    event.params.typeId ==
      crypto.keccak256(ByteArray.fromUTF8("CountryBlockListComplianceModule"))
  ) {
    // TODO
  }

  complianceModule.complianceModuleRegistry = fetchComplianceModuleRegistry(
    event.address
  ).id;

  complianceModule.save();
}
