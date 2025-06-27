import { Address, type BigInt, log } from '@graphprotocol/graph-ts';
import type { IdentityClaim, Token } from '../../../generated/schema';
import { fetchIdentity } from '../../identity/fetch/identity';
import { setBigNumber } from '../../utils/bignumber';
import { fetchToken } from '../fetch/token';

export function increaseTokenSupply(token: Token, amount: BigInt): void {
  setBigNumber(
    token,
    'totalSupply',
    token.totalSupplyExact.plus(amount),
    token.decimals
  );

  token.save();
}

export function decreaseTokenSupply(token: Token, amount: BigInt): void {
  setBigNumber(
    token,
    'totalSupply',
    token.totalSupplyExact.minus(amount),
    token.decimals
  );

  token.save();
}

export function updateBasePrice(basePriceClaim: IdentityClaim): void {
  const identityAddress = Address.fromBytes(basePriceClaim.identity);

  const identity = fetchIdentity(identityAddress);
  if (!identity.token) {
    log.warning('No token found for identity {}', [
      identityAddress.toHexString(),
    ]);
    return;
  }

  const token = fetchToken(Address.fromBytes(identity.token!));
  token.basePriceClaim = basePriceClaim.id;
  token.save();
}
