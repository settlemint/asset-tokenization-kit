import { defaultErrorSchema } from "@/lib/api/default-error-schema";
import { betterAuth, superJson } from "@/lib/utils/elysia";
import { Elysia, t } from "elysia";
import { getAssetPrice, updateAssetPrice } from "./asset-price";

const AssetPriceResponseSchema = t.Object({
  id: t.String({
    description: "The unique identifier (address) of the asset",
  }),
  price: t.Union([
    t.Number({
      description: "The current price of the asset in base currency",
    }),
    t.Null({
      description: "Null if the asset has no price set",
    }),
  ]),
});

const AssetPriceUpdateRequestSchema = t.Object({
  amount: t.Number({
    description: "The amount of the price",
  }),
  currency: t.FiatCurrency({
    description: "The currency of the price",
  }),
});

const AssetPriceUpdateResponseSchema = t.Object({
  success: t.Boolean({
    description: "Whether the update operation was successful",
  }),
  message: t.String({
    description: "A message describing the result of the operation",
  }),
  timestamp: t.String({
    description: "The timestamp when the update was completed",
  }),
});

export const AssetPriceApi = new Elysia()
  .use(betterAuth)
  .use(superJson)
  .get(
    "/:assetId",
    async ({ params: { assetId } }) => {
      const price = await getAssetPrice(assetId);
      return {
        id: assetId,
        price,
      };
    },
    {
      auth: true,
      detail: {
        summary: "Get Asset Price",
        description: "Retrieves the current price of an asset by its ID.",
        tags: ["provider"],
      },
      params: t.Object({
        assetId: t.String({
          description: "The ID of the asset",
        }),
      }),
      response: {
        200: AssetPriceResponseSchema,
        ...defaultErrorSchema,
      },
    }
  )
  .patch(
    "/:assetId",
    async ({ params: { assetId }, body }) => {
      try {
        await updateAssetPrice(assetId, body.amount, body.currency);
        return {
          success: true,
          message: `Price for asset ${assetId} updated successfully`,
          timestamp: new Date().toISOString(),
        };
      } catch (error) {
        return {
          success: false,
          message:
            error instanceof Error ? error.message : "Unknown error occurred",
          timestamp: new Date().toISOString(),
        };
      }
    },
    {
      auth: true,
      detail: {
        summary: "Update Asset Price",
        description: "Updates the price of an asset in the base currency.",
        tags: ["provider"],
      },
      params: t.Object({
        assetId: t.String({
          description: "The ID of the asset",
        }),
      }),
      body: AssetPriceUpdateRequestSchema,
      response: {
        200: AssetPriceUpdateResponseSchema,
        ...defaultErrorSchema,
      },
    }
  );
