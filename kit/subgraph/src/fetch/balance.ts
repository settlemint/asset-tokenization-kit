import { BigInt, Bytes } from '@graphprotocol/graph-ts';
import { Balance } from '../../generated/schema';
import { toDecimals } from '../utils/decimals';

export function fetchBalance(id: Bytes, asset: Bytes, account: Bytes): Balance {
  let balance = Balance.load(id);

  if (balance == null) {
    balance = new Balance(id);
    balance.asset = asset;
    balance.account = account;
    balance.valueExact = BigInt.zero();
    balance.value = toDecimals(balance.valueExact);
    balance.save();
  }

  return balance;
}
