import { defaultErrorSchema } from "@/lib/api/default-error-schema";
import { betterAuth, superJson } from "@/lib/utils/elysia";
import { Elysia, t } from "elysia";
import type { Address } from "viem";
import { getFundDetail } from "./fund-detail";

export const FundDetailResponseSchema = t.Object({
  id: t.String({
    description: "The unique identifier (address) of the fund contract",
  }),
  name: t.String({
    description: "The name of the fund token",
  }),
  symbol: t.String({
    description: "The symbol/ticker of the fund token",
  }),
  decimals: t.Number({
    description: "The number of decimal places used by the token",
  }),
  totalSupply: t.Number({
    description:
      "The total supply of tokens in circulation (formatted with decimals)",
  }),
  totalSupplyExact: t.BigInt({
    description: "The exact total supply of tokens in circulation (raw value)",
  }),
  totalBurned: t.Number({
    description:
      "The total amount of tokens that have been burned (formatted with decimals)",
  }),
  totalBurnedExact: t.BigInt({
    description:
      "The exact total amount of tokens that have been burned (raw value)",
  }),
  totalHolders: t.Number({
    description: "The total number of unique addresses holding the token",
  }),
  paused: t.Boolean({
    description: "Whether the fund contract is currently paused",
  }),
  creator: t.Object({
    id: t.String({
      description: "The address of the account that created the fund",
    }),
  }),
  holders: t.Array(
    t.Object({
      valueExact: t.BigInt({
        description: "The exact token balance of the holder (raw value)",
      }),
    })
  ),
  asAccount: t.Object({
    balances: t.Array(
      t.Object({
        value: t.Number({
          description: "The balance value of an asset in the fund",
        }),
      })
    ),
  }),
  isin: t.Optional(
    t.Union([
      t.Null(),
      t.String({
        description:
          "The International Securities Identification Number (ISIN) if assigned",
      }),
    ])
  ),
  concentration: t.Number({
    description: "The concentration of holdings among top holders",
  }),
  assetsUnderManagement: t.Number({
    description: "The total value of assets under management in the fund",
  }),
});

export const FundDetailApi = new Elysia()
  .use(superJson)
  .use(betterAuth)
  .get(
    "/:address",
    ({ params: { address } }) => {
      return getFundDetail({ address: address as Address });
    },
    {
      auth: true,
      detail: {
        summary: "Get Fund",
        description:
          "Retrieves a fund by address with details including supply, assets, and holder information.",
        tags: ["Funds"],
      },
      params: t.Object({
        address: t.String({
          description: "The address of the fund",
        }),
      }),
      response: {
        200: FundDetailResponseSchema,
        ...defaultErrorSchema,
      },
    }
  );
