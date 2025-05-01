import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { fetchAccount } from "../../fetch/account";
import { fetchAssetBalance } from "../../fetch/balance";
import { setValueWithDecimals } from "../../utils/decimals";

export function approvalHandler(
  assetAddress: Bytes,
  value: BigInt,
  decimals: number,
  initialBlockedState: boolean,
  timestamp: BigInt,
  owner: Address
): void {
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
