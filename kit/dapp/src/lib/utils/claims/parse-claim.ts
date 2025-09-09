interface IdentityClaim {
  revoked: boolean;
  name: string;
  values: {
    key: string;
    value: string;
  }[];
}

/**
 * Parse a claim by topic, returns undefined if the claim is revoked
 * @param claims The claims to parse
 * @param topic The topic to parse
 * @returns The values of the claim
 */
// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
export function parseClaim<T>(
  claims: IdentityClaim[] | undefined,
  topic: string
): T | undefined {
  if (!claims) {
    return undefined;
  }
  const claim = claims.find((claim) => claim.name === topic && !claim.revoked);
  if (!claim) {
    return undefined;
  }

  return claim.values.reduce((acc, curr) => {
    acc[curr.key as keyof T] = curr.value as T[keyof T];
    return acc;
  }, {} as T);
}
