import { ByteArray, Bytes, crypto } from "@graphprotocol/graph-ts";
import { ComplianceModuleRegistered as ComplianceModuleRegisteredEvent } from "../../generated/templates/ComplianceModuleRegistry/ComplianceModuleRegistry";
import { fetchEvent } from "../event/fetch/event";
import { fetchComplianceModule } from "./fetch/compliance-module";
import { fetchComplianceModuleRegistry } from "./fetch/compliance-module-registry";
import { fetchAddressListComplianceModule } from "./modules/fetch/address-list-compliance-module";
import { fetchCountryListComplianceModule } from "./modules/fetch/country-list-compliance-module";

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
    const addressListComplianceModule = fetchAddressListComplianceModule(
      event.params.moduleAddress
    );
    complianceModule.addressList = addressListComplianceModule.id;
  }
  if (
    event.params.typeId ==
      crypto.keccak256(
        ByteArray.fromUTF8("CountryAllowListComplianceModule")
      ) ||
    event.params.typeId ==
      crypto.keccak256(ByteArray.fromUTF8("CountryBlockListComplianceModule"))
  ) {
    const countryListComplianceModule = fetchCountryListComplianceModule(
      event.params.moduleAddress
    );
    complianceModule.countryList = countryListComplianceModule.id;
  }

  complianceModule.complianceModuleRegistry = fetchComplianceModuleRegistry(
    event.address
  ).id;

  complianceModule.save();
}
