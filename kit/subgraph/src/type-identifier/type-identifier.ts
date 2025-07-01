import { ByteArray, Bytes, crypto, log } from "@graphprotocol/graph-ts";
import { TypeIds } from "./utils/typeids";

/**
 * Utility function to decode a typeId to a name
 * @param typeId - The typeId to decode
 * @returns The name of the typeId
 */
export function getDecodedTypeId(typeId: Bytes): string {
  for (let i = 0; i < TypeIds.typeIds.length; i++) {
    if (typeId.equals(TypeIds.typeIds[i].id)) {
      return TypeIds.typeIds[i].name;
    }
  }
  log.warning("Unknown type identifier with id: {}", [typeId.toHexString()]);
  return "unknown";
}

/**
 * Utility function to encode a name to a typeId
 * @param name - The name to encode
 * @returns The typeId
 */
export function getEncodedTypeId(name: string): Bytes {
  for (let i = 0; i < TypeIds.typeIds.length; i++) {
    if (TypeIds.typeIds[i].name == name) {
      return TypeIds.typeIds[i].id;
    }
  }
  log.warning("Unknown type identifier with name: {}", [name]);
  return Bytes.fromByteArray(crypto.keccak256(ByteArray.fromUTF8(name)));
}
