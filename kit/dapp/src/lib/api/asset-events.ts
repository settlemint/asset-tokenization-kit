import { defaultErrorSchema } from "@/lib/api/default-error-schema";
import { getAssetEventsList } from "@/lib/queries/asset-events/asset-events-list";
import { NormalizedEventsListItemSchema } from "@/lib/queries/asset-events/asset-events-schema";
import { betterAuth, superJson } from "@/lib/utils/elysia";
import { t } from "@/lib/utils/typebox";
import { Elysia } from "elysia";
import { getAddress } from "viem";

export const AssetEventsApi = new Elysia({
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
    "/",
    async ({ query }) => {
      const asset = query.asset ? getAddress(query.asset) : undefined;
      const sender = query.sender ? getAddress(query.sender) : undefined;
      const limit = query.limit ? parseInt(query.limit) : undefined;

      return getAssetEventsList({
        asset,
        sender,
        limit,
      });
    },
    {
      auth: true,
      detail: {
        summary: "List all events",
        description:
          "Retrieves a list of all asset events with optional filters for asset address, sender, and result limits.",
        tags: ["events"],
      },
      query: t.Object({
        asset: t.Optional(
          t.String({
            description: "Filter events by asset address",
          })
        ),
        sender: t.Optional(
          t.String({
            description: "Filter events by sender address",
          })
        ),
        limit: t.Optional(
          t.String({
            description: "Limit the number of results returned",
          })
        ),
      }),
      response: {
        200: t.Array(NormalizedEventsListItemSchema),
        ...defaultErrorSchema,
      },
    }
  )
  .get(
    "/:asset",
    ({ params: { asset } }) => {
      return getAssetEventsList({
        asset: getAddress(asset),
      });
    },
    {
      auth: true,
      detail: {
        summary: "List events for asset",
        description:
          "Retrieves a list of events for a specific asset by address.",
        tags: ["events"],
      },
      params: t.Object({
        asset: t.String({
          description: "The address of the asset",
        }),
      }),
      response: {
        200: t.Array(NormalizedEventsListItemSchema),
        ...defaultErrorSchema,
      },
    }
  );
