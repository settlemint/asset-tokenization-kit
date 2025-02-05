import { BigInt, Bytes } from '@graphprotocol/graph-ts';
import { AssetBalance } from '../../generated/schema';
import { toDecimals } from '../utils/decimals';

export function fetchAssetBalance(asset: Bytes, account: Bytes, decimals: number): AssetBalance {
  const id = assetBalanceId(asset, account);
  let balance = AssetBalance.load(id);

  if (balance == null) {
    balance = new AssetBalance(id);
    balance.asset = asset;
    balance.account = account;
    balance.valueExact = BigInt.zero();
    balance.value = toDecimals(balance.valueExact, decimals);
    balance.save();
  }

  return balance;
}

export function assetBalanceId(asset: Bytes, account: Bytes): Bytes {
  return asset.concat(account);
}
