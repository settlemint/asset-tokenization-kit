interface IdentityClaim {
  revoked: boolean;
  name: string;
  values: {
    key: string;
    value: string;
  }[];
}

/**
 * Parse a claim by topic
 * @param claims The claims to parse
 * @param topic The topic to parse
 * @returns The values of the claim
 */
export function parseClaim<T>(
  claims: IdentityClaim[] | undefined,
  topic: string
): T | undefined {
  if (!claims) {
    return undefined;
  }
  const claim = claims.find((claim) => claim.name === topic);
  if (!claim) {
    return undefined;
  }

  return claim.values.reduce((acc, curr) => {
    acc[curr.key as keyof T] = curr.value as T[keyof T];
    return acc;
  }, {} as T);
}
