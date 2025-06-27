import { Address, BigInt } from '@graphprotocol/graph-ts';
import { TokenBond } from '../../../../generated/schema';
import { Bond as BondTemplate } from '../../../../generated/templates';
import { fetchToken } from '../../../token/fetch/token';
import { setBigNumber } from '../../../utils/bignumber';

export function fetchBond(address: Address): TokenBond {
  let bond = TokenBond.load(address);

  if (!bond) {
    bond = new TokenBond(address);
    const token = fetchToken(address);
    setBigNumber(bond, 'faceValue', BigInt.zero(), token.decimals);
    bond.maturityDate = BigInt.zero();
    bond.isMatured = false;
    bond.underlyingAsset = Address.zero();
    bond.save();
    BondTemplate.create(address);
  }

  return bond;
}
