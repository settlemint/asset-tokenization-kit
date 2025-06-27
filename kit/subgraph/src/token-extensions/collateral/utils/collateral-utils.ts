import { Address, log } from '@graphprotocol/graph-ts';
import type { IdentityClaim } from '../../../../generated/schema';
import { fetchIdentity } from '../../../identity/fetch/identity';
import { fetchCollateral } from '../fetch/collateral';

export function isCollateralClaim(claim: IdentityClaim): boolean {
  return claim.name == 'collateral';
}

export function updateCollateral(collateralClaim: IdentityClaim): void {
  const identityAddress = Address.fromBytes(collateralClaim.identity);

  const identity = fetchIdentity(identityAddress);
  if (!identity.token) {
    log.warning('No token found for identity {}', [
      identityAddress.toHexString(),
    ]);
    return;
  }

  const collateral = fetchCollateral(Address.fromBytes(identity.token!));
  collateral.identityClaim = collateralClaim.id;

  collateral.save();
}
