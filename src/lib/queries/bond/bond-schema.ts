export const OffChainBondSchema = t.Object(
  {
    id: t.EthereumAddress({
      description: "The contract address of the bond token",
    }),
    isin: t.Optional(
      t.MaybeEmpty(
        t.Isin({
          description:
            "International Securities Identification Number for the bond token",
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
      "Off-chain data for bond tokens including financial identifiers and market value information",
  }
);
