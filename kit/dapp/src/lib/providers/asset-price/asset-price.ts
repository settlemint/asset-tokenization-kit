import { db } from "@/lib/db";
import { asset } from "@/lib/db/schema-asset-tokenization";
import { eq } from "drizzle-orm";

/**
 * Updates the price of an asset in the database
 */
export async function updateAssetPrice(
  assetId: string,
  valueInBaseCurrency: number
): Promise<boolean> {
  try {
    // Check if the asset exists
    const existingAsset = await db.query.asset.findFirst({
      where: eq(asset.id, assetId),
    });

    if (!existingAsset) {
      throw new Error(`Asset with ID ${assetId} not found`);
    }

    // Update the asset price
    await db
      .update(asset)
      .set({
        valueInBaseCurrency: valueInBaseCurrency.toString(),
      })
      .where(eq(asset.id, assetId));

    return true;
  } catch (error) {
    console.error("Error updating asset price:", error);
    throw error;
  }
}

/**
 * Gets the current price of an asset
 */
export async function getAssetPrice(assetId: string): Promise<number | null> {
  try {
    const assetData = await db.query.asset.findFirst({
      where: eq(asset.id, assetId),
    });

    if (!assetData || !assetData.valueInBaseCurrency) {
      return null;
    }

    return Number.parseFloat(assetData.valueInBaseCurrency.toString());
  } catch (error) {
    console.error("Error getting asset price:", error);
    throw error;
  }
}