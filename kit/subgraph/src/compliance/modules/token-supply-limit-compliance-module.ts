import { BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";
import { getEncodedTypeId } from "../../type-identifier/type-identifier";

export function isTokenSupplyLimitComplianceModule(typeId: Bytes): boolean {
  return typeId.equals(getEncodedTypeId("TokenSupplyLimitComplianceModule"));
}

// Encoded as ABI of SupplyLimitConfig struct:
// struct SupplyLimitConfig {
//   uint256 maxSupply;
//   uint256 periodLength;
//   bool rolling;
//   bool useBasePrice;
//   bool global;
// }
export class DecodedTokenSupplyLimitParams {
  maxSupplyExact: BigInt;
  periodLengthDays: i32;
  rolling: boolean;
  useBasePrice: boolean;
  global: boolean;

  constructor(
    maxSupplyExact: BigInt,
    periodLengthDays: i32,
    rolling: boolean,
    useBasePrice: boolean,
    global: boolean
  ) {
    this.maxSupplyExact = maxSupplyExact;
    this.periodLengthDays = periodLengthDays;
    this.rolling = rolling;
    this.useBasePrice = useBasePrice;
    this.global = global;
  }
}

export function decodeTokenSupplyLimitParams(
  data: Bytes
): DecodedTokenSupplyLimitParams | null {
  // Expect tight ABI encoding of struct as 5 words (uint256,uint256,bool,bool,bool)
  if (data.length < 32 * 5) {
    return null;
  }

  let offset = 0;

  const maxSupplyBytes = Bytes.fromUint8Array(
    data.subarray(offset, offset + 32)
  );
  const maxSupplyVal = ethereum.decode("uint256", maxSupplyBytes);
  if (maxSupplyVal === null) return null;
  offset += 32;

  const periodLenBytes = Bytes.fromUint8Array(
    data.subarray(offset, offset + 32)
  );
  const periodLenVal = ethereum.decode("uint256", periodLenBytes);
  if (periodLenVal === null) return null;
  offset += 32;

  const rollingBytes = Bytes.fromUint8Array(data.subarray(offset, offset + 32));
  const rollingVal = ethereum.decode("bool", rollingBytes);
  if (rollingVal === null) return null;
  offset += 32;

  const useBasePriceBytes = Bytes.fromUint8Array(
    data.subarray(offset, offset + 32)
  );
  const useBasePriceVal = ethereum.decode("bool", useBasePriceBytes);
  if (useBasePriceVal === null) return null;
  offset += 32;

  const globalBytes = Bytes.fromUint8Array(data.subarray(offset, offset + 32));
  const globalVal = ethereum.decode("bool", globalBytes);
  if (globalVal === null) return null;

  const periodLengthDays = periodLenVal!.toBigInt().toI32();
  const rolling = (rollingVal as ethereum.Value).toBoolean();
  const useBasePrice = (useBasePriceVal as ethereum.Value).toBoolean();
  const global = (globalVal as ethereum.Value).toBoolean();

  return new DecodedTokenSupplyLimitParams(
    (maxSupplyVal as ethereum.Value).toBigInt(),
    periodLengthDays,
    rolling,
    useBasePrice,
    global
  );
}
