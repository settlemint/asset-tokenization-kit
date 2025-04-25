import { DvPSwapCreated } from "../../generated/DvPSwapFactory/DvPSwapFactory";
import { DvPSwap } from "../../generated/templates";
import { accountActivityEvent } from "../assets/events/accountactivity";
import { assetCreatedEvent } from "../assets/events/assetcreated";
import { fetchAssetCount } from "../assets/fetch/asset-count";
import { fetchAccount } from "../fetch/account";
import { fetchDvPSwap } from "../fetch/dvpswap";
import { AssetType, EventName } from "../utils/enums";
import { eventId } from "../utils/events";

/**
 * Handles DvPSwapCreated events from the DvPSwapFactory contract.
 * Ensures the factory and creator are registered as Accounts,
 * creates the DvPSwap asset entity, updates counts, logs events,
 * and starts indexing the new DvPSwap contract via template.
 * @param event The DvPSwapCreated event
 */
export function handleDvPSwapCreated(event: DvPSwapCreated): void {
  // Ensure the Factory contract itself is registered as an Account
  // This was the likely intent of the previous fetchFactory call.
  const factoryAccount = fetchAccount(event.address);
  // Optionally update factoryAccount fields if needed, e.g., lastActivity
  factoryAccount.lastActivity = event.block.timestamp; 
  factoryAccount.save();

  // Get creator account
  const creator = fetchAccount(event.params.creator);
  
  // Create or fetch the DvPSwap asset entity
  const asset = fetchDvPSwap(event.params.token, event.block.timestamp);
  asset.creator = creator.id;
  // Link the asset to its account representation if not already done in fetchDvPSwap
  const assetAsAccount = fetchAccount(event.params.token); 
  assetAsAccount.asAsset = asset.id; 
  assetAsAccount.save();
  asset.save();

  // Update asset count for DvPSwap type
  const assetCount = fetchAssetCount(AssetType.dvpswap);
  assetCount.count = assetCount.count + 1;
  assetCount.save();

  // Create event entities
  assetCreatedEvent(
    eventId(event),
    event.block.timestamp,
    asset.id,
    creator.id,
    AssetType.dvpswap
  );
  
  accountActivityEvent(
    creator,
    EventName.AssetCreated,
    event.block.timestamp,
    AssetType.dvpswap,
    asset.id
  );

  // Register DvPSwap contract for dynamic data source indexing
  DvPSwap.create(event.params.token);
} 