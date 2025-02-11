import { Address, BigInt, ethereum } from '@graphprotocol/graph-ts';
import { Account } from '../../generated/schema';
import { toDecimals } from '../utils/decimals';

export function fetchAccount(address: Address): Account {
  let account = Account.load(address);

  if (!account) {
    account = new Account(address);
    account.lastActivity = BigInt.zero();
    if (ethereum.hasCode(address).inner) {
      account.isContract = true;
    } else {
      account.isContract = false;
    }
  }

  account.nativeBalanceExact = ethereum.getBalance(address);
  account.nativeBalance = toDecimals(account.nativeBalanceExact, 18);
  account.save();

  return account;
}
