import { Address, Bytes, Entity, ethereum } from "@graphprotocol/graph-ts";
import { AssetBalance } from "../../../generated/schema";
import { fetchAccount } from "../../utils/account";
import { createActivityLogEntry, EventType } from "../../utils/activity-log";
import { hasBalance } from "../../utils/balance";
import { setValueWithDecimals } from "../../utils/decimals";
import { fetchAssetCount } from "../fetch/asset-count";

export function unPauseHandler(
  event: ethereum.Event,
  asset: Entity,
  assetId: Bytes,
  assetType: string,
  decimals: number,
  initialBlockedState: boolean,
  holders: AssetBalance[],
  sender: Address
): void {
  createActivityLogEntry(event, EventType.Unpause, sender, [sender]);

  asset.setBoolean("paused", false);
  handleAssetCount(assetType);
  for (let i = 0; i < holders.length; i++) {
    const assetBalance = holders[i];
    if (
      hasBalance(assetId, assetBalance.account, decimals, initialBlockedState)
    ) {
      const holderAccount = fetchAccount(
        Address.fromBytes(assetBalance.account)
      );
      holderAccount.pausedBalancesCount = holderAccount.pausedBalancesCount - 1;
      setValueWithDecimals(
        holderAccount,
        "pausedBalance",
        holderAccount.pausedBalanceExact.minus(assetBalance.valueExact),
        decimals
      );
      holderAccount.save();
    }
  }
}

function handleAssetCount(assetType: string): void {
  const assetCount = fetchAssetCount(assetType);
  assetCount.countPaused = assetCount.countPaused - 1;
  assetCount.save();
}
