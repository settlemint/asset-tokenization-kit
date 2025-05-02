import { FundCreated } from "../../generated/FundFactory/FundFactory";
import { Fund } from "../../generated/templates";
import { fetchAssetCount } from "../assets/fetch/asset-count";
import { fetchFund } from "../assets/fetch/fund";
import { fetchAccount } from "../fetch/account";
import { createActivityLogEntry, EventType } from "../fetch/activity-log";
import { AssetType, FactoryType } from "../utils/enums";
import { fetchFactory } from "./fetch/factory";

export function handleFundCreated(event: FundCreated): void {
  fetchFactory(event.address, FactoryType.fund);
  const creator = fetchAccount(event.params.creator);
  const asset = fetchFund(event.params.token);
  asset.creator = creator.id;
  asset.deployedOn = event.block.timestamp;
  asset.save();

  const assetCount = fetchAssetCount(AssetType.fund);
  assetCount.count = assetCount.count + 1;
  assetCount.save();

  createActivityLogEntry(event, EventType.AssetCreated, [
    event.params.token,
    event.params.creator,
  ]);

  Fund.create(event.params.token);
}
