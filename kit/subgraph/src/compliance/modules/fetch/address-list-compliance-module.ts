import { Address } from "@graphprotocol/graph-ts";
import { AddressListComplianceModule } from "../../../../generated/schema";
import { AbstractAddressListComplianceModule as AddressListComplianceModuleTemplate } from "../../../../generated/templates";

export function fetchAddressListComplianceModule(
  address: Address
): AddressListComplianceModule {
  let addressListComplianceModule = AddressListComplianceModule.load(address);

  if (!addressListComplianceModule) {
    addressListComplianceModule = new AddressListComplianceModule(address);
    addressListComplianceModule.addresses = [];
    addressListComplianceModule.save();
    AddressListComplianceModuleTemplate.create(address);

    // TODO: should we query the global addresses list?
  }

  return addressListComplianceModule;
}
