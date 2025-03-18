import { defaultErrorSchema } from "@/lib/api/default-error-schema";
import { betterAuth, superJson } from "@/lib/utils/elysia";
import { Elysia, t } from "elysia";
import type { Address } from "viem";
import { getEquityDetail } from "./equity-detail";

export const EquityDetailResponseSchema = t.Object({
  id: t.String({
    description: "The unique identifier (address) of the equity contract",
  }),
  name: t.String({
    description: "The name of the equity token",
  }),
  symbol: t.String({
    description: "The symbol/ticker of the equity token",
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
    description: "Whether the equity contract is currently paused",
  }),
  creator: t.Object({
    id: t.String({
      description: "The address of the account that created the equity",
    }),
  }),
  holders: t.Array(
    t.Object({
      valueExact: t.BigInt({
        description: "The exact token balance of the holder (raw value)",
      }),
    })
  ),
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
  value_in_base_currency: t.Optional(
    t.Number({
      description: "The price of the equity token",
    })
  ),
});

export const EquityDetailApi = new Elysia()
  .use(superJson)
  .use(betterAuth)
  .get(
    "/:address",
    ({ params: { address } }) => {
      return getEquityDetail({ address: address as Address });
    },
    {
      auth: true,
      detail: {
        summary: "Get Equity",
        description:
          "Retrieves an equity token by address with details including supply and holder information.",
        tags: ["Equities"],
      },
      params: t.Object({
        address: t.String({
          description: "The address of the equity token",
        }),
      }),
      response: {
        200: EquityDetailResponseSchema,
        ...defaultErrorSchema,
      },
    }
  );
