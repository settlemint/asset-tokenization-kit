import { ByteArray, Bytes, crypto } from "@graphprotocol/graph-ts";
import { fetchEvent } from "../event/fetch/event";
import { ComplianceModuleRegistered as ComplianceModuleRegisteredEvent } from "../generated/ComplianceModuleRegistry/ComplianceModuleRegistry";
import { fetchComplianceModule } from "./fetch/compliance-module";

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

  complianceModule.save();
}
