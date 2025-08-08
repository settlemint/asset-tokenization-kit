import { BigInt, log } from "@graphprotocol/graph-ts";

/**
 * See {@link ../../../../contracts/scripts/hardhat/constants/key-purposes.ts}
 */
export function getIdentityKeyPurpose(purpose: BigInt): string {
  if (purpose.equals(BigInt.fromI32(1))) {
    return "management";
  } else if (purpose.equals(BigInt.fromI32(2))) {
    return "deposit";
  } else if (purpose.equals(BigInt.fromI32(3))) {
    return "claimSigner";
  } else if (purpose.equals(BigInt.fromI32(4))) {
    return "encryption";
  } else {
    log.warning(`Unknown identity key purpose: {}`, [purpose.toString()]);
    return "unknown";
  }
}

/**
 * See {@link ../../../../contracts/scripts/hardhat/constants/key-types.ts}
 */
export function getIdentityKeyType(type: BigInt): string {
  if (type.equals(BigInt.fromI32(1))) {
    return "ecdsa";
  } else if (type.equals(BigInt.fromI32(2))) {
    return "rsa";
  } else {
    log.warning(`Unknown identity key type: {}`, [type.toString()]);
    return "unknown";
  }
}
