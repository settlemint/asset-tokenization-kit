import { defaultErrorSchema } from "@/lib/api/default-error-schema";
import { betterAuth, superJson } from "@/lib/utils/elysia";
import { Elysia, t } from "elysia";
import type { Address } from "viem";
import { getStableCoinDetail } from "./stablecoin-detail";

export const StablecoinDetailResponseSchema = t.Object({
  id: t.String({
    description: "The unique identifier (address) of the stablecoin contract",
  }),
  name: t.String({
    description: "The name of the stablecoin token",
  }),
  symbol: t.String({
    description: "The symbol/ticker of the stablecoin token",
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
  collateral: t.Number({
    description:
      "The amount of collateral backing the stablecoin (formatted with decimals)",
  }),
  collateralRatio: t.Number({
    description:
      "The ratio of collateral to total supply, indicating the token's backing percentage",
  }),
  freeCollateral: t.Number({
    description:
      "The amount of unused/available collateral (formatted with decimals)",
  }),
  lastCollateralUpdate: t.Date({
    description: "The timestamp of the last collateral update",
  }),
  liveness: t.Number({
    description: "The liveness period for collateral-related operations",
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
  concentration: t.Number({
    description: "The concentration of holdings among top holders",
  }),
  collateralProofValidity: t.Optional(
    t.Date({
      description: "The date until which the collateral proof is valid",
    })
  ),
});

export const StablecoinDetailApi = new Elysia()
  .use(superJson)
  .use(betterAuth)
  .get(
    "/:address",
    ({ params: { address } }) => {
      return getStableCoinDetail({ address: address as Address });
    },
    {
      auth: true,
      detail: {
        summary: "Details",
        description:
          "Retrieves a stablecoin by address with details including supply, collateral, and holder information.",
        tags: ["stablecoin"],
      },
      params: t.Object({
        address: t.String({
          description: "The address of the stablecoin",
        }),
      }),
      response: {
        200: StablecoinDetailResponseSchema,
        ...defaultErrorSchema,
      },
    }
  );
