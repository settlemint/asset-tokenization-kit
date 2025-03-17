import { betterAuth, superJson } from "@/lib/utils/elysia";
import { Elysia, t } from "elysia";
import { getStableCoinList } from "./stablecoin-list";

const StablecoinResponseSchema = t.Array(
  t.Object({
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
      description:
        "The exact total supply of tokens in circulation (raw value)",
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
  })
);

export const StablecoinListApi = new Elysia()
  .use(betterAuth)
  .use(superJson)
  .get(
    "/",
    () => {
      return getStableCoinList();
    },
    {
      auth: true,
      detail: {
        summary: "Get Stablecoin List",
        description:
          "Retrieves a list of all stablecoins in the system with their details including supply, collateral, and holder information.",
        tags: ["Stablecoins"],
      },
      response: {
        200: StablecoinResponseSchema,
        400: t.Object({
          error: t.String({
            description: "Bad Request - Invalid parameters or request format",
          }),
          details: t.Optional(t.Array(t.String())),
        }),
        401: t.Object({
          error: t.String({
            description: "Unauthorized - Authentication is required",
          }),
        }),
        403: t.Object({
          error: t.String({
            description:
              "Forbidden - Insufficient permissions to access the resource",
          }),
        }),
        404: t.Object({
          error: t.String({
            description: "Not Found - The requested resource does not exist",
          }),
        }),
        429: t.Object({
          error: t.String({
            description: "Too Many Requests - Rate limit exceeded",
          }),
          retryAfter: t.Optional(t.Number()),
        }),
        500: t.Object({
          error: t.String({
            description:
              "Internal Server Error - Something went wrong on the server",
          }),
          requestId: t.Optional(t.String()),
        }),
      },
    }
  );
