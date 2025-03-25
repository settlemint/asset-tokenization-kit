import { defaultErrorSchema } from "@/lib/api/default-error-schema";
import { getAssetActivity } from "@/lib/queries/asset-activity/asset-activity";
import { AssetActivitySchema } from "@/lib/queries/asset-activity/asset-activity-schema";
import { betterAuth, superJson } from "@/lib/utils/elysia";
import { t } from "@/lib/utils/typebox";
import { Elysia } from "elysia";

export const AssetActivityApi = new Elysia({
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
    "",
    async ({ query }) => {
      const limit = query.limit ? parseInt(query.limit) : undefined;

      const activity = await getAssetActivity({
        limit,
      });

      return activity;
    },
    {
      auth: true,
      detail: {
        summary: "List asset activity data",
        description:
          "Retrieves aggregated event counts for different types of asset activities.",
        tags: ["activity"],
      },
      query: t.Object({
        limit: t.Optional(
          t.String({
            description: "Maximum number of items to return",
          })
        ),
      }),
      response: {
        200: t.Array(AssetActivitySchema),
        ...defaultErrorSchema,
      },
    }
  );
