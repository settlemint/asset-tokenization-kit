const TOKEN_NAME_KEYWORDS: string[] = [
  "token",
  "bond",
  "fund",
  "stable",
  "deposit",
  "equity",
];

const TOKEN_NAME_EXCLUSIONS: string[] = [
  "factory",
  "registry",
  "manager",
  "module",
  "addon",
];

/**
 * Classifies contract-backed identities using the human-readable contractName.
 * Avoids on-chain ERC-165 probes by relying on naming heuristics only.
 */
export function deriveEntityType(
  contractName: string | null,
  fallback: string | null = null
): string {
  if (contractName === null) {
    return fallback !== null ? fallback : "contract";
  }

  const normalised = contractName.toLowerCase();
  if (!hasNonWhitespaceCharacter(normalised)) {
    return fallback !== null ? fallback : "contract";
  }

  if (normalised == "vault") {
    return "vault";
  }

  if (isTokenLikeName(normalised)) {
    return "token";
  }

  return fallback !== null ? fallback : "contract";
}

function isTokenLikeName(name: string): boolean {
  for (let i = 0; i < TOKEN_NAME_EXCLUSIONS.length; i++) {
    if (name.indexOf(TOKEN_NAME_EXCLUSIONS[i]) >= 0) {
      return false;
    }
  }

  for (let i = 0; i < TOKEN_NAME_KEYWORDS.length; i++) {
    if (name.indexOf(TOKEN_NAME_KEYWORDS[i]) >= 0) {
      return true;
    }
  }

  return false;
}

function hasNonWhitespaceCharacter(value: string): boolean {
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i);
    if (code != 32 && code != 9 && code != 10 && code != 13) {
      return true;
    }
  }
  return false;
}
