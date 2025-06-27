import type { Address } from '@graphprotocol/graph-ts';
import { TokenCollateral } from '../../../../generated/schema';

export function fetchCollateral(address: Address): TokenCollateral {
  let collateral = TokenCollateral.load(address);

  if (!collateral) {
    collateral = new TokenCollateral(address);
    collateral.identityClaim = null;
    collateral.save();
  }

  return collateral;
}
