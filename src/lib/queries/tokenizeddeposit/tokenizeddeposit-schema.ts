export const OffChainTokenizedDepositSchema = t.Object(
  {
    id: t.EthereumAddress({
      description: "The contract address of the tokenized deposit",
    }),
    isin: t.Optional(
      t.MaybeEmpty(
        t.Isin({
          description:
            "International Securities Identification Number for the tokenized deposit",
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
      "Off-chain data for tokenized deposits including financial identifiers and market value information",
  }
);
