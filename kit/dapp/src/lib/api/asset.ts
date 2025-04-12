import { defaultErrorSchema } from "@/lib/api/default-error-schema";
import { AssetUsersSchema } from "@/lib/queries/asset/asset-users-schema";
import { betterAuth, superJson } from "@/lib/utils/elysia";
import { Elysia } from "elysia";
import { getAssetSearch } from "../queries/asset/asset-search";
import { t } from "../utils/typebox";

export const AssetApi = new Elysia({
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
    "/search",
    async ({ query }) => {
      return getAssetSearch(query);
    },
    {
      auth: true,
      query: t.Object({
        searchTerm: t.String({
          description: "The search term to search for",
        }),
      }),
      detail: {
        summary: "List",
        description:
          "Retrieves a list of all bond tokens in the system with their details including supply, maturity, and holder information.",
        tags: ["bond"],
      },
      response: {
        200: t.Array(AssetUsersSchema),
        ...defaultErrorSchema,
      },
    }
  );
