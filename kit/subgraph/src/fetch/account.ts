import { Address, ethereum } from '@graphprotocol/graph-ts';
import { Account } from '../../generated/schema';
import { fetchNativeBalance } from './balance';

export function fetchAccount(address: Address): Account {
  let account = Account.load(address);
  if (!account) {
    account = new Account(address);
    if (ethereum.hasCode(address).inner) {
      account.isContract = true;
    } else {
      account.isContract = false;
    }
  }

  account.nativeBalance = fetchNativeBalance(address).id;
  account.save();

  return account;
}
