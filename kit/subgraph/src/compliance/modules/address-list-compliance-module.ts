import {
  Address,
  ByteArray,
  Bytes,
  crypto,
  ethereum,
} from "@graphprotocol/graph-ts";
import { GlobalAddressListChange as GlobalAddressListChangeEvent } from "../../../generated/templates/AbstractAddressListComplianceModule/AbstractAddressListComplianceModule";
import { fetchEvent } from "../../event/fetch/event";
import { fetchComplianceModule } from "../fetch/compliance-module";

export function isAddressListComplianceModule(typeId: Bytes): boolean {
  return (
    typeId ==
      crypto.keccak256(
        ByteArray.fromUTF8("AddressBlockListComplianceModule")
      ) ||
    typeId ==
      crypto.keccak256(
        ByteArray.fromUTF8("IdentityAllowListComplianceModule")
      ) ||
    typeId ==
      crypto.keccak256(ByteArray.fromUTF8("IdentityBlockListComplianceModule"))
  );
}

export function decodeAddressListParams(data: Bytes): Array<Address> {
  const result = new Array<Address>();

  // Starting at offset 32 — assumes tuple-style encoding
  let offset = 32;

  const lenBytes = Bytes.fromUint8Array(data.subarray(offset, offset + 32));
  const lenVal = ethereum.decode("uint256", lenBytes);

  if (lenVal === null) {
    return result; // fail safely
  }

  const arrayLength = lenVal.toBigInt().toI32();
  offset += 32;

  for (let i = 0; i < arrayLength; i++) {
    const addrChunk = Bytes.fromUint8Array(data.subarray(offset, offset + 32));
    const addr = Address.fromBytes(
      Bytes.fromUint8Array(addrChunk.subarray(12))
    );
    result.push(addr);
    offset += 32;
  }

  return result;
}

export function handleGlobalAddressListChange(
  event: GlobalAddressListChangeEvent
): void {
  fetchEvent(event, "GlobalAddressListChange");

  const complianceModule = fetchComplianceModule(event.address);
  complianceModule.addresses = complianceModule.addresses || [];

  if (event.params.inList) {
    complianceModule.addresses.push(event.params.addr);
  } else {
    const newAddresses: Bytes[] = [];
    const currentAddresses = complianceModule.addresses;
    for (let i = 0; i < currentAddresses.length; i++) {
      if (currentAddresses[i] != event.params.addr) {
        newAddresses.push(currentAddresses[i]);
      }
    }
    complianceModule.addresses = newAddresses;
  }
  complianceModule.save();
}
