import { type Address, BigInt } from '@graphprotocol/graph-ts';
import { TokenCapped } from '../../../../generated/schema';
import { Capped as CappedTemplate } from '../../../../generated/templates';
import { fetchToken } from '../../../token/fetch/token';
import { setBigNumber } from '../../../utils/bignumber';

export function fetchCapped(address: Address): TokenCapped {
  let capped = TokenCapped.load(address);

  if (!capped) {
    capped = new TokenCapped(address);
    const token = fetchToken(address);
    setBigNumber(capped, 'cap', BigInt.zero(), token.decimals);
    capped.save();
    CappedTemplate.create(address);
  }

  return capped;
}
