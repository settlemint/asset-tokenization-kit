import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { AssetBalance } from "../../generated/schema";
import { toDecimals } from "../utils/decimals";

export function fetchAssetBalance(
  asset: Bytes,
  account: Bytes,
  decimals: number,
  initialBlockedState: boolean
): AssetBalance {
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
    balance.blocked = initialBlockedState;
    balance.frozenExact = BigInt.zero();
    balance.frozen = toDecimals(balance.frozenExact, decimals);
    balance.lastActivity = BigInt.zero();
    balance.save();
  }

  return balance;
}

export function hasBalance(asset: Bytes, account: Bytes): boolean {
  const id = assetBalanceId(asset, account);
  const balance = AssetBalance.load(id);
  return balance != null;
}

export function assetBalanceId(asset: Bytes, account: Bytes): Bytes {
  return asset.concat(account);
}
