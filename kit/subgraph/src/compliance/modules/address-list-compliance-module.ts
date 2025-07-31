import { Bytes, ethereum } from "@graphprotocol/graph-ts";
import { getEncodedTypeId } from "../../type-identifier/type-identifier";

export function isAddressListComplianceModule(typeId: Bytes): boolean {
  return (
    typeId.equals(getEncodedTypeId("AddressBlockListComplianceModule")) ||
    typeId.equals(getEncodedTypeId("IdentityAllowListComplianceModule")) ||
    typeId.equals(getEncodedTypeId("IdentityBlockListComplianceModule"))
  );
}

export function decodeAddressListParams(data: Bytes): Array<Bytes> {
  const result = new Array<Bytes>();

  let offset = 32;

  const lenBytes = Bytes.fromUint8Array(data.subarray(offset, offset + 32));
  const lenVal = ethereum.decode("uint256", lenBytes);

  if (lenVal === null) {
    return result;
  }

  const arrayLength = lenVal.toBigInt().toI32();
  offset += 32;

  for (let i = 0; i < arrayLength; i++) {
    const addrChunk = Bytes.fromUint8Array(data.subarray(offset, offset + 32));
    const addrBytes = Bytes.fromUint8Array(addrChunk.subarray(12)); // last 20 bytes
    result.push(addrBytes);
    offset += 32;
  }

  return result;
}
