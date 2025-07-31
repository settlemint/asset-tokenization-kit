import { BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";
import { getEncodedTypeId } from "../../type-identifier/type-identifier";

export function isCountryListComplianceModule(typeId: Bytes): boolean {
  return (
    typeId.equals(getEncodedTypeId("CountryAllowListComplianceModule")) ||
    typeId.equals(getEncodedTypeId("CountryBlockListComplianceModule"))
  );
}

export function decodeCountryListParams(data: Bytes): Array<i32> {
  const result = new Array<i32>();

  // Assumes wrapped in a tuple, so skip offset
  let offset = 32;

  const lenBytes = Bytes.fromUint8Array(data.subarray(offset, offset + 32));
  const lenVal = ethereum.decode("uint256", lenBytes);

  if (lenVal === null) return result;

  const arrayLength = lenVal.toBigInt().toI32();
  offset += 32;

  for (let i = 0; i < arrayLength; i++) {
    const chunk = data.subarray(offset, offset + 32);
    const bytes32 = Bytes.fromUint8Array(chunk);

    // Decode as uint256, then mask to 16 bits
    const val = ethereum.decode("uint256", bytes32);

    if (val !== null) {
      const big = val.toBigInt();
      // Mask to 16 bits (optional if you trust contract, but safer)
      const masked = big.bitAnd(BigInt.fromI32(0xffff));
      result.push(masked.toI32());
    }

    offset += 32;
  }

  return result;
}
