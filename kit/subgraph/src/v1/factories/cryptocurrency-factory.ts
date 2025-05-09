import { CryptoCurrencyCreated } from "../../../generated/CryptoCurrencyFactory/CryptoCurrencyFactory";
import { CryptoCurrency } from "../../../generated/templates";
import { fetchAssetCount } from "../assets/fetch/asset-count";
import { fetchCryptoCurrency } from "../assets/fetch/cryptocurrency";
import { fetchAccount } from "../utils/account";
import { createActivityLogEntry, EventType } from "../utils/activity-log";
import { AssetType, FactoryType } from "../utils/enums";
import { fetchFactory } from "./fetch/factory";

export function handleCryptoCurrencyCreated(
  event: CryptoCurrencyCreated
): void {
  fetchFactory(event.address, FactoryType.cryptocurrency);
  const creator = fetchAccount(event.params.creator);
  const asset = fetchCryptoCurrency(event.params.token);
  asset.creator = creator.id;
  asset.deployedOn = event.block.timestamp;
  asset.save();

  const assetCount = fetchAssetCount(AssetType.cryptocurrency);
  assetCount.count = assetCount.count + 1;
  assetCount.save();

  createActivityLogEntry(event, EventType.AssetCreated, event.params.creator, [
    event.params.token,
    event.params.creator,
  ]);

  CryptoCurrency.create(event.params.token);
}
