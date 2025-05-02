import { EquityCreated } from "../../generated/EquityFactory/EquityFactory";
import { Equity } from "../../generated/templates";
import { fetchAssetCount } from "../assets/fetch/asset-count";
import { fetchEquity } from "../assets/fetch/equity";
import { fetchAccount } from "../fetch/account";
import { createActivityLogEntry, EventType } from "../fetch/activity-log";
import { AssetType, FactoryType } from "../utils/enums";
import { fetchFactory } from "./fetch/factory";

export function handleEquityCreated(event: EquityCreated): void {
  fetchFactory(event.address, FactoryType.equity);
  const creator = fetchAccount(event.params.creator);
  const asset = fetchEquity(event.params.token);
  asset.creator = creator.id;
  asset.deployedOn = event.block.timestamp;
  asset.save();

  const assetCount = fetchAssetCount(AssetType.equity);
  assetCount.count = assetCount.count + 1;
  assetCount.save();

  createActivityLogEntry(event, EventType.AssetCreated, [
    event.params.token,
    event.params.creator,
  ]);

  Equity.create(event.params.token);
}
