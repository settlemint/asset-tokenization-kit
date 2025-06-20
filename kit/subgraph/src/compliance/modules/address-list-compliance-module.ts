import { Bytes } from "@graphprotocol/graph-ts";
import { GlobalAddressListChange as GlobalAddressListChangeEvent } from "../../../generated/templates/AbstractAddressListComplianceModule/AbstractAddressListComplianceModule";
import { fetchEvent } from "../../event/fetch/event";
import { fetchAddressListComplianceModule } from "./fetch/address-list-compliance-module";

export function handleGlobalAddressListChange(
  event: GlobalAddressListChangeEvent
): void {
  fetchEvent(event, "GlobalAddressListChange");

  const addressListComplianceModule = fetchAddressListComplianceModule(
    event.address
  );
  if (event.params.inList) {
    addressListComplianceModule.addresses.push(event.params.addr);
  } else {
    const newAddresses: Bytes[] = [];
    const currentAddresses = addressListComplianceModule.addresses;
    for (let i = 0; i < currentAddresses.length; i++) {
      if (currentAddresses[i] != event.params.addr) {
        newAddresses.push(currentAddresses[i]);
      }
    }
    addressListComplianceModule.addresses = newAddresses;
  }
  addressListComplianceModule.save();
}
