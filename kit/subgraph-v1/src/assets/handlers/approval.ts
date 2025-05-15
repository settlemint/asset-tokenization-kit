import { Address, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";
import { fetchAccount } from "../../utils/account";
import { createActivityLogEntry, EventType } from "../../utils/activity-log";
import { fetchAssetBalance } from "../../utils/balance";
import { setValueWithDecimals } from "../../utils/decimals";

export function approvalHandler(
  event: ethereum.Event,
  assetAddress: Bytes,
  value: BigInt,
  decimals: number,
  initialBlockedState: boolean,
  timestamp: BigInt,
  owner: Address,
  spender: Address
): void {
  createActivityLogEntry(event, EventType.Approval, owner, [owner, spender]);

  const ownerAccount = fetchAccount(owner);
  const ownerBalance = fetchAssetBalance(
    assetAddress,
    ownerAccount.id,
    decimals,
    initialBlockedState
  );
  setValueWithDecimals(ownerBalance, "approved", value, decimals);
  ownerBalance.lastActivity = timestamp;
  ownerBalance.save();
}
