import { BondCreated } from "../../generated/BondFactory/BondFactory";
import { Bond } from "../../generated/templates";
import { fetchAssetCount } from "../assets/fetch/asset-count";
import { fetchBond } from "../assets/fetch/bond";
import { fetchAccount } from "../utils/account";
import { createActivityLogEntry, EventType } from "../utils/activity-log";
import { AssetType, FactoryType } from "../utils/enums";
import { fetchFactory } from "./fetch/factory";

export function handleBondCreated(event: BondCreated): void {
  fetchFactory(event.address, FactoryType.bond);
  const creator = fetchAccount(event.params.creator);
  const asset = fetchBond(event.params.token, event.block.timestamp);
  asset.creator = creator.id;
  asset.save();

  const assetCount = fetchAssetCount(AssetType.bond);
  assetCount.count = assetCount.count + 1;
  assetCount.save();

  createActivityLogEntry(event, EventType.AssetCreated, [
    event.params.token,
    event.params.creator,
  ]);

  Bond.create(event.params.token);
}
