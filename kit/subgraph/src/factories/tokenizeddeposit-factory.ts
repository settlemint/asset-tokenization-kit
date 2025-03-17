import { TokenizedDepositCreated } from "../../generated/TokenizedDepositFactory/TokenizedDepositFactory";
import { TokenizedDeposit } from "../../generated/templates";
import { accountActivityEvent } from "../assets/events/accountactivity";
import { assetCreatedEvent } from "../assets/events/assetcreated";
import { fetchAssetCount } from "../assets/fetch/asset-count";
import { fetchTokenizedDeposit } from "../assets/fetch/tokenizeddeposit";
import { fetchAccount } from "../fetch/account";
import { AssetType, EventName, FactoryType } from "../utils/enums";
import { eventId } from "../utils/events";
import { fetchFactory } from "./fetch/factory";

export function handleTokenizedDepositCreated(
  event: TokenizedDepositCreated
): void {
  fetchFactory(event.address, FactoryType.tokenizeddeposit);
  const creator = fetchAccount(event.params.creator);
  const asset = fetchTokenizedDeposit(event.params.token);
  asset.creator = creator.id;
  asset.deployedOn = event.block.timestamp;
  asset.save();

  const assetCount = fetchAssetCount(AssetType.tokenizeddeposit);
  assetCount.count = assetCount.count + 1;
  assetCount.save();

  assetCreatedEvent(
    eventId(event),
    event.block.timestamp,
    asset.id,
    creator.id,
    AssetType.tokenizeddeposit
  );
  accountActivityEvent(
    creator,
    EventName.AssetCreated,
    event.block.timestamp,
    AssetType.tokenizeddeposit,
    asset.id
  );

  TokenizedDeposit.create(event.params.token);
}
