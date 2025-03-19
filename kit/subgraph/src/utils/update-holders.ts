import { BigInt, Bytes, store } from "@graphprotocol/graph-ts";
import { AssetBalance } from "../../generated/schema";

/**
 * Updates the total holders count for an asset by counting the actual number of holders
 * This is a utility function to fix the totalHolders field that might be out of sync
 * 
 * @param assetId The ID of the asset to update
 * @param entityType The entity type (Bond, StableCoin, etc.)
 * @returns The actual number of holders
 */
export function updateTotalHolders(assetId: Bytes, entityType: string): i32 {
  // Query all AssetBalance entities for this asset
  const balances = store.loadRelated(entityType, assetId, "holders");
  
  // Count non-zero balances
  let count = 0;
  for (let i = 0; i < balances.length; i++) {
    const balance = balances[i] as AssetBalance;
    if (!balance.valueExact.equals(BigInt.zero())) {
      count++;
    }
  }
  
  return count;
}