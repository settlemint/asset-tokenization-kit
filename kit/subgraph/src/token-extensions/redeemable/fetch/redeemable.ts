import { type Address, BigInt } from '@graphprotocol/graph-ts';
import { TokenRedeemable } from '../../../../generated/schema';
import { Redeemable as RedeemableTemplate } from '../../../../generated/templates';
import { fetchToken } from '../../../token/fetch/token';
import { setBigNumber } from '../../../utils/bignumber';

export function fetchRedeemable(address: Address): TokenRedeemable {
  let redeemable = TokenRedeemable.load(address);

  if (!redeemable) {
    redeemable = new TokenRedeemable(address);
    const token = fetchToken(address);
    setBigNumber(redeemable, 'redeemedAmount', BigInt.zero(), token.decimals);
    redeemable.save();
    RedeemableTemplate.create(address);
  }

  return redeemable;
}
