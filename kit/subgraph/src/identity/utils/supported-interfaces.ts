import { Address, Bytes } from "@graphprotocol/graph-ts";

import { checkSupportsInterface } from "../../erc165/erc165";
import { InterfaceIds } from "../../erc165/utils/interfaceids";

// OpenZeppelin AccessControl interface identifiers help distinguish vault contracts
const IACCESS_CONTROL = Bytes.fromHexString("0x7965db0b");
const IACCESS_CONTROL_ENUMERABLE = Bytes.fromHexString("0x5a05180f");

const ENTITY_INTERFACE_CANDIDATES: Bytes[] = [
  InterfaceIds.ISMART,
  InterfaceIds.IATKToken,
  InterfaceIds.IATKBond,
  InterfaceIds.IATKFund,
  InterfaceIds.IATKStableCoin,
  InterfaceIds.IATKDeposit,
  InterfaceIds.IATKEquity,
  InterfaceIds.ISMARTCustodian,
  InterfaceIds.IContractWithIdentity,
  IACCESS_CONTROL,
  IACCESS_CONTROL_ENUMERABLE,
];

const TOKEN_INTERFACE_CANDIDATES: Bytes[] = [
  InterfaceIds.IATKToken,
  InterfaceIds.IATKBond,
  InterfaceIds.IATKFund,
  InterfaceIds.IATKStableCoin,
  InterfaceIds.IATKDeposit,
  InterfaceIds.IATKEquity,
];

const VAULT_INTERFACE_CANDIDATES: Bytes[] = [
  InterfaceIds.IContractWithIdentity,
  IACCESS_CONTROL,
  IACCESS_CONTROL_ENUMERABLE,
];

function includesInterface(collection: Bytes[], candidate: Bytes): boolean {
  const needle = candidate.toHexString();
  for (let i = 0; i < collection.length; i++) {
    if (collection[i].toHexString() == needle) {
      return true;
    }
  }
  return false;
}

function pushUnique(target: Bytes[], value: Bytes): void {
  if (!includesInterface(target, value)) {
    target.push(value);
  }
}

function canonicalise(values: Bytes[]): Bytes[] {
  const ordered = new Array<Bytes>();

  for (let i = 0; i < ENTITY_INTERFACE_CANDIDATES.length; i++) {
    const candidate = ENTITY_INTERFACE_CANDIDATES[i];
    if (includesInterface(values, candidate)) {
      ordered.push(candidate);
    }
  }

  for (let i = 0; i < values.length; i++) {
    const value = values[i];
    pushUnique(ordered, value);
  }

  return ordered;
}

export function resolveSupportedInterfaces(
  contractAddress: Address,
  provided: Bytes[] | null = null
): Bytes[] {
  const resolved = provided ? canonicalise(provided) : new Array<Bytes>();

  if (contractAddress.equals(Address.zero())) {
    return canonicalise(resolved);
  }

  for (let i = 0; i < ENTITY_INTERFACE_CANDIDATES.length; i++) {
    const candidate = ENTITY_INTERFACE_CANDIDATES[i];
    if (includesInterface(resolved, candidate)) {
      continue;
    }
    if (checkSupportsInterface(contractAddress, candidate)) {
      resolved.push(candidate);
    }
  }

  return canonicalise(resolved);
}

export function deriveEntityType(
  supportedInterfaces: Bytes[],
  fallback: string | null = null
): string {
  for (let i = 0; i < TOKEN_INTERFACE_CANDIDATES.length; i++) {
    if (includesInterface(supportedInterfaces, TOKEN_INTERFACE_CANDIDATES[i])) {
      return "token";
    }
  }

  for (let i = 0; i < VAULT_INTERFACE_CANDIDATES.length; i++) {
    if (includesInterface(supportedInterfaces, VAULT_INTERFACE_CANDIDATES[i])) {
      return "vault";
    }
  }

  if (includesInterface(supportedInterfaces, InterfaceIds.ISMARTCustodian)) {
    return "custodian";
  }

  if (fallback !== null) {
    return fallback;
  }

  return "contract";
}
