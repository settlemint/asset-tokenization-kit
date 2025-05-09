import { StableCoinCreated } from "../../../generated/StableCoinFactory/StableCoinFactory";
import { StableCoin } from "../../../generated/templates";
import { fetchAssetCount } from "../assets/fetch/asset-count";
import { fetchStableCoin } from "../assets/fetch/stablecoin";
import { fetchAccount } from "../utils/account";
import { createActivityLogEntry, EventType } from "../utils/activity-log";
import { AssetType, FactoryType } from "../utils/enums";
import { fetchFactory } from "./fetch/factory";

export function handleStableCoinCreated(event: StableCoinCreated): void {
  fetchFactory(event.address, FactoryType.stablecoin);
  const creator = fetchAccount(event.params.creator);
  const asset = fetchStableCoin(event.params.token);
  asset.creator = creator.id;
  asset.deployedOn = event.block.timestamp;
  asset.save();

  const assetCount = fetchAssetCount(AssetType.stablecoin);
  assetCount.count = assetCount.count + 1;
  assetCount.save();

  createActivityLogEntry(event, EventType.AssetCreated, event.params.creator, [
    event.params.token,
    event.params.creator,
  ]);

  StableCoin.create(event.params.token);
}
