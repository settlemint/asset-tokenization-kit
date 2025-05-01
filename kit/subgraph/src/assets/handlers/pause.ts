import { Address, Bytes, Entity } from "@graphprotocol/graph-ts";
import { AssetBalance } from "../../../generated/schema";
import { fetchAccount } from "../../fetch/account";
import { hasBalance } from "../../fetch/balance";
import { setValueWithDecimals } from "../../utils/decimals";
import { fetchAssetCount } from "../fetch/asset-count";

export function pauseHandler(
  asset: Entity,
  assetId: Bytes,
  assetType: string,
  decimals: number,
  initialBlockedState: boolean,
  holders: AssetBalance[]
): void {
  asset.setBoolean("paused", true);
  handleAssetCount(assetType);
  for (let i = 0; i < holders.length; i++) {
    const assetBalance = holders[i];
    if (
      hasBalance(assetId, assetBalance.account, decimals, initialBlockedState)
    ) {
      const holderAccount = fetchAccount(
        Address.fromBytes(assetBalance.account)
      );
      holderAccount.pausedBalancesCount = holderAccount.pausedBalancesCount + 1;
      setValueWithDecimals(
        holderAccount,
        "pausedBalance",
        holderAccount.pausedBalanceExact.plus(assetBalance.valueExact),
        decimals
      );
      holderAccount.save();
    }
  }
}

function handleAssetCount(assetType: string): void {
  const assetCount = fetchAssetCount(assetType);
  assetCount.countPaused = assetCount.countPaused + 1;
  assetCount.save();
}
