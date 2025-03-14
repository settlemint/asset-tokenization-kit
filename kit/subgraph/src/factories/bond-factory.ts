import { BondCreated } from "../../generated/BondFactory/BondFactory";
import { Bond } from "../../generated/templates";
import { accountActivityEvent } from "../assets/events/accountactivity";
import { assetCreatedEvent } from "../assets/events/assetcreated";
import { fetchAssetCount } from "../assets/fetch/asset-count";
import { fetchBond } from "../assets/fetch/bond";
import { fetchAccount } from "../fetch/account";
import { AssetType, EventName, FactoryType } from "../utils/enums";
import { eventId } from "../utils/events";
import { fetchFactory } from "./fetch/factory";

export function handleBondCreated(event: BondCreated): void {
  fetchFactory(event.address, FactoryType.bond);
  const creator = fetchAccount(event.params.creator);
  const asset = fetchBond(event.params.token);
  asset.creator = creator.id;
  asset.deployedOn = event.block.timestamp;
  asset.save();

  const assetCount = fetchAssetCount(AssetType.bond);
  assetCount.count = assetCount.count + 1;
  assetCount.save();

  assetCreatedEvent(
    eventId(event),
    event.block.timestamp,
    asset.id,
    creator.id,
    AssetType.bond
  );
  accountActivityEvent(
    creator,
    EventName.AssetCreated,
    event.block.timestamp,
    AssetType.bond,
    asset.id
  );

  Bond.create(event.params.token);
}
