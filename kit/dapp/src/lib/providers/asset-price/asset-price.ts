import { db } from "@/lib/db";
import { asset, assetPrice } from "@/lib/db/schema-asset-tokenization";
import { FiatCurrency } from "@/lib/utils/typebox/fiat-currency";
import { eq } from "drizzle-orm";
import { getAddress } from "viem";

/**
 * Updates the price of an asset in the database
 */
export async function updateAssetPrice(
  assetId: string,
  amount: number,
  currency: FiatCurrency
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
      .update(assetPrice)
      .set({
        amount: amount.toString(),
        currency,
      })
      .where(eq(assetPrice.assetId, getAddress(assetId)));

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
    const latestPrice = await db.query.assetPrice.findFirst({
      where: eq(assetPrice.assetId, getAddress(assetId)),
      orderBy: (assetPrice, { desc }) => [desc(assetPrice.createdAt)],
    });

    if (!latestPrice || !latestPrice.amount) {
      return null;
    }

    return Number.parseFloat(latestPrice.amount);
  } catch (error) {
    console.error("Error getting asset price:", error);
    throw error;
  }
}
