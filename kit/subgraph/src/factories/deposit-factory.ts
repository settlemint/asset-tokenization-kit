import { DepositCreated } from "../../generated/DepositFactory/DepositFactory";
import { Deposit } from "../../generated/templates";
import { accountActivityEvent } from "../assets/events/accountactivity";
import { assetCreatedEvent } from "../assets/events/assetcreated";
import { fetchAssetCount } from "../assets/fetch/asset-count";
import { fetchDeposit } from "../assets/fetch/deposit";
import { fetchAccount } from "../fetch/account";
import { AssetType, EventName, FactoryType } from "../utils/enums";
import { eventId } from "../utils/events";
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

  assetCreatedEvent(
    eventId(event),
    event.block.timestamp,
    asset.id,
    creator.id,
    AssetType.deposit
  );
  accountActivityEvent(
    creator,
    EventName.AssetCreated,
    event.block.timestamp,
    AssetType.deposit,
    asset.id
  );

  Deposit.create(event.params.token);
}
