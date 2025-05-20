"use server";

import { isRegulationEnabled } from "@/lib/queries/regulations/regulation-enabled";
import type { AssetType } from "@/lib/utils/typebox/asset-types";

/**
 * Check if MICA regulation is available and enabled for an asset type
 * @param assettype The type of asset to check
 * @param assetId The ID of the asset to check
 * @returns True if MICA is available and enabled for this asset
 */
export async function checkMicaEnabled(assettype: AssetType, assetId: string) {
  const isAvailable = assettype === "deposit" || assettype === "stablecoin";
  if (!isAvailable) {
    return false;
  }

  return await isRegulationEnabled(assetId, "mica");
}
