import { Address, BigInt, Bytes, ethereum } from '@graphprotocol/graph-ts';
import { Balance, NativeBalance } from '../../generated/schema';
import { balanceId } from '../utils/balance';
import { toDecimals } from '../utils/decimals';

export function fetchBalance(id: Bytes, asset: Address, account: Address | null): Balance {
  let balance = Balance.load(id);

  if (balance == null) {
    balance = new Balance(id);
    balance.asset = asset;
    balance.account = account;
    balance.valueExact = BigInt.fromI32(0);
    balance.value = toDecimals(balance.valueExact);
    balance.save();
  }

  return balance;
}

export function fetchTotalSupply(asset: Address): Balance {
  let id = balanceId(asset, null);
  return fetchBalance(id, asset, null);
}

export function fetchNativeBalance(account: Address): NativeBalance {
  let nativeBalance = NativeBalance.load(account);
  if (!nativeBalance) {
    nativeBalance = new NativeBalance(account);
  }
  nativeBalance.valueExact = ethereum.getBalance(account);
  nativeBalance.value = toDecimals(nativeBalance.valueExact);
  nativeBalance.save();
  return nativeBalance;
}
