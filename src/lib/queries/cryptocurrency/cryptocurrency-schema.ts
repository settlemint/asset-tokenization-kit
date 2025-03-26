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
    valueInBaseCurrency: t.Number({
      minimum: 0,
      description: "The token's value in terms of the base fiat currency",
    }),
  },
  {
    description:
      "Off-chain data for cryptocurrency tokens including financial identifiers and market value information",
  }
);
