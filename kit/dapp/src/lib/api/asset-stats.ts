import { defaultErrorSchema } from "@/lib/api/default-error-schema";
import { getAssetStats } from "@/lib/queries/asset-stats/asset-stats";
import { AssetStatsSchema } from "@/lib/queries/asset-stats/asset-stats-schema";
import { betterAuth, superJson } from "@/lib/utils/elysia";
import { t } from "@/lib/utils/typebox";
import { Elysia } from "elysia";
import { getAddress } from "viem";

export const AssetStatsApi = new Elysia({
  detail: {
    security: [
      {
        apiKeyAuth: [],
      },
    ],
  },
})
  .use(betterAuth)
  .use(superJson)
  .get(
    "/:address",
    async ({ params: { address }, query }) => {
      const days = query.days ? parseInt(query.days) : undefined;
      return getAssetStats({
        address: getAddress(address),
        days,
      });
    },
    {
      auth: true,
      detail: {
        summary: "Asset Statistics",
        description:
          "Retrieves statistics for an asset by address, including supply metrics and transaction data.",
        tags: ["asset-stats"],
      },
      params: t.Object({
        address: t.String({
          description: "The Ethereum address of the asset contract",
        }),
      }),
      query: t.Object({
        days: t.Optional(
          t.String({
            description: "Number of days to look back (default: 1)",
          })
        ),
      }),
      response: {
        200: t.Array(AssetStatsSchema),
        ...defaultErrorSchema,
      },
    }
  );
