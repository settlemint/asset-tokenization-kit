import { DepositCreated } from "../../generated/DepositFactory/DepositFactory";
import { Deposit } from "../../generated/templates";
import { fetchAssetCount } from "../assets/fetch/asset-count";
import { fetchDeposit } from "../assets/fetch/deposit";
import { fetchAccount } from "../fetch/account";
import { createActivityLogEntry, EventType } from "../fetch/activity-log";
import { AssetType, FactoryType } from "../utils/enums";
import { fetchFactory } from "./fetch/factory";

export function handleDepositCreated(event: DepositCreated): void {
  fetchFactory(event.address, FactoryType.deposit);
  const creator = fetchAccount(event.params.creator);
  const asset = fetchDeposit(event.params.token);
  asset.creator = creator.id;
  asset.deployedOn = event.block.timestamp;
  asset.save();

  const assetCount = fetchAssetCount(AssetType.deposit);
  assetCount.count = assetCount.count + 1;
  assetCount.save();

  createActivityLogEntry(event, EventType.AssetCreated, [
    event.params.token,
    event.params.creator,
  ]);

  Deposit.create(event.params.token);
}
