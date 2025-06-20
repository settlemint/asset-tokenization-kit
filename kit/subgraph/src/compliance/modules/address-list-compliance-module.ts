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
    addressListComplianceModule.addresses =
      addressListComplianceModule.addresses.filter(
        (address) => address != event.params.addr
      );
  }
  addressListComplianceModule.save();
}
