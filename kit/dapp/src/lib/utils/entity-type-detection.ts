import { ALL_INTERFACE_IDS } from "@/lib/interface-ids";
import type { EntityType } from "@atk/zod/entity-types";

const INTERFACE_NAME_BY_HEX = new Map(
  Object.entries(ALL_INTERFACE_IDS).map(([name, hex]) => [
    hex.toLowerCase(),
    name,
  ])
);

// Interface names surface as raw identifiers or ERC-165 hashes; normalising them
// keeps the simple keyword heuristics reliable without extra lookups.
const TOKEN_KEYWORDS = [
  "token",
  "bond",
  "fund",
  "stablecoin",
  "equity",
  "deposit",
];

// Keywords group related capability interfaces into the entity buckets we expose.
const VAULT_KEYWORDS = ["vault"];
const CUSTODIAN_KEYWORDS = ["custodian"];

export function detectEntityType(
  supportedInterfaces?: readonly string[] | null
): EntityType {
  const interfaceNames = collectInterfaceNames(supportedInterfaces);

  if (matchesKeyword(interfaceNames, CUSTODIAN_KEYWORDS)) {
    return "custodian";
  }

  if (matchesKeyword(interfaceNames, VAULT_KEYWORDS)) {
    return "vault";
  }

  if (matchesKeyword(interfaceNames, TOKEN_KEYWORDS)) {
    return "token";
  }

  return "contract";
}

function collectInterfaceNames(
  supportedInterfaces?: readonly string[] | null
): Set<string> {
  const names = new Set<string>();

  if (!supportedInterfaces?.length) {
    return names;
  }

  for (const value of supportedInterfaces) {
    if (!value) {
      continue;
    }

    const trimmed = value.trim();
    if (!trimmed) {
      continue;
    }

    const lookupKey = trimmed.toLowerCase();
    const mappedName = INTERFACE_NAME_BY_HEX.get(lookupKey);
    const canonicalName = (mappedName ?? trimmed).toLowerCase();
    names.add(canonicalName);
  }

  return names;
}

function matchesKeyword(
  interfaceNames: Set<string>,
  keywords: readonly string[]
): boolean {
  for (const keyword of keywords) {
    for (const name of interfaceNames) {
      if (name.includes(keyword)) {
        return true;
      }
    }
  }

  return false;
}
