import { db } from "@/lib/db";
import { asset, assetPrice } from "@/lib/db/schema-assets";
import { withAccessControl } from "@/lib/utils/access-control";
import { withTracing } from "@/lib/utils/tracing";
import { FiatCurrency } from "@/lib/utils/typebox/fiat-currency";
import { eq } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { ApiError } from "next/dist/server/api-utils";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { getAddress } from "viem";

/**
 * Updates the price of an asset in the database
 */
export const updateAssetPrice = withAccessControl(
  {
    requiredPermissions: {
      asset: ["manage"],
    },
  },
  async ({
    assetId,
    amount,
    currency,
  }: {
    assetId: string;
    amount: number;
    currency: FiatCurrency;
  }): Promise<boolean> => {
    try {
      // Check if the asset exists
      const existingAsset = await db.query.asset.findFirst({
        where: eq(asset.id, assetId),
      });

      if (!existingAsset) {
        throw new ApiError(404, `Asset with ID ${assetId} not found`);
      }

      // Update the asset price
      await db
        .update(assetPrice)
        .set({
          amount: amount.toString(),
          currency,
        })
        .where(eq(assetPrice.assetId, getAddress(assetId)));

      revalidateTag("asset-price");

      return true;
    } catch (error) {
      console.error("Error updating asset price:", error);
      throw error;
    }
  }
);

/**
 * Gets the current price of an asset
 */
export const getAssetPrice = withTracing(
  "queries",
  "getAssetPrice",
  async (assetId: string): Promise<number | null> => {
    "use cache";
    cacheTag("asset-price");

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
);
