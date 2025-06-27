import type { IdentityClaim } from '../../../generated/schema';

export function isBasePriceClaim(claim: IdentityClaim): boolean {
  return claim.name == 'basePrice';
}
