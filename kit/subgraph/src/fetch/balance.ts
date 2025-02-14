import { BigInt, Bytes } from '@graphprotocol/graph-ts';
import { AssetBalance } from '../../generated/schema';
import { Fund } from '../../generated/templates/Fund/Fund';
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
    balance.approvedExact = BigInt.zero();
    balance.approved = toDecimals(balance.approvedExact, decimals);

    // Get blocklist and frozen status directly from the Fund contract
    const fund = Fund.bind(asset);
    balance.blocked = fund.blocked(account);
    balance.frozen = fund.frozen(account);

    balance.save();
  }

  return balance;
}

export function assetBalanceId(asset: Bytes, account: Bytes): Bytes {
  return asset.concat(account);
}
