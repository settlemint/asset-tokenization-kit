import { t } from "@/lib/utils/typebox";
import type { StaticDecode } from "@sinclair/typebox";

/**
 * TypeBox schema for cryptocurrency data
 *
 * Provides validation for cryptocurrency token information including:
 * contract address, name, symbol, supply metrics, holders, and market data
 */
export const OnChainCryptoCurrencySchema = t.Object(
  {
    id: t.EthereumAddress({
      description: "The contract address of the cryptocurrency token",
    }),
    name: t.String({
      description: "The full name of the cryptocurrency token",
    }),
    symbol: t.AssetSymbol({
      description: "The trading symbol or ticker of the cryptocurrency token",
    }),
    decimals: t.Decimals({
      description:
        "The number of decimal places used to display the token amount",
    }),
    totalSupply: t.BigDecimal({
      description:
        "The total supply of the token in a human-readable decimal format",
    }),
    totalSupplyExact: t.StringifiedBigInt({
      description:
        "The exact total supply of the token as a raw big integer value",
    }),
    totalHolders: t.Number({
      description: "The total number of unique addresses holding the token",
    }),
    creator: t.Object(
      {
        id: t.EthereumAddress({
          description: "The Ethereum address of the token creator",
        }),
      },
      {
        description: "Information about the token creator",
      }
    ),
    holders: t.Array(
      t.Object(
        {
          valueExact: t.StringifiedBigInt({
            type: "string",
            description:
              "The exact amount of tokens held by this holder as a raw big integer",
          }),
        },
        {
          description: "Information about a single token holder",
        }
      ),
      {
        description: "Array of top token holders, ordered by amount held",
      }
    ),
  },
  {
    description:
      "On-chain data for cryptocurrency tokens including contract address, name, symbol, supply metrics, holders, and creator information",
  }
);
export type OnChainCryptoCurrency = StaticDecode<
  typeof OnChainCryptoCurrencySchema
>;

export const OffChainCryptoCurrencySchema = t.Object(
  {
    id: t.EthereumAddress({
      description: "The contract address of the cryptocurrency token",
    }),
    isin: t.Optional(
      t.MaybeEmpty(
        t.Isin({
          description:
            "International Securities Identification Number, if applicable to this token",
        })
      )
    ),
    value_in_base_currency: t.Number({
      minimum: 0,
      description: "The token's value in terms of the base fiat currency",
    }),
  },
  {
    description:
      "Off-chain data for cryptocurrency tokens including financial identifiers and market value information",
  }
);
export type OffChainCryptoCurrency = StaticDecode<
  typeof OffChainCryptoCurrencySchema
>;

export const CalculatedCryptoCurrencySchema = t.Object(
  {
    concentration: t.Number({
      description:
        "The percentage of total supply held by the top holders, indicating ownership concentration",
    }),
  },
  {
    description:
      "Calculated fields for cryptocurrency tokens including ownership concentration",
  }
);
export type CalculatedCryptoCurrency = StaticDecode<
  typeof CalculatedCryptoCurrencySchema
>;

export const CryptoCurrencySchema = t.Intersect(
  [
    OnChainCryptoCurrencySchema,
    t.Partial(OffChainCryptoCurrencySchema),
    CalculatedCryptoCurrencySchema,
  ],
  {
    description:
      "Combined schema for complete cryptocurrency details including on-chain data, off-chain data, and calculated fields",
  }
);
export type CryptoCurrency = StaticDecode<typeof CryptoCurrencySchema>;
