import { BigInt } from '@graphprotocol/graph-ts';
import {
  type Account,
  type Token,
  TokenBalance,
} from '../../../generated/schema';
import { setBigNumber } from '../../utils/bignumber';

export function fetchTokenBalance(
  token: Token,
  account: Account
): TokenBalance {
  const id = token.id.concat(account.id);

  let tokenBalance = TokenBalance.load(id);

  if (!tokenBalance) {
    tokenBalance = new TokenBalance(id);
    tokenBalance.token = token.id;
    tokenBalance.account = account.id;
    tokenBalance.lastUpdatedAt = BigInt.zero();
    tokenBalance.isFrozen = false;
    setBigNumber(tokenBalance, 'value', BigInt.zero(), token.decimals);
    setBigNumber(tokenBalance, 'frozen', BigInt.zero(), token.decimals);
    setBigNumber(tokenBalance, 'available', BigInt.zero(), token.decimals);
    tokenBalance.save();
  }

  return tokenBalance;
}
