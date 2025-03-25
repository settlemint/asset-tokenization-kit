import { defaultErrorSchema } from "@/lib/api/default-error-schema";
import { getAssetBalanceDetail } from "@/lib/queries/asset-balance/asset-balance-detail";
import { getAssetBalanceList } from "@/lib/queries/asset-balance/asset-balance-list";
import {
  AssetBalancePortfolioSchema,
  AssetBalanceSchema,
} from "@/lib/queries/asset-balance/asset-balance-schema";
import { getUserAssetsBalance } from "@/lib/queries/asset-balance/asset-balance-user";
import { betterAuth, superJson } from "@/lib/utils/elysia";
import { t } from "@/lib/utils/typebox";
import { Elysia } from "elysia";
import { getAddress } from "viem";

export const AssetBalanceApi = new Elysia({
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
      const address = query.asset ? getAddress(query.asset) : undefined;
      const wallet = query.wallet ? getAddress(query.wallet) : undefined;

      const balances = await getAssetBalanceList({
        address,
        wallet,
      });

      return balances;
    },
    {
      auth: true,
      detail: {
        summary: "List all balances",
        description:
          "Retrieves a list of all asset balances with optional filters for asset address or wallet address.",
        tags: ["balance"],
      },
      query: t.Object({
        asset: t.Optional(
          t.String({
            description: "Filter balances by asset address",
          })
        ),
        wallet: t.Optional(
          t.String({
            description: "Filter balances by wallet address",
          })
        ),
      }),
      response: {
        200: t.Array(AssetBalanceSchema),
        ...defaultErrorSchema,
      },
    }
  )
  .get(
    "/:asset/:account",
    async ({ params: { asset, account } }) => {
      const balance = await getAssetBalanceDetail({
        address: getAddress(asset),
        account: getAddress(account),
      });

      return balance;
    },
    {
      auth: true,
      detail: {
        summary: "Get balance details",
        description:
          "Retrieves balance details for a specific asset and account.",
        tags: ["balance"],
      },
      params: t.Object({
        asset: t.String({
          description: "The address of the asset",
        }),
        account: t.String({
          description: "The address of the account",
        }),
      }),
      response: {
        200: t.MaybeEmpty(AssetBalanceSchema),
        ...defaultErrorSchema,
      },
    }
  )
  .get(
    "/portfolio/:wallet",
    async ({ params: { wallet } }) => {
      const portfolio = await getUserAssetsBalance(getAddress(wallet));

      return portfolio;
    },
    {
      auth: true,
      detail: {
        summary: "Get user portfolio",
        description:
          "Retrieves complete portfolio information for a specific wallet, including asset distribution.",
        tags: ["balance"],
      },
      params: t.Object({
        wallet: t.String({
          description: "The wallet address to get portfolio for",
        }),
      }),
      response: {
        200: AssetBalancePortfolioSchema,
        ...defaultErrorSchema,
      },
    }
  );
