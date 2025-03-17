import { FundCreated } from "../../generated/FundFactory/FundFactory";
import { Fund } from "../../generated/templates";
import { accountActivityEvent } from "../assets/events/accountactivity";
import { assetCreatedEvent } from "../assets/events/assetcreated";
import { fetchAssetCount } from "../assets/fetch/asset-count";
import { fetchFund } from "../assets/fetch/fund";
import { fetchAccount } from "../fetch/account";
import { AssetType, EventName, FactoryType } from "../utils/enums";
import { eventId } from "../utils/events";
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

  assetCreatedEvent(
    eventId(event),
    event.block.timestamp,
    asset.id,
    creator.id,
    AssetType.fund
  );
  accountActivityEvent(
    creator,
    EventName.AssetCreated,
    event.block.timestamp,
    AssetType.fund,
    asset.id
  );

  Fund.create(event.params.token);
}
