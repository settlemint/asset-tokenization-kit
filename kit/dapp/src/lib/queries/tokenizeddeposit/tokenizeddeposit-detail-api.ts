import { defaultErrorSchema } from "@/lib/api/default-error-schema";
import { betterAuth, superJson } from "@/lib/utils/elysia";
import { Elysia, t } from "elysia";
import type { Address } from "viem";
import { getTokenizedDepositDetail } from "./tokenizeddeposit-detail";

export const TokenizedDepositDetailResponseSchema = t.Object({
  id: t.String({
    description:
      "The unique identifier (address) of the tokenized deposit contract",
  }),
  name: t.String({
    description: "The name of the tokenized deposit",
  }),
  symbol: t.String({
    description: "The symbol/ticker of the tokenized deposit",
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
    description: "Whether the stablecoin contract is currently paused",
  }),
  creator: t.Object({
    id: t.String({
      description: "The address of the account that created the stablecoin",
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
  value_in_base_currency: t.Optional(
    t.Number({
      description: "The price of the tokenized deposit",
    })
  ),
});

export const TokenizedDepositApi = new Elysia()
  .use(superJson)
  .use(betterAuth)
  .get(
    "/:address",
    ({ params: { address } }) => {
      return getTokenizedDepositDetail({ address: address as Address });
    },
    {
      auth: true,
      detail: {
        summary: "Tokenized Deposit Detail",
        description:
          "Retrieves a tokenized deposit by address with details including supply, collateral, and holder information.",
        tags: ["Tokenized Deposits"],
      },
      params: t.Object({
        address: t.String({
          description: "The address of the tokenized deposit",
        }),
      }),
      response: {
        200: TokenizedDepositDetailResponseSchema,
        ...defaultErrorSchema,
      },
    }
  );
